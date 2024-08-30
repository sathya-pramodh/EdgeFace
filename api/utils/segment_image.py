import cv2
import numpy as np
from PIL import Image
import io
import base64

def segment_number_image(image):
    # Convert PIL image to numpy array
    img = np.array(image.convert('L'))  # Convert to grayscale
    _, thresh = cv2.threshold(
        img, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    contours = sorted(contours, key=lambda c: cv2.boundingRect(c)[0])
    digit_images = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 10 and h > 10:
            digit = thresh[y:y+h, x:x+w]
            # Add padding to ensure the digit is centered
            if h > w:
                pad = (h - w) // 2
                digit = cv2.copyMakeBorder(
                    digit, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=0)
            elif w > h:
                pad = (w - h) // 2
                digit = cv2.copyMakeBorder(
                    digit, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=0)

            digit = cv2.resize(digit, (28, 28))
            digit = digit.astype('float32') / 255.0
            digit = np.expand_dims(digit, axis=-1)  # Add channel dimension
            digit_images.append(digit)

    digit_images_list = [digit.tolist() for digit in digit_images]

    return digit_images_list

def segment_image(image):
    
    if isinstance(image, Image.Image):
        img = image
    else:
        img = Image.open(image)
    
    width, height = img.size

    height_60 = int(0.6 * height)
    height_40 = height - height_60

    face = img.crop((0, 0, width, height_60))
    digit = img.crop((0, height_60, width, height_40 + height_60))

    face_base64 = pil_image_to_base64(face)
    digit_images_list = list(segment_number_image(digit))
    
    return face_base64, digit_images_list

def pil_image_to_base64(image):
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str
