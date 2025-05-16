"use client"; 
import { motion } from "framer-motion";
import { FaRecycle } from "react-icons/fa";


interface VideoUploadProps {
  timestamp: string | null;
  frame: string | null;
}

export default function VideoObserve({timestamp, frame}: VideoUploadProps) {
      return(
        <div className="w-[50vw] flex justify-center flex-col items-center mt-9">
        <div className="">
        <motion.h1
        className="mt-1 text-4xl text-white font-bold">
          Video Litter Detection:
        </motion.h1>
        </div>
        <div
        className="ml-auto mr-auto mt-5 mb-5 w-150 h-120 border-2 border-dashed border-white flex items-center justify-center cursor-pointer rounded-lg">
        {frame ? (<img src={frame} alt="Uploaded" className="w-full h-full object-cover rounded-lg" />)
        : <FaRecycle size={80} color="white"/>}
    </div>
      <h1 className="text-2xl mt-1 text-center text-white font-bold">Littering was detected at the {timestamp} second mark</h1>
    </div>
  );
}