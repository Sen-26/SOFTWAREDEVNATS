from flask import Blueprint, request, jsonify, send_file
import os
import tempfile
import cv2
import base64
from ultralytics import YOLO
from app.auth.routes import token_required

detection_bp = Blueprint('detection', __name__)
OUTPUT_DIR = "saved"
os.makedirs(OUTPUT_DIR, exist_ok=True)
model = YOLO("model.pt")

@detection_bp.route("/process-image", methods=["POST"])
@token_required
def process_image(current_user):
    if "file" not in request.files:
        return {"error": "No file uploaded"}, 400

    file = request.files["file"]
    image_path = os.path.join(OUTPUT_DIR, "uploaded_image.jpg")
    file.save(image_path)
    results = model(image_path)
    boxes = results[0].boxes

    annotated_image_path = os.path.join(OUTPUT_DIR, "annotated_image.jpg")
    results[0].save(filename=annotated_image_path)

    with open(annotated_image_path, "rb") as img_file:
        b64_encoded = base64.b64encode(img_file.read()).decode("utf-8")

    return jsonify({
        "count": len(boxes),
        "image": b64_encoded,
    })

@detection_bp.route('/timestamp', methods=['POST'])
@token_required
def detect(current_user):
    video_file = request.files["file"]
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_file:
        video_path = tmp_file.name
        video_file.save(video_path)
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
        return send_file(frame_path, mimetype="image/jpeg")
    else:
        return jsonify({"message": "No objects detected in the video."})