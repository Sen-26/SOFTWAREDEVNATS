import Image from "next/image";
import { motion } from "framer-motion";


export default function Hero() {
    return(
    <div>   
    <div className="w-full h-[40vh] flex flex-col justify-center items-center" style={{ backgroundImage: "linear-gradient(to bottom, #0D5A34, #5E9561, #499D70)" }}>
          <motion.h1
            className=" mt-5 text-7xl text-white font-bold text-center"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }} 
          > Welcome to LitDetect </motion.h1>
          <motion.h1 className="mb-2 mt-0 text-3xl p-1 text-white font-bold text-center"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }} >Let's detect littering in the environment!</motion.h1>
          </div>
        </div>
    )
}