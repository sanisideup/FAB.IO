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
using UnityEngine.UI;
using UnityEngine.Audio;

public class SceneManager : MonoBehaviour
{
    #region variables

    public AudioRecorder recorder;
    public AudioPlayer player;
    public Button buttonStart, buttonStop;
    public Text labelRecordingStateValue, labelPlaybackStateValue;
    public Scrollbar scrollBarPitch, scrollBarFFT;
    public AudioMixer mixerPlayer;

    private AudioClip _currentClip;

    #endregion


    void Start()
    {
        if (mixerPlayer != null)
        {
            float valuePitch;
            if (mixerPlayer.GetFloat("PitchShifter", out valuePitch))
                scrollBarPitch.value = Mathf.InverseLerp(0.5f, 2f, valuePitch);
            float valueFFT;
            if (mixerPlayer.GetFloat("FFTShifter", out valueFFT))
                scrollBarFFT.value = Mathf.InverseLerp(256f, 4096f, valueFFT);
        }
    }

    void Update()
    {
        if (recorder != null)
            if (labelRecordingStateValue != null)
                labelRecordingStateValue.text = recorder.State.ToString();
        if (player != null)
            if (labelPlaybackStateValue != null)
                labelPlaybackStateValue.text = player.isPlaying.ToString();
    }

    void OnDestroy()
    {
        Unsubscribe();
    }

    public void UpdateScrollBarPitch(Scrollbar s)
    {
        if (mixerPlayer != null && s != null)
            mixerPlayer.SetFloat("PitchShifter", Mathf.Lerp(0.5f, 2f, s.value));
    }

    public void UpdateScrollBarFFT(Scrollbar s)
    {
        if (mixerPlayer != null && s != null)
            mixerPlayer.SetFloat("FFTShifter", Mathf.Lerp(256f, 4096f, s.value));
    }

    public void UpdateToggleAudioMixer(Toggle t)
    {
        if (t == null)
            return;
        if (scrollBarPitch != null)
        {
            scrollBarPitch.interactable = t.isOn;
            if (!t.isOn)
                scrollBarPitch.value = Mathf.InverseLerp(0.5f, 2f, 1f);
        }
        if (scrollBarFFT != null)
        {
            scrollBarFFT.interactable = t.isOn;
            if (!t.isOn)
                scrollBarFFT.value = Mathf.InverseLerp(256f, 4096f, 2048f);
        }
    }

    public void ClickButtonStart()
    {
        if (buttonStart != null)
            buttonStart.gameObject.SetActive(false);
        if (buttonStop != null)
            buttonStop.gameObject.SetActive(true);
        StartRecording();
    }

    public void ClickButtonStop()
    {
        if (buttonStart != null)
            buttonStart.gameObject.SetActive(true);
        if (buttonStop != null)
            buttonStop.gameObject.SetActive(false);
        StopRecording();
    }

    private void Subscribe()
    {
        if (recorder != null)
            recorder.OnRecordingEnd.AddListener(OnRecordingEnd);
        if (player != null)
            player.OnPlaybackEnd.AddListener(OnPlayingEnd);
    }

    private void Unsubscribe()
    {
        if (recorder != null)
            recorder.OnRecordingEnd.RemoveListener(OnRecordingEnd);
        if (player != null)
            player.OnPlaybackEnd.RemoveListener(OnPlayingEnd);
    }

    private void StartRecording()
    {
        Subscribe();
        if (recorder != null)
            recorder.StartRecording();
    }

    private void StopRecording()
    {
        Unsubscribe();
        if (recorder != null)
            recorder.StopRecording();
        if (player != null)
            player.StopPlaying();
    }

    private void OnRecordingEnd(AudioClip clip)
    {
        _currentClip = clip;
        if (player != null)
            player.StartPlaying(clip);
        else OnPlayingEnd(false);
    }

    private void OnPlayingEnd(bool b)
    {
        if (_currentClip != null)
            Destroy(_currentClip);
        if (b)
            if (recorder != null)
                recorder.StartRecording();
    }
}