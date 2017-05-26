//
// API.AI Unity SDK Sample
// =================================================
//
// Copyright (C) 2015 by Speaktoit, Inc. (https://www.speaktoit.com)
// https://www.api.ai
//
// ***********************************************************************************************************************
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//
// ***********************************************************************************************************************

using UnityEngine;
using UnityEngine.UI;
using System;
using System.IO;
using System.Collections;
using System.Reflection;
using ApiAiSDK;
using ApiAiSDK.Model;
using ApiAiSDK.Unity;
using Newtonsoft.Json;
using System.Net;
using System.Collections.Generic;

public class ApiAiModule : MonoBehaviour
{

    public Text answerTextField;
    public Text inputTextField;
    public ApiAiUnity apiAiUnity;
    private AudioSource aud;
    public AudioClip listeningSound;

    private readonly JsonSerializerSettings jsonSettings = new JsonSerializerSettings
    { 
        NullValueHandling = NullValueHandling.Ignore,
    };

    private readonly Queue<Action> ExecuteOnMainThread = new Queue<Action>();

    // Use this for initialization
    IEnumerator Start()
    {
        // check access to the Microphone
        yield return Application.RequestUserAuthorization(UserAuthorization.Microphone);
        if (!Application.HasUserAuthorization(UserAuthorization.Microphone))
        {
            throw new NotSupportedException("Microphone using not authorized");
        }

        ServicePointManager.ServerCertificateValidationCallback = (a, b, c, d) =>
        {
            return true;
        };
       // const string ACCESS_TOKEN = "ce8fddfc767a4b97b2cdd891f913f892";
        const string ACCESS_TOKEN = "3485a96fb27744db83e78b8c4bc9e7b7";
        var config = new AIConfiguration(ACCESS_TOKEN, SupportedLanguage.English);

        apiAiUnity = new ApiAiUnity();
        apiAiUnity.Initialize(config);

        apiAiUnity.OnError += HandleOnError;
        apiAiUnity.OnResult += HandleOnResult;
    }

    void HandleOnResult(object sender, AIResponseEventArgs e)
    {
        RunInMainThread(() => {
            var aiResponse = e.Response;
            if (aiResponse != null)
            {

                Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]In HandleOnResult");
                Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]aiResponse.Result.ResolvedQuery: ");

                //ce8fddfc767a4b97b2cdd891f913f892
                Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]" + aiResponse.Result.ResolvedQuery);
                answerTextField.text = aiResponse.Result.ResolvedQuery;
                answerTextField.text = APIAICall(aiResponse.Result.ResolvedQuery);
                
            } else
            {
                Debug.LogError("Response is null");
            }
        });
    }
    
    void HandleOnError(object sender, AIErrorEventArgs e)
    {
        RunInMainThread(() => {
            Debug.LogException(e.Exception);
            Debug.Log(e.ToString());
            answerTextField.text = e.Exception.Message;
        });
    }
    
    // Update is called once per frame
    void Update()
    {
        if (apiAiUnity != null)
        {
            apiAiUnity.Update();
        }

        // dispatch stuff on main thread
        while (ExecuteOnMainThread.Count > 0)
        {
            ExecuteOnMainThread.Dequeue().Invoke();
        }
    }

    private void RunInMainThread(Action action)
    {
        ExecuteOnMainThread.Enqueue(action);
    }

    public void PluginInit()
    {
        
    }
    
    public void StartListening()
    {
       // this.Start();
        Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]StartListening");
            
        if (answerTextField != null)
        {
            answerTextField.text = "Listening...";
        }
            
        aud = GetComponent<AudioSource>();
        apiAiUnity.StartListening(aud);

    }
    
    public void StopListening()
    {
        try
        {
            Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]StopListening");

            if (answerTextField != null)
            {
                answerTextField.text = "";
            }
            apiAiUnity.StopListening();
        } catch (Exception ex)
        {
            Debug.LogException(ex);
        }
    }
    
    public void SendText()
    {
        var text = inputTextField.text;

        Debug.Log(text);

        AIResponse response = apiAiUnity.TextRequest(text);

        if (response != null)
        {
            Debug.Log("Resolved query: " + response.Result.ResolvedQuery);
            var outText = JsonConvert.SerializeObject(response, jsonSettings);

            Debug.Log("Result: " + outText);

            answerTextField.text = outText;
        } else
        {
            Debug.LogError("Response is null");
        }

    }

    public void StartNativeRecognition()
    {
        try
        {
            apiAiUnity.StartNativeRecognition();
        } catch (Exception ex)
        {
            Debug.LogException(ex);
        }
    }
    public string APIAICall(string query)
    {
        Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]In APIAICall90");
        //var client = new RestClient("https://api.api.ai/v1/query?query=what%20is%20my%20current%20balance%3F&v=20150910&sessionId=1&lang=en");
        //var request = new RestRequest(Method.GET);
        //request.AddHeader("postman-token", "2614ee88-b8e9-6bbd-2c15-ccaa792c5136");
        //request.AddHeader("cache-control", "no-cache");
        //request.AddHeader("authorization", "Bearer ce8fddfc767a4b97b2cdd891f913f892");
        //IRestResponse response = client.Execute(request);
        // https://api.api.ai/v1/query?query=what is my current balance?&v=20150910&sessionId=1&lang=en
        query = query.Replace(" ", "%20");
        var form = new WWWForm();
        var headers = new Hashtable();
        headers.Add("Authorization", "Bearer ce8fddfc767a4b97b2cdd891f913f892");

        string request = "https://api.api.ai/v1/query?query=" + query + "&v=20150910&sessionId=1&lang=en";
        var www = new WWW(request, null, headers);
        // www.WaitUntilDoneIfPossible();
        WaitForRequest(www);
        var i = 0;
        while (!www.isDone)
        {
            Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]"+i);
            i++;
            if (i > 5000)
                break;
        }
            Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]" + www.text);
        // answerTextField.text = www.text;
        if (www.isDone)
        {
            Debug.Log("[xxxxxxxxxxxxxxxxxxxxxxx]In ParseAPAIResult()");
            string input = (string) www.text;
            answerTextField.text = input;
            input = input.Substring(input.IndexOf("fulfillment"), input.IndexOf("score") - input.IndexOf("fulfillment"));
            input = input.Substring(input.IndexOf("speech")+10 , input.IndexOf("source") - (input.IndexOf("speech") + 17));
            input = input.Replace("\",", "");
            return input;
        }
        else return "Error Occurred";
            
    }
    IEnumerator WaitForRequest(WWW www)
    {
        yield return www;
        // check for errors
        if (www.error == null)
        {
            Debug.Log("WWW Ok!: " + www.text);
        }
        else
        {
            Debug.Log("WWW Error: " + www.error);
        }
    }
}
