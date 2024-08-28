import tensorflow as tf
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

def getnumber(img):
    model = tf.keras.models.load_model('digit_recognition.h5')
    
    img = img.resize((28, 28))
    img_array = np.array(img)

    inverted_img_array = 255 - img_array
    inverted_img_array = inverted_img_array.astype('float32') / 255.0
    inverted_img_array = inverted_img_array.reshape(1, 28, 28, 1)

    prediction = model.predict(inverted_img_array)

    # Get the predicted digit
    predicted_digit = np.argmax(prediction)
    print(f"Predicted digit: {predicted_digit}")

    return predicted_digit
