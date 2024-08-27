from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import os

from utils.hand_gesture import generate_hand_gesture
from utils.head_gesture import generate_head_gesture
from utils.video_chop import video_to_model_input

app = Flask(__file__)
CORS(app)

@app.route("/api/get-hand-gesture-prompt", methods=["GET"])
@cross_origin(origin='*')
def get_hand_gesture_prompt():
    """
    # Methods: ```GET```

    # Return:
    ```json
    {
        "gesture": <description of gesture>
    }
    ```

    # Example:
    ```json
    {
        "gesture": "Pinch your fingers together slowly."
    }
    ```
    """
    gesture = generate_hand_gesture()
    return jsonify({"gesture": gesture})


@app.route("/api/get-head-gesture-prompt", methods=["GET"])
@cross_origin(origin='*')
def get_head_gesture_prompt():
    """
    # Methods: ```GET```

    # Return:
    ```json
    {
        "gesture": <description of gesture>
    }
    ```

    # Example:
    ```json
    {
        "gesture": "Frown and then relax your face."

    }
    ```
    """
    gesture = generate_head_gesture()
    return jsonify({"gesture": gesture})

@app.route('/api/upload_video', methods=['POST','GET'])
@cross_origin(origin='*')
def upload_video():
    
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    video_file = request.files['video']
    print(video_file)

    # Saving file to temp loc
    temp_file_path = 'temp_video.webm'
    video_file.save(temp_file_path)
    print("video saved")
    
    frames = video_to_model_input(temp_file_path)
    print(frames)

    #os.remove(temp_file_path)

    return jsonify({"frames": frames})

if __name__ == "__main__":
    app.run(debug=True)
