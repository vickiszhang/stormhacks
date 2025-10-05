"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Test() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testDynamoDB = async () => {
    try {
      setIsDialogOpen(true);
      setIsLoading(true);
      setApiResponse("");

      const response = await fetch('/api/aws?applicationID=08acf876-1dba-4765-9723-b750a417bb0d', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      setIsLoading(false);
    } catch (error) {
      console.error('Error calling DynamoDB:', error);
      setApiResponse('Error: Failed to get response from DynamoDB');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Button onClick={testDynamoDB}>Test DynamoDB GET</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>DynamoDB Response</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {apiResponse}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
