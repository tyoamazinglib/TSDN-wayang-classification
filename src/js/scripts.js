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
 const MODEL_URL = '../model/model.json';
 const status = document.getElementById('TFJSstatus');
 const modelStatus = document.getElementById('modelStatus');
 const video = document.getElementById('webcam');
 const enableWebcamButton = document.getElementById('webcamButton')
 const invisibleSection = document.getElementById('invisible');
 const invisibleButton = document.getElementById('invisibleButton');
 const liveView = document.getElementById('liveView');
 const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
 const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
 var vidWidth = 0;
 var vidHeight = 0;
 var xStart = 0;
 var yStart = 0;

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
    // Only continue if tYoLov5 has finished loading.
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
      video.onloadedmetadata = () => {
        vidWidth = $video.videoHeight;
        vidHeight = $video.videoWidth;
        //The start position of the video (from top left corner of the viewport)
        xStart = Math.floor((vw - vidWidth) / 2);
        yStart = (Math.floor((vh - vidHeight) / 2)>=0) ? (Math.floor((vh - vidHeight) / 2)):0;
        video.play();
        //Attach detection model to loaded data event:
        video.addEventListener('loadeddata', predictWebcam);
      }
    });
 }
 
 var children = [];

function predictWebcam() {
   // Now let's start classifying a frame in the stream.
   detectYolo(video).then(function () {
    window.requestAnimationFrame(predictWebcam)
   });
}

async function detectYolo(frame) {
  const input = tf.tidy(() => {
    return tf.image
    .resizeBilinear(tf.browser.fromPixels(frame), [vidHeight, vidWidth])
    .div(255.0)
    .expandDims(0);
  })

  let predictions = await model.executeAsync(input);
  renderPredictionBoxes(predictions[0].dataSync(), predictions[2].dataSync(), predictions[1].dataSync());
  input.dispose();
}

function renderPredictionBoxes (predictionBoxes, predictionClasses, predictionScores)
{
    //Remove all detections:
    for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
    }
    children.splice(0);
//Loop through predictions and draw them to the live view if they have a high confidence score.
    for (let i = 0; i < 99; i++) {
//If we are over 66% sure we are sure we classified it right, draw it!
        const minY = (predictionBoxes[i * 4] * vidHeight+yStart).toFixed(0);
        const minX = (predictionBoxes[i * 4 + 1] * vidWidth+xStart).toFixed(0);
        const maxY = (predictionBoxes[i * 4 + 2] * vidHeight+yStart).toFixed(0);
        const maxX = (predictionBoxes[i * 4 + 3] * vidWidth+xStart).toFixed(0);
        const score = predictionScores[i * 3] * 100;
        const width_ = (maxX-minX).toFixed(0);
        const height_ = (maxY-minY).toFixed(0);
//If confidence is above 70%
        if (score > 50 && score < 100){
            const p = document.createElement('p');
            p.innerText = predictionClasses[i * 3] + ' - with ' 
              + Math.round(score) 
              + '% confidence.';
            p.style = 'margin-left: ' + minX + 'px; margin-top: '
              + (minY - 10) + 'px; width: ' 
              + (width_ - 10) + 'px; top: 0; left: 0;';

            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + minX + 'px; ' +
                'top: ' + minY + 'px; ' +
                'width: ' + width_ + 'px; ' +
                'height: ' + height_ + 'px;';
            highlighter.innerHTML = '<p>'+Math.round(score) + '% ' + 'Your Object Name'+'</p>';
            liveView.appendChild(highlighter);
            liveView.appendChild(p);
            children.push(highlighter);
            children.push(p);
        }
    }
}


 async function loadModel() {
   loadedModel = undefined;
   loadedModel = await tf.loadGraphModel(MODEL_URL); //you can use your model.json path here

   return loadedModel
  }

 loadModel().then(function (loadedModel) {
   model = loadedModel;
   if(model){
    modelStatus.innerText = 'Loaded YoLoV5 model';
    // Show demo section now model is ready to use.
    invisibleSection.removeAttribute('id');
    invisibleButton.removeAttribute('id');
   }
 });