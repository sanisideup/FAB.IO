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
using System.Collections;

[Serializable] public class AudioPlayerEvent : UnityEvent { }
[Serializable] public class AudioPlayerBoolEvent : UnityEvent<bool> { }

[RequireComponent(typeof(AudioSource))]
public class AudioPlayer : MonoBehaviour
{
    #region variables

    public AudioPlayerEvent OnPlaybackStart;
    public AudioPlayerBoolEvent OnPlaybackEnd;

    public bool isPlaying { get { return _sourcePlayback != null && _sourcePlayback.isPlaying; } }

    private AudioSource _sourcePlayback;
    private Coroutine _coroutinePlayback;

    #endregion


    void Awake()
    {
        _sourcePlayback = GetComponent<AudioSource>();
    }

    public bool StartPlaying(AudioClip clip)
    {
        if (clip == null)
            return false;
        StopPlaying();
        _coroutinePlayback = StartCoroutine(Playing(clip));
        if (OnPlaybackStart != null)
            OnPlaybackStart.Invoke();
        return true;
    }

    public void StopPlaying()
    {
        _sourcePlayback.Stop();
        _sourcePlayback.clip = null;
        if (_coroutinePlayback != null)
        {
            StopCoroutine(_coroutinePlayback);
            _coroutinePlayback = null;
        }
        if (OnPlaybackEnd != null)
            OnPlaybackEnd.Invoke(false);
    }

    private IEnumerator Playing(AudioClip clip)
    {
        if (clip.loadState == AudioDataLoadState.Unloaded)
            clip.LoadAudioData();
        while (clip.loadState == AudioDataLoadState.Loading)
            yield return new WaitForSeconds(0.1f);
        if (clip.loadState == AudioDataLoadState.Loaded)
        {
            _sourcePlayback.clip = clip;
            _sourcePlayback.Play();
            while (_sourcePlayback.isPlaying)
                yield return new WaitForSeconds(0.1f);
            _sourcePlayback.Stop();
            _sourcePlayback.clip = null;
            if (OnPlaybackEnd != null)
                OnPlaybackEnd.Invoke(true);
        }
    }
}