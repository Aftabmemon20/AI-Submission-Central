"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// This is the full submission form component
const SubmissionForm = ({ hackathonId, hackathonName }: { hackathonId: number, hackathonName: string }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hackathon_id: hackathonId, // Include the verified Hackathon ID
                    project_name: `${projectTitle} (${teamName})`,
                    github_link: githubUrl,
                    video_link: videoUrl,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }
            alert("Success! Your project has been submitted for evaluation.");
            // Clear the form
            setTeamName(''); setProjectTitle(''); setGithubUrl(''); setVideoUrl('');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(`Submission failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
      <form onSubmit={handleSubmit}>
          <Card className="max-w-2xl mx-auto">
              <CardHeader>
                  <CardTitle>Submit to {hackathonName}</CardTitle>
                  <CardDescription>Fill out the details below to have your project evaluated by the AI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {/* Form fields are the same as before */}
                  <div className="space-y-2"><Label>Team name</Label><Input value={teamName} onChange={e => setTeamName(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Project title</Label><Input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>GitHub repository URL</Label><Input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Video demo URL</Label><Input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required /></div>
              </CardContent>
              <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Project'}</Button>
              </CardFooter>
          </Card>
      </form>
    );
};

// This is the main page component that decides what to show
export default function SubmitterPortal() {
    const [hackathonId, setHackathonId] = useState("");
    const [verifiedHackathon, setVerifiedHackathon] = useState<{ id: number; name: string } | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await fetch('http://localhost:5000/api/hackathons/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hackathon_id: parseInt(hackathonId) }),
            });
            const data = await response.json();
            if (response.ok && data.valid) {
                setVerifiedHackathon({ id: parseInt(hackathonId), name: data.hackathonName });
            } else {
                setError(data.message || "Verification failed.");
            }
        } catch (e) {
            setError("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    if (verifiedHackathon) {
        // If the ID is verified, show the full submission form
        return <div className="container mx-auto py-12"><SubmissionForm hackathonId={verifiedHackathon.id} hackathonName={verifiedHackathon.name} /></div>;
    }

    // If no ID is verified, show the verification form
    return (
        <div className="container mx-auto py-20">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Join a Hackathon</CardTitle>
                    <CardDescription>Please enter the Hack ID provided by your judge to continue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label htmlFor="hack-id">Hack ID</Label>
                    <Input id="hack-id" value={hackathonId} onChange={e => setHackathonId(e.target.value)} placeholder="e.g. 123" />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleVerify} className="w-full" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify & Continue'}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}