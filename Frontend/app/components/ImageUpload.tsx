"use client"; 
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ImageUploadProps {
  setResult: (image: string | null) => void; 
}

export default function ImageUpload({setResult} : ImageUploadProps) {
    console.log("ImageUpload setResult:", setResult);
    const[image, setImage] = useState<string | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; 
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setImage(imageUrl);
        }
      };

    const handleScanImage = async () => {
    if (!image) return;

    const formData = new FormData();
    const file = await fetch(image).then(r => r.blob());
    formData.append("file", file, "uploaded_image.jpg");

    try {
        console.log("Fetching image...");
        const response = await fetch("http://localhost:5000/process-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            console.error("Response not OK:", response); 
            throw new Error("Failed to process image");
        }

        const blob = await response.blob();
        console.log("Blob:", blob); 
        const imageUrl = URL.createObjectURL(blob);
        console.log("Image URL:", imageUrl); 
        setResult(imageUrl);
        } 
        catch (error) {
        console.error("Error processing image:", error);
    }
};
    
    function handleImageDisplay() {
      alert("You clicked");
    }
      return(
        <div className="w-[50vw] flex justify-center flex-col items-center">
        <div className="">
        <motion.h1
        className=" text-4xl text-white font-bold">
          Upload Image
        </motion.h1>
        </div>
        <div
        className="ml-auto mr-auto mt-5 w-150 h-120 border-2 border-white flex items-center justify-center cursor-pointer rounded-lg"
        onClick={() => document.getElementById("imageInput")?.click()}>
        {image ? (<img src={image} alt="Uploaded" className="w-full h-full object-cover rounded-lg" />)
        : (<span className="text-6xl text-white">+</span>)}
  <input
        type="file"
        id="imageInput"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
        <motion.button className="mt-8 text-4xl font-bold border px-5 pt-2 pb-2 rounded-xl text-white cursor-pointer"
        animate="{ x: [null, 100, 0] }"
        onClick={handleScanImage}>Scan Image</motion.button>
    </div>
  );
}