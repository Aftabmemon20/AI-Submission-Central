"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CriteriaPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCriteria() {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/criteria');
        if (res.ok) {
          const data = await res.json();
          setCriteria(data.current_criteria);
        }
      } catch (error) { console.error("Error fetching criteria:", error); }
      finally { setIsLoading(false); }
    }
    fetchCriteria();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria_text: criteria }),
      });
      if (!response.ok) throw new Error('Failed to save criteria');
      router.push('/dashboard'); // Use Next.js router for smooth navigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Live Judging Criteria</CardTitle>
          <CardDescription>
            This text will be used by the Cerebras AI to evaluate all new submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="criteria">AI Prompt Instructions</Label>
          <Textarea
            id="criteria"
            rows={10}
            placeholder={isLoading ? "Loading..." : "Type your judging criteria here."}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Criteria"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}