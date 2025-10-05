"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { API_ENDPOINTS } from "@/config/api";

type Hackathon = { id: number; name: string; };

export default function JudgePortal() {
  const { userId, isLoaded } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [newHackathonName, setNewHackathonName] = useState("");
  const [newHackathonCriteria, setNewHackathonCriteria] = useState("Evaluate based on innovation, impact, and technical execution.");
  const [createdHackId, setCreatedHackId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && userId) {
      setIsLoading(true);
      fetch(`${API_ENDPOINTS.getHackathons}?judge_id=${userId}`)
        .then(res => res.json())
        .then(data => setHackathons(data))
        .catch(error => {
          console.error('Error fetching hackathons:', error);
          alert('Failed to load hackathons. Please check your connection.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isLoaded, userId]);

  const handleCreate = async () => {
    if (!newHackathonName || !userId) return;
    setIsLoading(true);
    setCreatedHackId(null);
    try {
      const response = await fetch(API_ENDPOINTS.createHackathon, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newHackathonName, 
          judge_id: userId, 
          criteria: newHackathonCriteria 
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create hackathon');

      setCreatedHackId(data.hackathon.id);
      setHackathons([data.hackathon, ...hackathons]);
      setNewHackathonName("");
      setNewHackathonCriteria("Evaluate based on innovation, impact, and technical execution.");
    } catch (error: unknown) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create hackathon'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isLoaded) {
    return <p className="text-center p-8">Loading your portal...</p>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Judges Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle>Create a New Hackathon</CardTitle>
            <CardDescription>Create a session and get a unique ID to share with submitters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hack-name">Hackathon Name</Label>
              <Input 
                id="hack-name" 
                value={newHackathonName} 
                onChange={e => setNewHackathonName(e.target.value)} 
                placeholder="e.g. Winter Codefest 2025" 
                disabled={isLoading} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hack-criteria">Judging Criteria</Label>
              <Textarea 
                id="hack-criteria" 
                value={newHackathonCriteria} 
                onChange={e => setNewHackathonCriteria(e.target.value)} 
                rows={5} 
                disabled={isLoading} 
              />
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create New Hack ID'}
            </Button>
            {createdHackId && (
              <div className="mt-4 p-4 bg-green-900 rounded-lg text-center">
                <p className="text-sm text-green-200">Hackathon Created! Share this ID with your students:</p>
                <p className="text-2xl font-bold text-white select-all">{createdHackId}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader>
            <CardTitle>Your Hackathons</CardTitle>
            <CardDescription>Click on a hackathon to view its private dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p>Loading your hackathons...</p> : (
              <ul className="space-y-2">
                {hackathons.map(h => (
                  <li key={h.id}>
                    <Link 
                      href={`/dashboard/${h.id}`} 
                      className="block p-4 rounded-md hover:bg-neutral-800 border border-neutral-700 transition-colors"
                    >
                      {h.name} (ID: {h.id})
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}