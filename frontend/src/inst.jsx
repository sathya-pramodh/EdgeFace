import React, { useEffect, useState } from 'react';
import './inst.css';

const Instructions = ({ onProceed, voiceEnabled, setVoiceEnabled }) => {
    const [fadeComplete, setFadeComplete] = useState(false);

    useEffect(() => {
        const fadeOutDiv = document.getElementById('fade-out-div');
        if (fadeOutDiv) {
            fadeOutDiv.style.animation = 'fadeOut 3s forwards';
            setTimeout(() => {
                fadeOutDiv.style.display = 'none';
                setFadeComplete(true);
            }, 3000); // Matches the duration of the fadeOut animation
        }
    }, []);

    const handleVoiceToggle = () => {
        setVoiceEnabled(!voiceEnabled);
    };

    return (
        <div className="instructions-page">
            {!fadeComplete && (
                <div id="fade-out-div">
                    <div>LiveFace</div>
                </div>
            )}
            {fadeComplete && (
                <div className="instruction-content">
                    <h1>Instructions</h1>
                    <p>Please read these instructions carefully and ensure you follow them:</p>
                    <ol>
                        <li>Read the prompts and perform the actions as shown</li>
                        <li>Please keep an A4 size paper and a <b>MARKER</b> handy before you start recording</li>
                        <li>Ensure the complete movement you are performing is visible in the frame</li>
                        <li>Ensure consistent lighting to avoid shadows or glare</li>
                        <li>Maintain proper distance from the camera to keep movements clear</li>
                        <li>Perform movements slowly and clearly for better recognition</li>
                        <li>Keep the camera steady to avoid shaking or blurring</li>
                        <li>Record movements from multiple angles if possible</li>
                    </ol>
                    <button onClick={onProceed}>Proceed</button>
                    <div>
                        <br></br>
                        <label>
                            <input
                                type="checkbox"
                                checked={voiceEnabled}
                                onChange={handleVoiceToggle}
                            />
                            Enable Voice Prompts
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Instructions;
