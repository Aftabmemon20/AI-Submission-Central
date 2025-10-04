// FILE: frontend/src/components/LandingPage.tsx (The Final, Correct Version)
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MaskContainer } from "@/components/ui/svg-mask-effect";

// SVG Logos (No changes here, assuming they are correct)
const DockerLogo = () => ( <svg fill="#2496ED" width="64" height="64" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M224.23,100.28a32.32,32.32,0,0,0-23.7-30.08L162,61.33V28.08H31.51v199.1H162V155.88l38.5,8.87a32.33,32.33,0,0,0,23.73-30.09C224.2,122,224.2,112.92,224.23,100.28ZM93.72,133.56H59.62V99.46H93.72Zm0-48.14H59.62V51.32H93.72Zm40.19,48.14H105.81V99.46h28.1Zm0-48.14H105.81V51.32h28.1Zm70.81,39.36a16.13,16.13,0,0,1-16.13,16.13h-2.19l-36.36-8.38V91.63l36.36-8.38h2.19a16.13,16.13,0,0,1,16.13,16.13Z"/></svg> );
const CerebrasLogo = () => ( <svg fill="#FF6600" width="64" height="64" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zm0 4h4v2h-4v-2zm0-8h4v2h-4V7z"/></svg> );


export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <MaskContainer
        revealText={
          <h1 className="mx-auto max-w-4xl text-center text-4xl md:text-6xl font-bold text-slate-100">
            AI Submission Central <br /> The Future of Hackathon Judging is Here.
          </h1>
        }
        className="h-[40rem] bg-black"
      >
        A seamless platform for <span className="text-blue-500">students</span> to get instant, AI-powered feedback, and for <span className="text-orange-500">judges</span> to discover the best projects, faster.
      </MaskContainer>

      <div className="flex flex-col justify-center items-center text-center p-4 -mt-32 relative z-10">
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg mx-auto">
          Ready to experience the future?
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Link href="/submit">Submit Your Project</Link>
          </Button>
          {/* ############################################################### */}
          {/* --- THE FIX IS HERE --- */}
          {/* ############################################################### */}
          {/* Hum ab is button ko /dashboard (jo galat hai) ki jagah */}
          {/* /judge (jo sahi hai) par bhej rahe hain. */}
          <Button size="lg" variant="outline" asChild className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white shadow-lg shadow-orange-500/30">
            <Link href="/judge">Enter Judges Portal</Link>
          </Button>
          {/* ############################################################### */}
        </div>
      </div>
      
      <div className="py-20 mt-20 bg-neutral-950">
        <h2 className="text-4xl font-bold text-center mb-12">Powered By World-Class Technology</h2>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center text-center">
            <DockerLogo />
            <h3 className="text-2xl font-semibold mt-4 text-blue-400">Docker</h3>
            <p className="mt-2 text-neutral-400 max-w-sm">
              Containers & CI for fair, fast, and repeatable judging.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CerebrasLogo />
            <h3 className="text-2xl font-semibold mt-4 text-orange-400">Cerebras</h3>
            <p className="mt-2 text-neutral-400 max-w-sm">
              Inference & Hardware for large-scale AI evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}