import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import '@tensorflow/tfjs-backend-webgl';
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

                mediaRecorderRef.current.ondataavailable = async (event) => {
                    if (event.data.size > 0) {
                        const blob = new Blob([event.data], { type: "video/webm" });
                        const imgs = await sendVideoToBackend(blob);
                        await getModelInference(imgs);
                    }
                };
                const getModelInference = async (imgs) => {
                    console.log("Data is being processed");

                    const model = await cocoSsd.load();

                    const predictionPromises = imgs.map(img => model.detect(img));
                    const predictions = await Promise.all(predictionPromises);

                    console.log('Predictions:');
                    console.log(predictions);
                };
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

    const handleStartRecording = async () => {
        console.log("Starting recording...");
        setRecording(true);

        // Ensure mediaRecorderRef.current is initialized
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.start();

            try {
                const [randomNumber] = await getRandomPrompts();

                // Display the random number as the prompt
                setCurrentPrompt(`Write down this number: ${randomNumber}`);
                startCountdown(10);

            } catch (error) {
                console.error("Error fetching prompts:", error);
                // Handle errors if prompts cannot be fetched
                setRecording(false);
            }
        } else {
            console.error("MediaRecorder is not initialized.");
        }
    };

    const handleStopRecording = () => {
        console.log("Stopping recording...");
        setRecording(false);
        setCurrentPrompt("");
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    }

    const sendVideoToBackend = async (videoBlob) => {
        console.log("Sending video to backend...");
        const formData = new FormData();
        formData.append('video', videoBlob, 'recorded-video.webm');

        try {
            const resp = await axios.post('http://localhost:5000/api/upload_video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const frames = resp.data.frames;
            console.log("Video sent to backend successfully");
            const imageElements = frames.map(frameBase64 => {
                const img = new Image();
                img.src = `data:image/jpeg;base64,${frameBase64}`;
                return img;
            });

            await Promise.all(imageElements.map(img => new Promise(resolve => img.onload = resolve)));

            return imageElements;
        } catch (error) {
            console.error("Error sending video to backend:", error);
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
                            <div className={recording ? "video-container" : ""}>
                                <video ref={videoRef} autoPlay playsInline />
                            </div>
                            {recording && (
                                <div className="instruction-box-container">
                                    <div className="instruction-box">
                                        <div className="icon-text">
                                            <span className="material-icons">info</span>
                                            <p>Hold the prompted number below the line</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div>
                                <p>{currentPrompt}</p>
                                {countdown > 0 && (
                                    <p>Time remaining: {countdown}s</p>
                                )}
                            </div>
                            <button onClick={recording ? handleStopRecording : handleStartRecording}>
                                {recording ? "Stop Recording" : "Start Recording"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveFace;
