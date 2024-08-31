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
    const [showInstructions, setShowInstructions] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [reloadCount, setReloadCount] = useState(4);
    const [timer, setTimer] = useState(30);
    const timerRef = useRef(null);
    const [authenticationFailed, setAuthenticationFailed] = useState(false);

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

    const initializeVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            videoRef.current.srcObject = stream;
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: "video/webm",    
            });
            console.log("Generating prompt...");
            const [randomNumber] = await getRandomPrompts();
            setCurrentPrompt(`Write down this number: ${randomNumber}`);
            resetTimer();
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    };

    useEffect(() => {
        if (showInstructions) return;
        initializeVideoStream();
    }, [showInstructions]);

    const handleClickPicture = async () => {
        try {
            clearInterval(timerRef.current);
            resetTimer();

            console.log("Capturing image...");

            const canvas = document.createElement("canvas");
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataURL = canvas.toDataURL("image/jpeg");
            const base64ImageData = imageDataURL.split(",")[1];
            const byteString = atob(base64ImageData);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);

            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([uint8Array], { type: "image/jpeg" });

            console.log("Sending image to backend...");

            const result = await sendImageToBackend(blob);

            console.log("Result from model:", result);

            if (result) {
                setIsAuthenticated(true);
            } else {
                if (reloadCount > 0) {
                    setIsAuthenticated(false);
                    setReloadCount(prevCount => prevCount - 1);
                } else {
                    setAuthenticationFailed(true);
                    alert("Maximum retries reached.");
                }
            }
        } catch (error) {
            console.error("Error capturing and sending image:", error);
        }
    };

    const handleRetry = () => {
        setIsAuthenticated(null);
        initializeVideoStream();
    };

    const getModelInference = async (face, digits) => {
        const model = await cocoSsd.load();
        const predictions = await model.detect(face);
        let coco_class;

        if (predictions && predictions.length > 0) {
            coco_class = predictions[0].class;
        } else {
            coco_class = false;
        }

        const digitModel = await tf.loadGraphModel("http://localhost:5000/api/get-digit-recognizer");

        for (const digit of digits) {
            const digitArray = new Float32Array(digit.flat());
            const digitTensor = tf.tensor4d(digitArray, [1, 28, 28, 1]);
            const prediction = digitModel.predict(digitTensor);
            const predictionArray = await prediction.array();
            const predictedDigit = predictionArray[0].indexOf(Math.max(...predictionArray[0]));
            console.log(`Predicted Digit: ${predictedDigit}`);
        }

        return coco_class === 'person';
    };

    const createImageFromBase64 = (base64String) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = `data:image/jpeg;base64,${base64String}`;
        });
    };

    const sendImageToBackend = async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'captured-image.jpeg');

        try {
            const resp = await axios.post('http://localhost:5000/api/upload_image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
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

    useEffect(() => {
        if (timer <= 0) {
            clearInterval(timerRef.current);
            setIsAuthenticated(false);
            console.log("Timer ran out. Retry available.");
            if (reloadCount > 0) {
                setReloadCount(prevCount => prevCount - 1);
            } else {
                setAuthenticationFailed(true);
                alert("Maximum retries reached.");
            }
        }
    }, [timer]);

    const resetTimer = () => {
        clearInterval(timerRef.current);
        setTimer(30);
        timerRef.current = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
    };

    return (
        <div>
            {showInstructions ? (
                <Instructions onProceed={handleProceed} voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled} />
            ) : isAuthenticated === null ? (
                <div id="root">
                    <h1>LiveFace</h1>
                    <div className="liveface-container">
                        <div className="recording-section">
                            <div className="video-container">
                                <video ref={videoRef} autoPlay playsInline />
                            </div>
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
                                Click Picture
                            </button>
                            <div>
                                <p>Timer: {timer} seconds</p>
                                <p>You have {reloadCount} tries remaining</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : isAuthenticated ? (
                <div className="authentication-container">
                    <h1>Authenticated successfully</h1>
                    <div className="auth-tick-container">
                        <img src="./img/auth.png" alt="Authentication Successful" className="auth-tick" />
                    </div>
                    <p className="msg">Thank you for using LiveFace!</p>
                </div>
            ) : (
                <div>
                    <h1>Authentication Failed</h1>
                    <p>Please try again.</p>
                    <button onClick={handleRetry}>
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};

export default LiveFace;
