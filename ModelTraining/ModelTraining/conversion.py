import os
import json
import shutil

dataset_dir = "data"
output_dir = "usable_yolo_data"  

splits = ["train", "val", "test"]

for split in splits:
    json_path = os.path.join(dataset_dir, f"annotations_0_{split}.json")  # Adjust trial index if needed
    with open(json_path, "r") as f:
        dataset = json.load(f)
    
    
    images_dir = os.path.join(output_dir, f"images/{split}")
    labels_dir = os.path.join(output_dir, f"labels/{split}")
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(labels_dir, exist_ok=True)

    
    category_map = {c["id"]: i for i, c in enumerate(dataset["categories"])}  # Map COCO category ID to 0-based class index

    for img in dataset["images"]:
        img_id = img["id"]
        img_filename = img["file_name"]
        img_width = img["width"]
        img_height = img["height"]

        
        src_img_path = os.path.normpath(os.path.join(dataset_dir, img_filename))
        dst_img_path = os.path.normpath(os.path.join(images_dir, img_filename))

        
        dst_img_dir = os.path.dirname(dst_img_path)
        os.makedirs(dst_img_dir, exist_ok=True)

        shutil.copyfile(src_img_path, dst_img_path)

        
        label_path = os.path.join(labels_dir, img_filename.replace(".jpg", ".txt").replace(".png", ".txt").replace(".JPG", ".txt"))
        label_dir = os.path.dirname(label_path)
        os.makedirs(label_dir, exist_ok=True)

        
        with open(label_path, "w") as label_file:
            for ann in dataset["annotations"]:
                if ann["image_id"] == img_id:
                    class_id = category_map[ann["category_id"]]
                    x_min, y_min, box_width, box_height = ann["bbox"]
                    
                    
                    x_center = (x_min + box_width / 2) / img_width
                    y_center = (y_min + box_height / 2) / img_height
                    box_width /= img_width
                    box_height /= img_height

                    
                    label_file.write(f"{class_id} {x_center} {y_center} {box_width} {box_height}\n")

print("Conversion to YOLO format complete!")
