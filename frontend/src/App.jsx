import { useRef, useState, useEffect } from "react";
import axios from "axios";

const LiveFace = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [recording, setRecording] = useState(false);
    const [chunks, setChunks] = useState([]);
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [totalCountdown, setTotalCountdown] = useState(0); // Total countdown time

    // const livenessPrompts = [
    //     "Raise your eyebrows as if surprised.",
    //     "Turn your head to the left.",
    //     "Turn your head to the right.",
    //     "Smile widely.",
    //     "Frown and then relax your face.",
    //     "Close your eyes for two seconds and then open them.",
    //     "Open your mouth wide and close it.",
    //     "Tilt your head up to look at the ceiling.",
    //     "Tilt your head down to look at the floor.",
    //     "Touch your nose with your right hand.",
    //     "Touch your nose with your left hand.",
    //     "Pinch your fingers together slowly.",
    //     "Wave your right hand.",
    //     "Wave your left hand.",
    //     "Nod your head up and down slowly.",
    //     "Shake your head from side to side slowly.",
    //     "Wink slowly with your left eye.",
    //     "Wink slowly with your right eye.",
    //     "Touch your right ear with your left hand.",
    //     "Touch your left ear with your right hand.",
    //     "Clap your hands twice gently.",
    //     "Place your right hand on top of your head.",
    //     "Place your left hand on top of your head.",
    //     "Raise your right hand as if to ask a question.",
    //     "Raise your left hand as if to ask a question.",
    //     "Cover your mouth with your right hand for a moment.",
    //     "Cover your mouth with your left hand for a moment.",
    //     "Touch your chin with your right hand.",
    //     "Touch your chin with your left hand.",
    //     "Scratch your head gently with your right hand.",
    //     "Scratch your head gently with your left hand.",
    //     "Place both hands on your cheeks and hold for two seconds.",
    //     "Point to the left with your right hand.",
    //     "Point to the right with your left hand.",
    //     "Place your right hand on your chest.",
    //     "Place your left hand on your chest.",
    //     "Raise both hands above your head.",
    //     "Lower both hands to your sides.",
    //     "Put your right hand on your shoulder.",
    //     "Put your left hand on your shoulder.",
    // ];

    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });
                videoRef.current.srcObject = stream;
                mediaRecorderRef.current = new MediaRecorder(stream, {
                    mimeType: "video/webm",
                });

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        setChunks((prevChunks) => [...prevChunks, event.data]);
                    }
                };

                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(chunks, { type: "video/webm" });
                    sendVideoToBackend(blob);
                    setChunks([]);
                };
            } catch (error) {
                console.error("Error accessing media devices.", error);
            }
        };

        getUserMedia();
    }, [chunks]);

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
        mediaRecorderRef.current.start();

        const [prompt1, prompt2] = await getRandomPrompts();

        // Display the first prompt immediately
        setCurrentPrompt(prompt1);
        startCountdown(10);

        // Schedule the second prompt to be displayed after 10 seconds
        setTimeout(() => {
            if (recording) {
                setCurrentPrompt(prompt2);
                startCountdown(10); // 10 seconds for second prompt
                setTotalCountdown(10); // Total countdown to stop recording after the second prompt
            }
        }, 10000); // 10 seconds
    };

    const handleStopRecording = () => {
        console.log("Stopping recording...");
        setRecording(false);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setCurrentPrompt("");
        setCountdown(0);
        setTotalCountdown(0);
    };

    const sendVideoToBackend = async (videoBlob) => {
        console.log("Sending video to backend...");
        // const formData = new FormData();
        // formData.append('video', videoBlob, 'recorded-video.webm');

        try {
            // await axios.post('http://localhost:5000/upload', formData, {
            //   headers: { 'Content-Type': 'multipart/form-data' },
            // });
            console.log("Video sent to backend successfully");
            console.log("Video sent to backend successfully");
        } catch (error) {
            console.error("Error sending video to backend:", error);
        }
    };

    return (
        <div>
            <h1>LiveFace</h1>
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
    );
};

export default LiveFace;
