import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-cpu'
import Instructions from './inst.jsx';

const LiveFace = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [recording, setRecording] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [totalCountdown, setTotalCountdown] = useState(0);

    const [showInstructions, setShowInstructions] = useState(true);

    const handleProceed = () => {
        setShowInstructions(false);
    };

    const promptVideos = {
        // Prompt videos mapping
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
            } catch (error) {
                console.error("Error accessing media devices.", error);
            }
        };

        const getModelInference = async (imgs) => {
            console.log("Data is being processed");

            const mobilenet = await import('@tensorflow-models/coco-ssd');
            const model = await cocoSsd.load();

            const predictionPromises = imgs.map(img => model.detect(img));
            const predictions = await Promise.all(predictionPromises);

            console.log('Predictions:');
            console.log(predictions);
        };
        getUserMedia();
    }, [showInstructions]);

    const getRandomPrompts = async () => {
        const handGesturePrompt = (await axios.get("http://localhost:5000/api/get-hand-gesture-prompt")).data.gesture;
        const headGesturePrompt = (await axios.get("http://localhost:5000/api/get-head-gesture-prompt")).data.gesture;
        return [handGesturePrompt, headGesturePrompt];
    };

    const startCountdown = (seconds) => {
        setCountdown(seconds);
        if (countdownInterval) clearInterval(countdownInterval);

        const intervalId = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setCountdownInterval(intervalId);
    };

    useEffect(() => {
        if (totalCountdown > 0 && recording) {
            const intervalId = setInterval(() => {
                setTotalCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalId);
                        handleStopRecording(); // Stop recording when total countdown reaches zero
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(intervalId);
        }
    }, [totalCountdown, recording]);

    const handleStartRecording = async () => {
        console.log("Starting recording...");
        setRecording(true);

        // Ensure mediaRecorderRef.current is initialized
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.start();

            try {
                const [prompt1, prompt2] = await getRandomPrompts();

                // Display the first prompt immediately
                setCurrentPrompt(prompt1);
                startCountdown(10);

                // Schedule the second prompt to be displayed after 10 seconds
                setTimeout(() => {
                    setCurrentPrompt(prompt2);
                    startCountdown(10); // 10 seconds for second prompt
                    setTotalCountdown(10); // Total countdown to stop recording after the second prompt
                }, 10000); // 10 seconds
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

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        } else {
            console.error("MediaRecorder is not initialized.");
        }

        // Clear any active countdowns or prompts
        setCurrentPrompt("");
        setCountdown(0);
        setTotalCountdown(0);
    };

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

    return (
        <div>
            {showInstructions ? (
                <Instructions onProceed={handleProceed} />
            ) : (
                <div id="root">
                    <h1>LiveFace</h1>
                    <div className="liveface-container">
                        <div className="recording-section">
                            <video ref={videoRef} autoPlay playsInline />
                            <div>
                                <p>{currentPrompt}</p>
                                {countdown > 0 && (
                                    <p>Time remaining for current prompt: {countdown}s</p>
                                )}
                            </div>
                            <button onClick={recording ? handleStopRecording : handleStartRecording}>
                                {recording ? "Stop Recording" : "Start Recording"}
                            </button>
                        </div>
                        {currentPrompt && (
                            <div className="prompt-video-section">
                                <video
                                    src={promptVideos[currentPrompt]}
                                    autoPlay
                                    loop
                                    muted
                                />
                                <p className="instruction-text">Please perform a similar movement</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveFace;
