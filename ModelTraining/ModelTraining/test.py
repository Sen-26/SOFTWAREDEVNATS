import torch
import cv2
import os
from ultralytics import YOLO

print(torch.cuda.is_available())  
print(torch.cuda.device_count())  
print(torch.cuda.get_device_name(0))  

model = YOLO("runs/detect/train3/weights/best.pt")  

video_path = "IMG_9802.mov"
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS)  

results = model(video_path, save=True)  

first_detection_time = None
initial_objects = 0
current_objects = 0
frame_to_save = None

for frame_idx, result in enumerate(results):
    ret, frame = cap.read()
    if not ret:
        break
    if frame_idx <= 10:
        initial_objects += len(result.boxes)
        initial_objects *= 0.35
    else:
        current_objects += len(result.boxes)
        current_objects *= 0.35
    if current_objects > initial_objects:
        first_detection_time = frame_idx / fps
        frame_to_save = frame.copy()
        break

cap.release()

if first_detection_time is not None and frame_to_save is not None:
    prediction_base = "runs/detect/"
    prediction_folders = [f for f in os.listdir(prediction_base) if f.startswith("predict")]
    latest_prediction_folder = max(prediction_folders, key=lambda x: int(x.replace("predict", "") or 0))
    prediction_dir = os.path.join(prediction_base, latest_prediction_folder)

    frame_path = os.path.join(prediction_dir, "first_detection.jpg")
    cv2.imwrite(frame_path, frame_to_save)

    print(f"First object detected at: {first_detection_time:.2f} seconds")
    print(f"Saved frame at: {frame_path}")
else:
    print("No objects detected in the video.")
