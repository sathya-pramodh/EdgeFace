#Please make sure you replace the file path with the correct absolute path (not relative path) to your image on line 52
#Also make sure to please install the required libraries
#To run the prediction, cd LiveFace/api/models and run the command: python multidigitmodel.py
#The confidence levels that are less than 0.8 for each character are replaced with a '?' in prediction
#Also theres an issue with tensorflow where tensorflow.python.keras.models.load_model is not compatible with tensorflow.keras.models.load_model
#So please use the below code to load the model

import cv2
import numpy as np
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt

def segment_image(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    _, thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])
    digit_images = []
    bounding_boxes = []
    
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 10 and h > 10:
            digit = thresh[y:y+h, x:x+w]
            # Add padding to ensure the digit is centered
            if h > w:
                pad = (h - w) // 2
                digit = cv2.copyMakeBorder(digit, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=0)
            elif w > h:
                pad = (w - h) // 2
                digit = cv2.copyMakeBorder(digit, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=0)
                
            digit = cv2.resize(digit, (28, 28))
            digit = digit.astype('float32') / 255.0
            digit = np.expand_dims(digit, axis=-1)  # Add channel dimension
            digit_images.append(digit)
            bounding_boxes.append((x, y, w, h))
    
    return digit_images, bounding_boxes, img

# Load the pre-trained model
model = load_model('mnist_simple_cnn.h5')

def predict_digits(image_path, confidence_threshold=0.5):
    digit_images, bounding_boxes, original_img = segment_image(image_path)
    predictions = []
    confidences = []
    
    for digit in digit_images:
        prediction = model.predict(np.expand_dims(digit, axis=0))
        max_confidence = np.max(prediction)
        confidences.append(max_confidence)
        if max_confidence > confidence_threshold:
            predicted_digit = np.argmax(prediction)
        else:
            predicted_digit = '?'  # Or apply any logic to handle low confidence
        predictions.append(str(predicted_digit))
    
    # Visualize the segmented images with bounding boxes and prediction scores
    plt.figure(figsize=(15, 5))
    plt.imshow(original_img, cmap='gray')
    
    for (x, y, w, h), pred, conf in zip(bounding_boxes, predictions, confidences):
        plt.gca().add_patch(plt.Rectangle((x, y), w, h, fill=False, edgecolor='red', linewidth=2))
        plt.text(x, y-10, f'{pred} ({conf:.2f})', color='red', fontsize=12)
    
    plt.title('Segmented Digits with Predictions')
    plt.axis('off')
    plt.show()
    
    return ''.join(predictions)

# Example usage
image_path = '/Users/mangalabhandarkar/LiveFace_MultiDigitModel/lib/Adobe Scan 29-Aug-2024 (1)_page-0001.jpg'  # Update this to the correct path
predicted_number = predict_digits(image_path)
print(f'Predicted Number: {predicted_number}')
