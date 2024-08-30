from flask import Flask, current_app, jsonify, request, send_from_directory
from flask_cors import CORS, cross_origin
import os
from PIL import Image

from utils.segment_image import segment_image as seg_image

app = Flask(__file__)
CORS(app)


@app.route('/api/get-digit-recognizer', methods=['GET'])
@cross_origin(origins="*")
def get_face_recognizer():
    model_path = os.path.join(current_app.root_path,
                              "models/model.json")
    return send_from_directory(model_path, "model.json")


@app.route('/api/group1-shard1of1.bin', methods=['GET'])
@cross_origin(origins="*")
def get_face_recognizer_shard():
    model_path = os.path.join(current_app.root_path,
                              "models/model.json")
    return send_from_directory(model_path, "group1-shard1of1.bin")

@app.route('/api/upload_image', methods=['POST', 'GET'])
@cross_origin(origins="*")
def segment_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    
    try:
        # Open the image using PIL
        image = Image.open(image_file.stream)

        image_path = "uploaded_image.jpeg"
        image.save(image_path) 

        face, digits = seg_image(image_path)

        os.remove(image_path)

        return jsonify({
            "face":face,
            "digit":digits,
        }), 200

    except Exception as e:
        return jsonify({"error": "Failed to process image", "details": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
