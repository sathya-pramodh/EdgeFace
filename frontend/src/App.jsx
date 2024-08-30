import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import '@tensorflow/tfjs-backend-webgl';
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-cpu';
import Instructions from './inst.jsx';

const LiveFace = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [recording, setRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false); // State for voice prompts

    const handleProceed = () => {
        setShowInstructions(false);
    };

    const generateRandomNumber = () => {
        return Math.floor(Math.random() * 9000) + 1000;
    };

    const getRandomPrompts = async () => {
        const randomNumber = generateRandomNumber();
        return [randomNumber];
    };

    useEffect(() => {
        if (showInstructions) return;

        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;
                mediaRecorderRef.current = new MediaRecorder(stream, {
                    mimeType: "video/webm",
                });
            } catch (error) {
                console.error("Error accessing media devices.", error);
            }
        };

        getUserMedia();
    }, [showInstructions]);

    const startCountdown = (seconds) => {
        setCountdown(seconds);
        if (countdownInterval) clearInterval(countdownInterval);

        const intervalId = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    handleStopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setCountdownInterval(intervalId);
    };

    const handleClickPicture = async () => {
        try {
            const [randomNumber] = await getRandomPrompts();

            
            setCurrentPrompt(`Write down this number: ${randomNumber}`);
            
            
            var number = parseInt(randomNumber);
            number = number.toString();
            console.log(number);
            const canvas = document.createElement("canvas");
            const video = videoRef.current;
            
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            
            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            
            const imageDataURL = canvas.toDataURL("image/jpeg");
            console.log("Image Data URL: ", imageDataURL);
            
            
            const base64ImageData = imageDataURL.split(",")[1];
            console.log(base64ImageData);
    
            
            const byteString = atob(base64ImageData);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
    
            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }
    
            const blob = new Blob([uint8Array], { type: "image/jpeg" });
            console.log("Blob: ",blob);
            
            const result = await sendImageToBackend(blob);
            console.log(result)
            return result;
        } catch (error) {
            console.error("Error capturing and sending image:", error);
        }
        // TODO: Add animations here depending on the result
        // if it is false tell the user it was unsuccesful and make page refresh so user can try again
        // if it is true show it as success and show "Thank you for using" page
        // or something like that.
    };
    

    const getModelInference = async (face, digits) => {
        console.log("Data is being processed");

        const model = await cocoSsd.load();

        const predictions = await model.detect(face);

        console.log(predictions);
        var coco_class;
        if (predictions && predictions.length > 0) {
            coco_class = predictions[0].class;
        } else {
            coco_class = false;
        }
        
        const digitModel = await tf.loadGraphModel("http://localhost:5000/api/get-digit-recognizer");
        console.log(digitModel);
        
        for (const digit of digits) {
            
            const digitArray = new Float32Array(digit.flat()); // Flatten if necessary
        
            
            const digitTensor = tf.tensor4d(digitArray, [1, 28, 28, 1]); // Shape should be [batch_size, height, width, channels]
        
            
            const prediction = digitModel.predict(digitTensor);
        
            
            const predictionArray = await prediction.array(); // Convert the Tensor to an array
            console.log(predictionArray);
        
            
            const predictedDigit = predictionArray[0].indexOf(Math.max(...predictionArray[0]));
            console.log(`Predicted Digit: ${predictedDigit}`);
        }
        if (coco_class == 'person') {
            return true;
        } else {
            return false;
        }
    };
    

    const createImageFromBase64 = (base64String) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = `data:image/jpeg;base64,${base64String}`;
        });
    }

    const sendImageToBackend = async (blob) => {
        console.log("Sending video to backend...");
        const formData = new FormData();
        formData.append('image', blob, 'captured-image.jpeg');
        console.log(blob.size);
        for (let [key, value] of formData.entries()) {
            console.log(`FormData entry - Key: ${key}, Value:`, value);
        }
        try {
            console.log("Sending images...");
            const resp = await axios.post('http://localhost:5000/api/upload_image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("Image sent to backend successfully: ",resp.data);
            const faceImage = resp.data.face;
            const digitImages = resp.data.digit;
            
            const face = await createImageFromBase64(faceImage);
            const result = await getModelInference(face, digitImages);
            return result;
        } catch (error) {
            console.error("Error sending image to backend:", error);
        }
    };

    useEffect(() => {
        if (voiceEnabled && currentPrompt) {
            const speak = (text) => {
                const utterance = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.speak(utterance);
            };

            speak(currentPrompt);
        }
    }, [currentPrompt, voiceEnabled]);

    return (
        <div>
            {showInstructions ? (
                <Instructions onProceed={handleProceed} voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled} />
            ) : (
                <div id="root">
                    <h1>LiveFace</h1>
                    <div className="liveface-container">
                        <div className="recording-section">
                            <div className={"video-container"}>
                                <video ref={videoRef} autoPlay playsInline />
                            </div>
                            ()
                                <div className="instruction-box-container">
                                    <div className="instruction-box">
                                        <div className="icon-text">
                                            <span className="material-icons">info</span>
                                            <p>Hold the prompted number below the line</p>
                                        </div>
                                    </div>
                                </div>
                            <div>    
                                <p>{currentPrompt}</p>
                            </div>
                            <button onClick={handleClickPicture}>
                                {"Click Picture"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveFace;
