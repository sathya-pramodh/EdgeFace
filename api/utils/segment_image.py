import cv2
import numpy as np


def segment_image(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
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
                    digit, 0, 0, pad, pad, cv2.BORDER_CONSTANT, value=[0])
            elif w > h:
                pad = (w - h) // 2
                digit = cv2.copyMakeBorder(
                    digit, pad, pad, 0, 0, cv2.BORDER_CONSTANT, value=[0])

            digit = cv2.resize(digit, (28, 28))
            digit = digit.astype('float32') / 255.0
            digit = np.expand_dims(digit, axis=0)
            digit_images.append(digit.tolist())

    return digit_images
