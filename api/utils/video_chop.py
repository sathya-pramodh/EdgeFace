import cv2
import base64

def video_to_model_input(video_stream):

    cap = cv2.VideoCapture(video_stream)

    frames = []
    count = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        count += 1
        if count%50 == 0:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(rgb_frame)

    cap.release()

    encoded_frames = []
    for frame in frames:
        _, buffer = cv2.imencode('.jpeg', frame)

        encoded_frame = base64.b64encode(buffer).decode('utf-8')
        
        encoded_frames.append(encoded_frame)

    return encoded_frames
