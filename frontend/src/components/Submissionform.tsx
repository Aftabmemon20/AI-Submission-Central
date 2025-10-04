// This component is just the form itself.
// We make it a "use client" component because it will have state and handlers later.
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react"; // Import useState for handling form state

// Changed to a default export to fix the import/export mismatch
export default function SubmissionForm() {
  // Create state variables for each form field to store the user's input
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pptUrl, setPptUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // This function will run when the user clicks the "Submit" button
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default browser form submission
    setIsLoading(true);

    const submissionData = {
      project_name: projectTitle, // Match the backend's expected field name
      github_link: githubUrl,     // Match the backend's expected field name
      video_link: videoUrl,       // Match the backend's expected field name
      // We can add ppt_link and notes later if needed
    };

    try {
      const response = await fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const result = await response.json();
      console.log("Submission successful:", result);
      alert(`Project submitted successfully! AI Evaluation: ${result.ai_evaluation}`);
      // Here you could redirect the user or clear the form
      
    } catch (error) {
      console.error("Submission failed:", error);
      alert(`Submission failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit your project</CardTitle>
        <CardDescription>Fill out the details below to enter the hackathon.</CardDescription>
      </CardHeader>
      {/* We wrap the content in a form element and add our handleSubmit function */}
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            {/* Each input is now controlled by its state variable */}
            <Input id="team-name" placeholder="e.g. Quantum Coders" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
          </div>  
          <div className="space-y-2">
            <Label htmlFor="project-title">Project title</Label>
            <Input id="project-title" placeholder="e.g. AutoEval" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github-url">GitHub repository URL</Label>
            <Input id="github-url" placeholder="https://github.com/org/repo" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video-url">Video demo URL</Label>
            <Input id="video-url" placeholder="https://www.youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ppt-url">Presentation (PPT/Slides) URL</Label>
            <Input id="ppt-url" placeholder="https://docs.google.com/presentation/..." value={pptUrl} onChange={(e) => setPptUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Anything else you want to share?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
