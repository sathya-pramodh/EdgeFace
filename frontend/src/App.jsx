import { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const LiveFace = () => {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [currentPrompt, setCurrentPrompt] = useState("");
    const [recording, setRecording] = useState(false);
    const [chunks, setChunks] = useState([]);
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [totalCountdown, setTotalCountdown] = useState(0);

    const [fadeComplete, setFadeComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeComplete(true);
        }, 3000); // Match the duration of the fadeOut animation (6 seconds)

        return () => clearTimeout(timer);
    }, []);

    const promptVideos = {
        "Raise your eyebrows as if surprised.": "/videos/eyebrowraise.mp4",
        "Smile widely.": "/videos/widesmile.mp4",
        "Frown and then relax your face.": "/videos/frown.mp4",
        "Close your eyes for two seconds and then open them.": "/videos/2eyeclose.mp4",
        "Turn your head to the left.": "/videos/headleft.mp4",
        "Turn your head to the right.": "/videos/headright.mp4",
        "Tilt your head up to look at the ceiling.": "/videos/headup.mp4",
        "Tilt your head down to look at the floor.": "/videos/headdown.mp4",
        "Open your mouth wide and close it.": "/videos/mouthopen.mp4",
        "Touch your nose with your right hand.": "/videos/rightnosetouch.mp4",
        "Touch your nose with your left hand.": "/videos/leftnosetouch.mp4",
        "Touch your right ear with your left hand.": "/videos/rightearlefthand.mp4",
        "Touch your left ear with your right hand.": "/videos/leftearrighthand.mp4",
        "Shake your head from side to side slowly.": "/videos/headshake.mp4",
        "Wave your right hand.": "/videos/righthandwave.mp4",
        "Wave your left hand.": "/videos/lefthandwave.mp4",
        "Wink slowly with your left eye.": "/videos/lefteyewink.mp4",
        "Wink slowly with your right eye.": "/videos/righteyewink.mp4",
        "Nod your head up and down slowly.": "/videos/slownod.mp4",
        "Cover your mouth with your right hand for a moment.": "/videos/righthandmouth.mp4",
        "Cover your mouth with your left hand for a moment.": "/videos/lefthandmouth.mp4",
        "Touch your chin with your right hand.": "/videos/chinrighttouch.mp4",
        "Touch your chin with your left hand.": "/videos/chinlefttouch.mp4",
        "Place your left hand on top of your head.": "/videos/lefthandonhead.mp4",
        "Place your right hand on top of your head.": "/videos/righthandonhead.mp4",
        "Raise your left hand as if to ask a question.": "/videos/lefthandraise.mp4",
        "Raise your right hand as if to ask a question.": "/videos/righthandraise.mp4",
        "Clap your hands twice gently.": "/videos/2clap.mp4",
        "Scratch your head gently with your left hand.": "/videos/lefthandscratch.mp4",
        "Scratch your head gently with your right hand.": "/videos/righthandscratch.mp4",
        "Put your left hand on your shoulder.": "/videos/leftonsh.mp4",
        "Put your right hand on your shoulder.": "/videos/rightonsh.mp4",
        "Point to the left with your right hand.": "/videos/pointleftwithright.mp4",
        "Point to the right with your left hand.": "/videos/pointrightwithleft.mp4",
        "Place your left hand on your chest.": "/videos/leftchest.mp4",
        "Place your right hand on your chest.": "/videos/rightchest.mp4",
        "Place both hands on your cheeks and hold for two seconds.": "/videos/bothonface.mp4",
        "Raise both hands above your head.": "/videos/raiseboth.mp4",
        "Pinch your fingers together slowly.": "/videos/pinching.mp4",
        "Lower both hands to your sides.": "/videos/handlower.mp4",
    };

    useEffect(() => {
        if (!fadeComplete) return;
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
    }, [chunks, fadeComplete])

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
            setCurrentPrompt(prompt2);
            startCountdown(10); // 10 seconds for second prompt
            setTotalCountdown(10); // Total countdown to stop recording after the second prompt
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
        } catch (error) {
            console.error("Error sending video to backend:", error);
        }
    };

    return (
        <div id="root">
            {!fadeComplete && (
                <div id="fade-out-div" className="fade-out">LiveFace</div>
            )}
            {fadeComplete && (
                <>
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
                </>
            )}
        </div>
    );
};
export default LiveFace;
