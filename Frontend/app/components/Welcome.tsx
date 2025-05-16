"use client";

import {motion} from 'framer-motion';


export default function Welcome() {

    return(
    <div className="pt-5 pl-5">
        <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => alert('Scanning Image')}
    className="bg-blue-500 hover:bg-sblue-700 text-white font-bold py-2 px-4 rounded">
        Scan Image </motion.button>
    </div>
    )

}