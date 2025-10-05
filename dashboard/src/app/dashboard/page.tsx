"use client";

import { useState, useEffect } from "react";
import { sampleApplicationData, status } from "@/data/sample-applications-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LightBulb } from "@/components/lightbulb";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [pendingInterviews, setPendingInterviews] = useState<Array<{index: number, title: string, company: string, interviewDate: Date}>>([]);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  const [applications, setApplications] = useState(sampleApplicationData);

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

  useEffect(() => {
    // Find applications with past interview dates that haven't been updated to offer/rejected
    const today = new Date();
    const pastInterviews = applications
      .map((app, index) => {
        const interviewDate = getStatusDate(app.statusHistory, status.INTERVIEW);
        const hasOffer = getStatusDate(app.statusHistory, status.OFFER);
        const hasRejection = getStatusDate(app.statusHistory, status.REJECTED);

        if (interviewDate && !hasOffer && !hasRejection && interviewDate < today) {
          return { index, title: app.title, company: app.company, interviewDate };
        }
        return null;
      })
      .filter((item): item is {index: number, title: string, company: string, interviewDate: Date} => item !== null);

    if (pastInterviews.length > 0) {
      setPendingInterviews(pastInterviews);
      setIsFollowUpDialogOpen(true);
    }
  }, []);

  const handleFollowUpResponse = (response: 'no_update' | 'offered' | 'rejected') => {
    const currentInterview = pendingInterviews[currentFollowUpIndex];

    if (response === 'offered') {
      const updatedApps = [...applications];
      updatedApps[currentInterview.index].statusHistory.push({
        status: status.OFFER,
        date: new Date()
      });
      updatedApps[currentInterview.index].currentStatus = status.OFFER;
      setApplications(updatedApps);
    } else if (response === 'rejected') {
      const updatedApps = [...applications];
      updatedApps[currentInterview.index].statusHistory.push({
        status: status.REJECTED,
        date: new Date()
      });
      updatedApps[currentInterview.index].currentStatus = status.REJECTED;
      setApplications(updatedApps);
    }

    // Move to next interview or close dialog
    if (currentFollowUpIndex < pendingInterviews.length - 1) {
      setCurrentFollowUpIndex(currentFollowUpIndex + 1);
    } else {
      setIsFollowUpDialogOpen(false);
      setCurrentFollowUpIndex(0);
    }
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
              {applications.map((application, index) => {
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

      <Sheet open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Application Updates</SheetTitle>
          </SheetHeader>
          <div className="p-6 ">
            {pendingInterviews.length > 0 && currentFollowUpIndex < pendingInterviews.length && (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {currentFollowUpIndex + 1} of {pendingInterviews.length}
                </p>
                <p className="mb-4 text-lg">
                  Have there been any updates on your <strong>{pendingInterviews[currentFollowUpIndex].title}</strong> application at <strong>{pendingInterviews[currentFollowUpIndex].company}</strong>?
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Interview Date: {formatDate(pendingInterviews[currentFollowUpIndex].interviewDate)}
                </p>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={() => handleFollowUpResponse('no_update')} className="w-full">
                    No Update
                  </Button>
                  <Button variant="default" onClick={() => handleFollowUpResponse('offered')} className="w-full">
                    Offered
                  </Button>
                  <Button variant="destructive" onClick={() => handleFollowUpResponse('rejected')} className="w-full">
                    Rejected
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
