from mtcnn import MTCNN
import cv2

def video_to_model_output(video_stream):

    cap = cv2.VideoCapture(video_stream)

    detector = MTCNN()
    results = []
    count = 0

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        if count % 50 == 0:
            detections = detector.detect_faces(rgb_frame)

            if detections:

                confidence = detections[0]['confidence']
                results.append(confidence)
            
            else:

                results.append(0.0)
        count += 1

    cap.release()
    return sum(results)/len(results)
