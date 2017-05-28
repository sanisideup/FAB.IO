//----------------------------------------------------------------------------------
// Speech Auto Detector
// Copyright (c) 2017 Garpix Ltd.
//
// Author Homepage: https://garpix.com
// Support: support@garpix.com
// License: Asset Store Terms of Service and EULA
// License URI: See LICENSE file in the project root for full license information.
//----------------------------------------------------------------------------------

using UnityEngine;
using UnityEngine.Events;
using System;

[Serializable] public class AudioRecorderEvent : UnityEvent { }
[Serializable] public class AudioRecorderClipEvent : UnityEvent<AudioClip> { }

[RequireComponent(typeof(AudioSource))]
public class AudioRecorder : MonoBehaviour
{
    public enum RecordingState { Stop = 0, Prepare, Sleep, Record }

    #region variables

    public float noiseMin = 0.1f;
    public int frequency = 44100;
    public int timeForRecording = 600;
    public float timeForSilence = 2f;

    public AudioRecorderEvent OnRecordingStart;
    public AudioRecorderClipEvent OnRecordingEnd;

    public RecordingState State { get { return _state; } }
    public float currentFrameAverage { get; private set; }

    private AudioSource _sourceRecording;
    private RecordingState _state = RecordingState.Stop;
    private float[] _clipSampleData = new float[1024];
    private float _time = 0f;
    private int _frequency = 16000;
    private int _startSample = 0;
    private string _micName;

    #endregion


    void Awake()
    {
        _sourceRecording = GetComponent<AudioSource>();
    }

    void Update()
	{
        currentFrameAverage = 0f;

        if (_state != RecordingState.Stop)
        {
            currentFrameAverage = GetCurrentFrameAverage();

            if (_state == RecordingState.Sleep)
            {
                if (currentFrameAverage > noiseMin)
                {
                    _state = RecordingState.Record;
                    _startSample = _sourceRecording.timeSamples - (int)(_frequency * 0.2f);
                    if (_startSample < 0)
                        _startSample = 0;
                }
            }
            if (_state == RecordingState.Record)
            {
                _time = currentFrameAverage > noiseMin ? 0f : _time + Time.deltaTime;
                if (_time > 2f && _sourceRecording.timeSamples > _frequency * timeForSilence)
                    StopRecording();
            }
        }
	}

    public bool StartRecording()
    {
        if (Microphone.devices.Length < 1)
        {
            Debug.LogWarning("Microphone was not find");
            return false;
        }

        _micName = Microphone.devices[0];
        _state = RecordingState.Prepare;
#if UNITY_ANDROID
        int minFreq, maxFreq;
        Microphone.GetDeviceCaps(_micName, out minFreq, out maxFreq);
        minFreq = Mathf.Max(minFreq, 100);
        maxFreq = Mathf.Max(maxFreq, 100);
        _frequency = Mathf.Clamp(frequency, minFreq, maxFreq);
#else
        _frequency = Mathf.Clamp(frequency, 100, 44100);
#endif

        _sourceRecording.clip = Microphone.Start(_micName, false, timeForRecording, _frequency);
        while (Microphone.GetPosition(_micName) <= 0) { }
        _state = RecordingState.Sleep;
        _sourceRecording.Play();
        if (OnRecordingStart != null)
            OnRecordingStart.Invoke();
        return true;
    }

    public void StopRecording()
    {
        if (Microphone.devices.Length < 1)
            return;

        _state = RecordingState.Stop;
        _time = 0f;

        int samplesCount = _sourceRecording.timeSamples - _frequency - _startSample;
        if (samplesCount > 0)
        {
            float[] samples = new float[samplesCount];
            _sourceRecording.clip.GetData(samples, _startSample);
            AudioClip clip = AudioClip.Create("audio", samplesCount, _sourceRecording.clip.channels, _frequency, false);
            clip.SetData(samples, 0);
            if (OnRecordingEnd != null)
                OnRecordingEnd.Invoke(clip);
        }
        Microphone.End(_micName);
        _sourceRecording.Stop();
        if (_sourceRecording.clip != null)
            Destroy(_sourceRecording.clip);
    }

    public float GetCurrentFrameAverage()
    {
        if (_sourceRecording != null)
        {
            _sourceRecording.GetSpectrumData(_clipSampleData, 0, FFTWindow.Rectangular);
            foreach (var v in _clipSampleData)
                currentFrameAverage += Mathf.Abs(v);
            currentFrameAverage = currentFrameAverage / _clipSampleData.Length * 1000;
            return currentFrameAverage;
        }
        return 0f;
    }
}