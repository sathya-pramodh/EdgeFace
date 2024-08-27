# Real-Time Face Liveness Detection

This project implements a browser-based face liveness detection system using machine learning models. The system is designed to detect whether the face presented in the camera feed is live or a spoof (e.g., photo, video).

## Features
- **Real-Time Video Processing**: Captures live video from the user's camera.
- **ML-Based Liveness Detection**: Uses a machine learning model to detect face liveness in real-time.
- **Browser-Compatible**: Works across major browsers (Chrome, Firefox, Edge) using TensorFlow.js or ONNX.js.

## Workflow Overview

### 1. Setup and Installation
1. **Clone the Repository**:
   ```bash
   git clone [https://github.com/sathya-pramodh/LiveFace.git]
   cd LiveFace
2. **Model**:
- Select a model(for now we can build one later with a novel architecture) which is lightweight but with great accuracy such as https://arxiv.org/pdf/1909.13522 what Amogh suggested.

3. **Workflow as discussed for now**:
- **Camera Access**: Upon accessing the application, grant camera access must be provided to start the video feed. The video feed will be displayed on the web page.
- **Real-Time Liveness Detection**: The application should capture frames from the video feed at regular intervals. Each frame is sent to the server or processed directly in the browser(most likely) to determine liveness. The liveness status is displayed in real-time.
  
4. **Development Notes**:
- **Server-Side Processing**: Frames captured from the video feed are sent to the Flask server, where they are preprocessed and passed through the liveness detection model.
- **Client-Side Processing**: Alternatively, use TensorFlow.js or ONNX.js to run the model directly in the browser, reducing latency and server load.
