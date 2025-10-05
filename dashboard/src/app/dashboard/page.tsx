"use client";

import { useState, useEffect } from "react";
import { ApplicationData, sampleApplicationData } from "@/data/sample-applications-data";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

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
      dateLabel: string;
    }>
  >([]);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingApplications(true);
        const response = await fetch("/api/dynamodb", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        const fetchedApps = data.data || data.applications || [];
        
        if (fetchedApps.length === 0) {
          // Use sample data if no real data exists
          setApplications(sampleApplicationData);
          setUsingSampleData(true);
        } else {
          setApplications(fetchedApps);
          setUsingSampleData(false);
        }
      } catch (error) {
        console.error("Error loading applications:", error);
        // Fallback to sample data on error
        setApplications(sampleApplicationData);
        setUsingSampleData(true);
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
    // Find applications that haven't been accepted or rejected
    if (applications.length === 0) return;

    const pendingApps = applications
      .map((app, index) => {
        if (!app.DateAccepted && !app.DateRejected) {
          // Use interview date if available, otherwise screen date, otherwise app date
          let displayDate = app.DateInterview;
          let dateLabel = "Interview Date";

          if (!displayDate) {
            displayDate = app.DateScreening;
            dateLabel = "Screen Date";
          }

          if (!displayDate) {
            displayDate = app.DateApplied;
            dateLabel = "Application Date";
          }

          return {
            index,
            role: app.Role,
            company: app.Company,
            interviewDate: displayDate || "",
            dateLabel,
          };
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
          dateLabel: string;
        } => item !== null
      );

    if (pendingApps.length > 0) {
      setPendingInterviews(pendingApps);
      setIsFollowUpDialogOpen(true);
    }
  }, [applications]);

  const handleFollowUpResponse = async (
    response: "no_update" | "offered" | "rejected"
  ) => {
    const currentInterview = pendingInterviews[currentFollowUpIndex];
    const today = new Date().toISOString().split("T")[0];
    const currentApp = applications[currentInterview.index];

    try {
      if (response === "offered") {
        // Update in database
        await fetch("/api/dynamodb", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ApplicationID: currentApp.ApplicationID,
            updates: {
              DateAccepted: today,
            },
          }),
        });

        // Update local state
        const updatedApps = [...applications];
        updatedApps[currentInterview.index].DateAccepted = today;
        setApplications(updatedApps);

        // Show success toast
        toast.success(`Application for ${currentInterview.role} at ${currentInterview.company} has been updated`);
      } else if (response === "rejected") {
        // Update in database
        await fetch("/api/dynamodb", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ApplicationID: currentApp.ApplicationID,
            updates: {
              DateRejected: today,
            },
          }),
        });

        // Update local state
        const updatedApps = [...applications];
        updatedApps[currentInterview.index].DateRejected = today;
        setApplications(updatedApps);

        // Show success toast
        toast.success(`Application for ${currentInterview.role} at ${currentInterview.company} has been updated`);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status");
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Sample Data Banner */}
      {usingSampleData && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#3CA2C8]/10 to-[#10559A]/10 border border-[#3CA2C8] rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-[#10559A] mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-[#10559A] mb-1">Using Sample Data</h3>
              <p className="text-sm text-gray-600">
                No application data found in DynamoDB. Showing sample applications to demonstrate features. 
                Start tracking applications with the Chrome extension to see your real data here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#DB4C77] to-[#10559A] bg-clip-text text-transparent">
          Application Summary
        </h1>
        <p className="text-gray-600 mt-2">Track and manage your job applications</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {isLoadingApplications ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4C77]"></div>
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
                          <AvatarFallback className="bg-gradient-to-br from-[#DB4C77] to-[#F9C6D7] text-white">
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
                      <TooltipProvider>
                        <Tooltip >
                          <TooltipTrigger asChild>
                            <div onClick={testGemini} className="cursor-pointer">
                              <LightBulb />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-blue-dark text-white border-blue-dark">
                            <p>Get insights on your application.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
            <DialogTitle>Insights on your application</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              We are analyzing your application to provide insights on the most optimal resume strategies and improve your chances of success.
            </p>
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
                    {pendingInterviews[currentFollowUpIndex].dateLabel}:{" "}
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
