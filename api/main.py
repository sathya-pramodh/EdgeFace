from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

from utils.hand_gesture import generate_hand_gesture
from utils.head_gesture import generate_head_gesture
from utils.model import video_to_model_output

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

### Function to upload the video and get model output
@app.route('/api/upload-video', methods=["POST"])
def upload_video():
    
    ### TODO: Get the Video Stream from the frontend ###
    
    return jsonify({"confidence scores"})

if __name__ == "__main__":
    app.run()
