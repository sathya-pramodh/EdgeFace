from flask import Flask, current_app, jsonify, request, send_from_directory
from flask_cors import CORS, cross_origin
import os

from utils.segment_image import segment_image as seg_image

app = Flask(__file__)
CORS(app)


@app.route('/api/get-digit-recognizer', methods=['GET'])
@cross_origin(origins="*")
def get_face_recognizer():
    model_path = os.path.join(current_app.root_path,
                              "models")
    return send_from_directory(model_path, "mnist_simple_cnn.json")


@app.route('/api/group1-shard1of1.bin', methods=['GET'])
@cross_origin(origins="*")
def get_face_recognizer_shard():
    model_path = os.path.join(current_app.root_path,
                              "models")
    return send_from_directory(model_path, "group1-shard1of1.bin")


@app.route('/api/get-sample-image', methods=['GET'])
@cross_origin(origins="*")
def get_sample_image():
    digit_images = seg_image("tests/Adobe Scan 29-Aug-2024 (1)_page-0001.jpg")
    return jsonify({"images": digit_images})


@app.route('/api/segment-image', methods=['GET'])
@cross_origin(origins="*")
def segment_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    temp_file_path = "temp_image.jpg"
    image_file.save(temp_file_path)
    digit_images = seg_image(temp_file_path)
    os.remove(temp_file_path)
    return jsonify({"images": digit_images})


if __name__ == "__main__":
    app.run(debug=True)
