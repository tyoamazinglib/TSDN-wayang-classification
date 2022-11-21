/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

 const status = document.getElementById('TFJSstatus');
 const modelStatus = document.getElementById('modelStatus');
 const video = document.getElementById('webcam');
 const enableWebcamButton = document.getElementById('webcamButton')
 const invisibleSection = document.getElementById('invisible');
 const invisibleButton = document.getElementById('invisibleButton');
 const liveView = document.getElementById('liveView');

 TFJSstatus.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;
 
 // Check if webcam access is supported.
 function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
  
 // Enable the live webcam view and start classification.
 function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
 }

 var children = [];

 function predictWebcam() {
   // Now let's start classifying a frame in the stream.
   model.detect(video).then(function (predictions) {
     for (let i = 0; i < children.length; i++) {
       liveView.removeChild(children[i]);
     }
     children.splice(0);
     

     for (let n = 0; n < predictions.length; n++) {
       if (predictions[n].score > 0.5) {
         const p = document.createElement('p');
         p.innerText = predictions[n].class  + ' - with ' 
             + Math.round(parseFloat(predictions[n].score) * 100) 
             + '% confidence.';
         p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
             + (predictions[n].bbox[1] - 10) + 'px; width: ' 
             + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
 
         const highlighter = document.createElement('div');
         highlighter.setAttribute('class', 'highlighter');
         highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
             + predictions[n].bbox[1] + 'px; width: ' 
             + predictions[n].bbox[2] + 'px; height: '
             + predictions[n].bbox[3] + 'px;';
 
         liveView.appendChild(highlighter);
         liveView.appendChild(p);
         children.push(highlighter);
         children.push(p);
       }
     }
     
     // Call this function again to keep predicting when the browser is ready.
     window.requestAnimationFrame(predictWebcam);
   });
 }

 // Store the resulting model in the global scope of our app.
 var model = undefined;

 cocoSsd.load().then(function (loadedModel) {
   model = loadedModel;
   if(model){
    modelStatus.innerText = 'Loaded YoLoV5 model';
    // Show demo section now model is ready to use.
    invisibleSection.removeAttribute('id');
    invisibleButton.removeAttribute('id');
 }
 });