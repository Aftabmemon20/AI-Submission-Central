// FILE: frontend/src/app/page.tsx (The Final, Correct Version)

import LandingPage from "@/components/LandingPages";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// CRITICAL: Make sure your judge email is in this list
const JUDGE_EMAILS = [
  "nobakwas101@gmail.com", 
  
];

export default async function Home() {
  const user = await currentUser();

  // Agar user logged in hai, use role ke hisaab se redirect karo
  if (user) {
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    // Check karo ki user ka email judge list mein hai ya nahi
    if (userEmail && JUDGE_EMAILS.includes(userEmail)) {
      // ###############################################################
      // --- THE FIX IS HERE ---
      // ###############################################################
      // Judges ko ab /dashboard (jo 404 de raha hai) ki jagah 
      // /judge (jahan woh hackathon create karte hain) par bhejo.
      redirect('/judge'); 
      // ###############################################################
    } else {
      // Submitters ko /submit portal par bhejo
      redirect('/submit');
    }
  }

  // Agar user logged in nahi hai, to use beautiful landing page dikhao
  return <LandingPage />;
}