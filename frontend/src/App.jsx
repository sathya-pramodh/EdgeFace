import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./App.css"

const LiveFace = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [recording, setRecording] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [totalCountdown, setTotalCountdown] = useState(0); // Total countdown time

  const promptVideos = {
    // "Raise your eyebrows as if surprised.": "/videos/eyebrowraise.mp4",
    // "Smile widely.":"/videos/widesmile.mp4",
    // "Frown and then relax your face.":"/videos/frown.mp4",
    // "Close your eyes for two seconds and then open them.":"/videos/2eyeclose.mp4",
    // "Turn your head to the left.":"/videos/headleft.mp4",
    // "Turn your head to the right.":"/videos/headright.mp4",
    // "Tilt your head up to look at the ceiling.":"/videos/headup.mp4",
    // "Tilt your head down to look at the floor.":"/videos/headdown.mp4",
     "Open your mouth wide and close it.":"/videos/mouthopen.mp4",
    //"Touch your nose with your right hand.":"/videos/rightnosetouch.mp4",
    // Add other mappings here
  };
  const livenessPrompts = [
    // "Raise your eyebrows as if surprised.",
    // "Smile widely.",
    // "Frown and then relax your face.",
    // "Close your eyes for two seconds and then open them.",
    // "Turn your head to the left.",
    // "Turn your head to the right.",
    // "Tilt your head up to look at the ceiling.",
    // "Tilt your head down to look at the floor.",
    "Open your mouth wide and close it.",
    //"Touch your nose with your right hand.",
  ];

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
  }, []);

  const getRandomPrompts = () => {
    const shuffled = [...livenessPrompts].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
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

    const [prompt1, prompt2] = getRandomPrompts();

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
      console.log("Video sent to backend successfully");
    } catch (error) {
      console.error("Error sending video to backend:", error);
    }
  };

  return (
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
          </div>
        )}
      </div>
    </div>
  );
  
};

export default LiveFace;
