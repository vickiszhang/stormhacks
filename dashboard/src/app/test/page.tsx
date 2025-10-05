"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Test() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [s3Url, setS3Url] = useState("");

  const getApplications = async () => {
    try {
      setIsDialogOpen(true);
      setIsLoading(true);
      setApiResponse("");

      const response = await fetch('/api/dynamodb', {
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

  const getS3File = async () => {
    try {
      setIsDialogOpen(true);
      setIsLoading(true);
      setApiResponse("");

      if (!s3Url) {
        setApiResponse('Error: Please enter an S3 URL (e.g., s3://bucket/key)');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/s3?s3Url=${encodeURIComponent(s3Url)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      setIsLoading(false);
    } catch (error) {
      console.error('Error calling S3:', error);
      setApiResponse('Error: Failed to get response from S3');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <div>
        <Button onClick={getApplications}>Test DynamoDB GET</Button>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={s3Url}
          onChange={(e) => setS3Url(e.target.value)}
          placeholder="Enter S3 URL (e.g., s3://bucket/key)"
          className="w-full p-2 border rounded"
        />
        <Button onClick={getS3File}>Test S3 GET</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Response</DialogTitle>
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
