// FILE: frontend/src/app/dashboard/[hackathonId]/page.tsx
// Yeh final version hai. Ismein Claude ka best logic aur hamara best style, dono hain.

"use client";

import { use, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Submission data ka structure
interface Submission {
  id: number;
  project_name: string;
  github_link: string;
  status: "AI_ACCEPTED" | "AI_REJECTED" | "NEW" | "AI_ERROR";
  score_innovation: number | null;
  score_impact: number | null;
  justification: string | null;
}

// Page props ka structure
interface DashboardPageProps {
  params: Promise<{ hackathonId: string; }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  // Yeh naya, powerful hook hai jo Claude ne suggest kiya tha
  const { hackathonId } = use(params);
  
  // Yeh naye, robust state variables hain
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Yeh naya, behtar data fetching function hai - useCallback se wrap kiya
  const getSubmissions = useCallback(async () => {
    if (!hackathonId) {
      setError('Hackathon ID is missing');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/${hackathonId}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setSubmissions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    getSubmissions();
  }, [hackathonId, getSubmissions]);

  // Yeh hamara purana filtering logic hai
  const acceptedProjects = submissions.filter((s) => s.status === 'AI_ACCEPTED');
  const rejectedProjects = submissions.filter((s) => s.status === 'AI_REJECTED');

  // Yeh naya, behtar loading state hai
  if (isLoading) {
    return (
      <div className="container mx-auto p-8 text-center text-white">
        <p className="text-lg">Loading submissions...</p>
      </div>
    );
  }

  // Yeh naya, behtar error state hai
  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-white">
        <p className="text-lg text-red-400">{error}</p>
        <Button onClick={getSubmissions} className="mt-4">Try Again</Button>
      </div>
    );
  }

  // Yeh hamara purana, beautiful UI hai
  return (
    <main className="container mx-auto p-8 bg-black min-h-screen text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Judges Dashboard</h1>
          <p className="text-muted-foreground">Submissions for Hackathon ID: <span className="font-bold text-white">{hackathonId}</span></p>
        </div>
        <div className="flex gap-4 items-center">
            <Button variant="outline" asChild><Link href="/judge">Back to Judge Portal</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accepted Projects Column */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-green-400">AI Accepted ({acceptedProjects.length})</h2>
          <div className="space-y-4">
            {acceptedProjects.map((sub) => (
              <Card key={sub.id} className="bg-neutral-900 border-green-500/50">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-white">
                    <span>{sub.project_name}</span>
                    <Badge className="bg-green-200 text-green-900">Accepted</Badge>
                  </CardTitle>
                  <CardDescription>
                    <a href={sub.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View on GitHub
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-neutral-300">
                  <div className="flex gap-4 mb-2 font-semibold">
                    <p>Innovation: <span className="text-white">{sub.score_innovation?.toFixed(1) || 'N/A'}</span></p>
                    <p>Impact: <span className="text-white">{sub.score_impact?.toFixed(1) || 'N/A'}</span></p>
                  </div>
                  <p className="text-sm text-neutral-400">{sub.justification}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Rejected Projects Column */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-red-400">AI Rejected ({rejectedProjects.length})</h2>
          <div className="space-y-4">
            {rejectedProjects.map((sub) => (
              <Card key={sub.id} className="bg-neutral-900 border-red-500/50">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start text-white">
                    <span>{sub.project_name}</span>
                    <Badge variant="destructive">Rejected</Badge>
                  </CardTitle>
                  <CardDescription>
                    <a href={sub.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View on GitHub
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-neutral-300">
                  <div className="flex gap-4 mb-2 font-semibold">
                    <p>Innovation: <span className="text-white">{sub.score_innovation?.toFixed(1) || 'N/A'}</span></p>
                    <p>Impact: <span className="text-white">{sub.score_impact?.toFixed(1) || 'N/A'}</span></p>
                  </div>
                  <p className="text-sm text-neutral-400">{sub.justification}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}