"use client";

import { Chart } from "chart.js";
import Image from "next/image";
import { useState } from "react";
import { sampleApplicationData, status } from "@/data/sample-applications-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LightBulb } from "@/components/lightbulb";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const getStatusDate = (
    statusHistory: { status: status; date: Date }[],
    targetStatus: status
  ) => {
    return statusHistory.find((s) => s.status === targetStatus)?.date;
  };

  const testGemini = async () => {
    try {
      setIsDialogOpen(true);
      setIsLoading(true);
      setGeminiResponse("");

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Say hello' })
      });
      const data = await response.json();
      setGeminiResponse(data.response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setGeminiResponse('Error: Failed to get response from Gemini');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {sampleApplicationData.map((application, index) => {
                const appliedDate = getStatusDate(
                  application.statusHistory,
                  status.APPLIED
                );
                const screenDate = getStatusDate(
                  application.statusHistory,
                  status.ONLINE_ASSESSMENT
                );
                const interviewDate = getStatusDate(
                  application.statusHistory,
                  status.INTERVIEW
                );
                const offerDate = getStatusDate(
                  application.statusHistory,
                  status.OFFER
                );
                const rejectedDate = getStatusDate(
                  application.statusHistory,
                  status.REJECTED
                );

                return (
                  <TableRow
                    key={index}
                    className={`${
                      rejectedDate ? "bg-gray-100 text-muted-foreground" : ""
                    } h-16`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-pink-500 text-white">
                            {application.title.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{application.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {application.company}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {appliedDate && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Applied
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(appliedDate)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {screenDate && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Screen
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(screenDate)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {interviewDate && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Interview
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(interviewDate)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {offerDate && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Offer
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(offerDate)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {rejectedDate && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Rejected
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(rejectedDate)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div onClick={testGemini} className="cursor-pointer">
                        <LightBulb />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analyzing </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <p>{geminiResponse}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
