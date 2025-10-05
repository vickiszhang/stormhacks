"use client";

import { useState, useEffect } from "react";
import { ApplicationData } from "@/data/sample-applications-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LightBulb } from "@/components/lightbulb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [pendingInterviews, setPendingInterviews] = useState<
    Array<{
      index: number;
      role: string;
      company: string;
      interviewDate: string;
    }>
  >([]);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  // const [applications, setApplications] = useState(sampleApplicationData);
  const [applications, setApplications] = useState<ApplicationData[]>([]);

  const [isLoadingApplications, setIsLoadingApplications] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingApplications(true);
        const response = await fetch("/api/aws", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        setApplications(data.data);
      } catch (error) {
        console.error("Error loading applications:", error);
      } finally {
        setIsLoadingApplications(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  useEffect(() => {
    // Find applications with past interview dates that haven't been updated to offer/rejected
    if (applications.length === 0) return;

    const today = new Date();
    const pastInterviews = applications
      .map((app, index) => {
        if (app.DateInterview && !app.DateAccepted && !app.DateRejected) {
          const interviewDate = new Date(app.DateInterview);
          if (interviewDate < today) {
            return {
              index,
              role: app.Role,
              company: app.Company,
              interviewDate: app.DateInterview,
            };
          }
        }
        return null;
      })
      .filter(
        (
          item
        ): item is {
          index: number;
          role: string;
          company: string;
          interviewDate: string;
        } => item !== null
      );

    if (pastInterviews.length > 0) {
      setPendingInterviews(pastInterviews);
      setIsFollowUpDialogOpen(true);
    }
  }, [applications]);

  const handleFollowUpResponse = (
    response: "no_update" | "offered" | "rejected"
  ) => {
    const currentInterview = pendingInterviews[currentFollowUpIndex];
    const today = new Date().toISOString().split("T")[0];

    if (response === "offered") {
      const updatedApps = [...applications];
      updatedApps[currentInterview.index].DateAccepted = today;
      setApplications(updatedApps);
    } else if (response === "rejected") {
      const updatedApps = [...applications];
      updatedApps[currentInterview.index].DateRejected = today;
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

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Say hello" }),
      });
      const data = await response.json();
      setGeminiResponse(data.response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setGeminiResponse("Error: Failed to get response from Gemini");
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
          {isLoadingApplications ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-dark"></div>
            </div>
          ) : (
            <Table>
              <TableBody>
                {applications.map((application) => {
                return (
                  <TableRow
                    key={application.ApplicationID}
                    className={`${
                      application.DateRejected
                        ? "bg-gray-100 text-muted-foreground"
                        : ""
                    } h-16`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-pink-dark text-white">
                            {application.Role.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{application.Role}</div>
                          <div className="text-sm text-muted-foreground">
                            {application.Company}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {application.DateApplied && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Applied
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(application.DateApplied)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {application.DateScreening && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Screen
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(application.DateScreening)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {application.DateInterview && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Interview
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(application.DateInterview)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {application.DateAccepted && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Offer
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(application.DateAccepted)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {application.DateRejected && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Rejected
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(application.DateRejected)}
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
          )}
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
            {pendingInterviews.length > 0 &&
              currentFollowUpIndex < pendingInterviews.length && (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentFollowUpIndex + 1} of {pendingInterviews.length}
                  </p>
                  <p className="mb-4 text-lg">
                    Have there been any updates on your{" "}
                    <strong>
                      {pendingInterviews[currentFollowUpIndex].role}
                    </strong>{" "}
                    application at{" "}
                    <strong>
                      {pendingInterviews[currentFollowUpIndex].company}
                    </strong>
                    ?
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Interview Date:{" "}
                    {formatDate(
                      pendingInterviews[currentFollowUpIndex].interviewDate
                    )}
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleFollowUpResponse("no_update")}
                      className="w-full"
                    >
                      No Update
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleFollowUpResponse("offered")}
                      className="w-full"
                    >
                      Offered
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleFollowUpResponse("rejected")}
                      className="w-full bg-pink-dark"
                    >
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
