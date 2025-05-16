"use client";
import HeadButton from "../components/headerBar";
import { useState } from 'react';
import Foot from "../components/footer";


export default function Home() {
    const[result, setResult] = useState<string | null>(null);
    return(
        <main>
            <HeadButton
            name="Home"
            name1="About Us"
            name2="Licensing"
            />
            <div className="h-full">
                <center>
                <h1 className="font-coolvetica text-5xl justify-center items-center p-10">LitDetect - Licensing and Terms of Use</h1>
                <div className="p-5">
                    <div>
                        <p>LitDetect is an AI powered service that detects littering using images and videos. By using our service, you are agreeing to abide by our terms of use and licensing information as listed below.</p>
                    </div>
                    <ul className="w-2xl p-5 list-disc list-outside pl-6 text-left">
                        <li>One may <strong>NOT</strong> replicate, distribute, or modify this software.</li>
                        <li>We are not liable for any consequences of false positives, false negatives, or any form of interpretation from the results outputted by the model. </li>
                        <li>We have the right to revoke your usage of this software at any time for any violation of our terms of service or of our judgement.</li>
                    </ul>
                    <div className="flex justify-center w-3xl text-xl font-coolvetica tracking-wide">
                        <p>By adhering to these guidelines we can hope to maintain a safe and responsible environment. For any additional addition questions or information, please feel free to contact us.</p>
                    </div>
                </div>
                </center>
            </div>
        </main>
    );
}