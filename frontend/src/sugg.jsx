import React, { useState } from 'react';
import './sugg.css';

const Suggestions = ({ onSubmit }) => {
  const [suggestion, setSuggestion] = useState('');
  const [authenticationResult, setAuthenticationResult] = useState('');
  const [easeOfUse, setEaseOfUse] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      suggestion,
      authenticationResult,
      easeOfUse,
      recommendation,
      additionalFeedback,
    });
    setSuggestion('');
    setAuthenticationResult('');
    setEaseOfUse('');
    setRecommendation('');
    setAdditionalFeedback('');
    setSubmitted(true);
  };

  return (
    <div className="suggestions-container">
      {submitted ? (
        <div className="imgcont"> 
          <div className="typing-container">
            <h1>Thank you for using LiveFace!</h1>
          </div>
          <div className="bimg-container">
            <img src="./img/effectbg.jpg" alt="LiveFace" className="img" />
          </div>
        </div>
      ) : (
        <>
          <h2 className="suggestions-header">We value your feedback!</h2>
          <form className="suggestions-form" onSubmit={handleSubmit}>
            <label className="suggestions-label">
              Was the final authentication result correct?
              <div className="suggestions-radio-group">
                <label>
                  <input
                   required
                    type="radio"
                    name="authenticationResult"
                    value="Yes"
                    checked={authenticationResult === 'Yes'}
                    onChange={(e) => setAuthenticationResult(e.target.value)}
                  />
                  Yes
                </label>
                <label>
                  <input
                    required
                    type="radio"
                    name="authenticationResult"
                    value="No"
                    checked={authenticationResult === 'No'}
                    onChange={(e) => setAuthenticationResult(e.target.value)}
                  />
                  No
                </label>
              </div>
            </label>

            <label className="suggestions-label">
              How easy was it to use the application?
              <div className="suggestions-radio-group">
                <label>
                  <input
                  required
                    type="radio"
                    name="easeOfUse"
                    value="Very Easy"
                    checked={easeOfUse === 'Very Easy'}
                    onChange={(e) => setEaseOfUse(e.target.value)}
                  />
                  Very Easy
                </label>
                <label>
                  <input
                  required
                    type="radio"
                    name="easeOfUse"
                    value="Somewhat Easy"
                    checked={easeOfUse === 'Somewhat Easy'}
                    onChange={(e) => setEaseOfUse(e.target.value)}
                  />
                  Somewhat Easy
                </label>
                <label>
                  <input
                  required
                    type="radio"
                    name="easeOfUse"
                    value="Neutral"
                    checked={easeOfUse === 'Neutral'}
                    onChange={(e) => setEaseOfUse(e.target.value)}
                  />
                  Neutral
                </label>
                <label>
                  <input
                  required
                    type="radio"
                    name="easeOfUse"
                    value="Somewhat Difficult"
                    checked={easeOfUse === 'Somewhat Difficult'}
                    onChange={(e) => setEaseOfUse(e.target.value)}
                  />
                  Somewhat Difficult
                </label>
                <label>
                  <input
                  required
                    type="radio"
                    name="easeOfUse"
                    value="Very Difficult"
                    checked={easeOfUse === 'Very Difficult'}
                    onChange={(e) => setEaseOfUse(e.target.value)}
                  />
                  Very Difficult
                </label>
              </div>
            </label>

            <label className="suggestions-label">
              Would you recommend this application to others?
              <div className="suggestions-radio-group">
                <label>
                  <input
                  required
                    type="radio"
                    name="recommendation"
                    value="Yes"
                    checked={recommendation === 'Yes'}
                    onChange={(e) => setRecommendation(e.target.value)}
                  />
                  Yes
                </label>
                <label>
                  <input
                  required
                    type="radio"
                    name="recommendation"
                    value="No"
                    checked={recommendation === 'No'}
                    onChange={(e) => setRecommendation(e.target.value)}
                  />
                  No
                </label>
              </div>
            </label>

            <label className="suggestions-label">
              Additional feedback:
              <textarea
                className="suggestions-textarea"
                value={additionalFeedback}
                onChange={(e) => setAdditionalFeedback(e.target.value)}
                rows="4"
                cols="50"
              />
            </label>

            <button type="submit" className="suggestions-button">Submit</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Suggestions;
