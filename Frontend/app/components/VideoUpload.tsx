"use client"; 
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface VideoUploadProps {
  setTimestamp: (video: string | null) => void; 
  setFrame: (frame: string | null) => void; 
}

export default function VideoUpload({setTimestamp, setFrame} : VideoUploadProps) {
    const[video, setVideo] = useState<string | null>(null);
    

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; 
        if (file) {
          const videoUrl = URL.createObjectURL(file);
          setVideo(videoUrl);
        }
      };

    const handleScanVideo = async () => {
    if (!video) return;

    const formData = new FormData();
    const file = await fetch(video).then(r => r.blob());
    formData.append("file", file, "uploaded_video.jpg");

    try {
        console.log("Fetching video...");
        const response = await fetch("http://localhost:5000/timestamp", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            console.error("Response not OK:", response); 
            throw new Error("Failed to process video");
        }

        const json = await response.json();
        console.log("Json", json); 
        setTimestamp(json.first_detection_time);
    } catch (error) {
        console.error("Error processing message:", error);
    }
};

    const handleScanFrame = async () => {
      if (!video) return;

      const formData = new FormData();
      const file = await fetch(video).then(r => r.blob());
      formData.append("file", file, "uploaded_video.jpg");

      try {
          console.log("Fetching video...");
          const response = await fetch("http://localhost:5000/frame", {
              method: "POST",
              body: formData,
          });

          if (!response.ok) {
              console.error("Response not OK:", response); 
              throw new Error("Failed to process video");
          }

          
          const blob = await response.blob();
          console.log("Blob:", blob); 
          const imageUrl = URL.createObjectURL(blob);
          console.log("Image URL:", imageUrl); 
          setFrame(imageUrl);
          } 
          catch (error) {
          console.error("Error processing image:", error);
      }
    };

    const handleClick = () => {
      handleScanVideo();
      handleScanFrame();
  };


      return(
        <div className="w-[50vw] flex justify-center flex-col items-center">
        <div className="">
        <motion.h1
        className=" text-4xl text-white mt-15 font-bold">
          Upload Video
        </motion.h1>
        </div>
        <div
        className="ml-auto mr-auto mt-5 w-150 h-120 border-2 border-white flex items-center justify-center cursor-pointer rounded-lg"
        onClick={() => document.getElementById("videoInput")?.click()}>
        {video ? (<video src={video}  className="w-full h-full object-cover rounded-lg" />)
        : (<span className="text-6xl text-white">+</span>)}
  <input
        type="file"
        id="videoInput"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
    </div>
        <motion.button className="mt-8 font-bold border text-4xl px-5 pt-2 pb-2 rounded-xl text-white cursor-pointer"
        animate="{ x: [null, 100, 0] }"
        onClick={handleClick}>Scan Video</motion.button>
    </div>
  );
}