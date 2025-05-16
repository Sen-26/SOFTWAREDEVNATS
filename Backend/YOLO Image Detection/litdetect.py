import matplotlib.pyplot as plt
from ultralytics import YOLO
import os
from flask import Flask, request, send_file, jsonify
import cv2
from flask_cors import CORS 
import tempfile

app = Flask(__name__)
CORS(app)
OUTPUT_DIR="C:/Users/joshu/OneDrive/Desktop/NCSSM Projects/SoftwareEngineering/softwaredevelopment/Frontend/assets"

os.makedirs(OUTPUT_DIR, exist_ok=True)

model = YOLO("Backend/YOLO Image Detection/model.pt")

@app.route("/process-image", methods=["POST"])
def process_image():
    if "file" not in request.files:
        return {"error": "No file uploaded"}, 400
    
    file = request.files["file"]
    image_path = os.path.join(OUTPUT_DIR, "uploaded_image.jpg")
    file.save(image_path) 
    
    results = model(image_path)
    
    annotated_image_path = os.path.join(OUTPUT_DIR, "annotated_image.jpg")
    results[0].save(filename=annotated_image_path)

    return send_file(annotated_image_path, mimetype="image/jpeg")

@app.route('/timestamp', methods=['POST'])
def detect():
    video_file = request.files["file"]
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
        video_path = tmp_file.name
        video_file.save(video_path)
    if not video_path:
        return jsonify({"error": "Missing video_path in request"}), 400
    
    
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
        print(f"Saved frame at: {frame_path}")
        return jsonify({"first_detection_time": round(first_detection_time, 2)})
        
    else:
        return jsonify({"message": "No objects detected in the video."})


@app.route('/frame', methods=['POST'])
def frame():
    video_file = request.files["file"]
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
        video_path = tmp_file.name
        video_file.save(video_path)
    if not video_path:
        return jsonify({"error": "Missing video_path in request"}), 400
    
    
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
        frame_path = os.path.join(OUTPUT_DIR, "first_detection.jpg")
        cv2.imwrite(frame_path, frame_to_save)
        print(f"Saved frame at: {frame_path}")
        return send_file(frame_path, mimetype="image/jpeg")
        
    else:
        return jsonify({"message": "No objects detected in the video."})
        

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
