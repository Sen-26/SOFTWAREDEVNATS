"use client"; 
import { motion } from "framer-motion";
import { FaRecycle } from "react-icons/fa";


interface ImageUploadProps {
  result: string | null;
}

export default function ImageObserve({result}: ImageUploadProps) {
      return(
        <div className="w-[50vw] flex justify-center flex-col items-center mt-9">
        <div className="">
        <motion.h1
        className="mt-1 text-4xl text-white font-bold">
          Result
        </motion.h1>
        </div>
        <div
        className="ml-auto mr-auto mt-5 mb-27 w-150 h-120 border-2 border-dashed border-white flex items-center justify-center cursor-pointer rounded-lg">
        {result ? (<img src={result} alt="Uploaded" className="w-full h-full object-cover rounded-lg" />)
        : <FaRecycle size={80} color="white"/>}
    </div>
    </div>
  );
}