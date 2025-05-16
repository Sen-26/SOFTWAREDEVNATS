
"use client";
import { motion } from "framer-motion";
import ImageUpload from "./components/ImageUpload";
import VideoUpload from "./components/VideoUpload";
import HeadButton from "./components/headerBar";
import ImageObserve from "./components/ImageObserve";
import VideoObserve from "./components/VideoObserve";
import Hero from "./components/Hero";
import { useState } from 'react';

export default function Home() {
  const[result, setResult] = useState<string | null>(null);
  const[timestamp, setTimestamp] = useState<string | null>(null);
  const[frame, setFrame] = useState<string | null>(null);

  return (
    <main className="items-center">
      <HeadButton
        name="Home"
        name1="About Us"
        name2="Licensing"
      />
      <Hero />
      <div className = "border-2 border-white" />
      
      <div className="flex flex-row items-center pt-5 pb-5 bg-[#2E8B57]">
      <ImageUpload setResult={setResult}/>
      <div className="border-2 border-white h-125 mx-4"></div>
      <ImageObserve result={result}/>
    
      </div>
      <div className = "border-2 border-white" />
      <div className = "border-2 border-white" />
      
      <div className="flex flex-row items-center pt-2 pb-5 bg-[#2E8B57]">
      <VideoUpload setTimestamp={setTimestamp} setFrame={setFrame}/>
      <div className="border-2 border-white h-125 mx-4"></div>
      <VideoObserve timestamp={timestamp} frame={frame}/>
    
      </div>
    </main>
  );
}
