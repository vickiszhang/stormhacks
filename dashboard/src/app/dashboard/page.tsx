"use client";

import React, { useState, useEffect } from "react";
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
    }>
  >([]);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  // const [applications, setApplications] = useState(sampleApplicationData);
  const [applications, setApplications] = useState<ApplicationData[]>([]);

  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [currentInsight, setCurrentInsight] = useState<{ company: string; role: string } | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingApplications(true);
        const response = await fetch("/api/dynamodb", {
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
    // Find all applications that are not rejected or accepted
    if (applications.length === 0) return;

    const pendingApps = applications
      .map((app, index) => {
        if (!app.DateAccepted && !app.DateRejected) {
          return {
            index,
            role: app.Role,
            company: app.Company,
            interviewDate: app.DateInterview || "",
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

  const analyzeResume = async (applicationId: string, customPrompt?: string) => {
    try {
      setIsDialogOpen(true);
      setIsLoading(true);
      setGeminiResponse("");
      setCurrentInsight(null);

      // 1. Get application details from DynamoDB
      const appResponse = await fetch(`/api/dynamodb?applicationId=${applicationId}`);
      const appData = await appResponse.json();

      if (!appData.success || !appData.data.ResumeURL) {
        setGeminiResponse("Error: Resume URL not found for this application");
        setIsLoading(false);
        return;
      }

      const application = appData.data;
      setCurrentInsight({ company: application.Company, role: application.Role });

      // 2. Get resume file from S3
      const s3Response = await fetch(`/api/s3?s3Url=${encodeURIComponent(application.ResumeURL)}`);
      const s3Data = await s3Response.json();

      if (!s3Data.success) {
        setGeminiResponse("Error: Failed to retrieve resume from S3");
        setIsLoading(false);
        return;
      }

      // 3. Build the prompt
      const prompt = customPrompt ||
        `The user got an interview for ${application.Company} for role ${application.Role}. They applied with this resume attached as a file. Analyze the resume and draw insights on the strong points of the resume that passed a screening to get an interview. Make the summary about 200 words, the output should only have letters and number characters but no symbols, except quotes, commas, periods, dashes, brackets, if necessary. The output should address the candidate as "your", example "your resume is ...". Divide the output into paragraphs.`;

      // 4. Send to Gemini for analysis
      const geminiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          fileData: s3Data.data,
          mimeType: s3Data.contentType
        }),
      });
      const geminiData = await geminiResponse.json();
      setGeminiResponse(geminiData.response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setGeminiResponse("Error: Failed to analyze resume");
      setIsLoading(false);
    }
  };

  const saveToInsights = async () => {
    if (!currentInsight || !geminiResponse) return;

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: currentInsight.company,
          role: currentInsight.role,
          summary: geminiResponse
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Insight saved successfully!");
        setIsDialogOpen(false);
        setGeminiResponse("");
        setCurrentInsight(null);
      } else {
        toast.error("Failed to save insight");
      }
    } catch (error) {
      console.error("Error saving insight:", error);
      toast.error("Failed to save insight");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
                const isExpanded = expandedRow === application.ApplicationID;
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
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Insights on your application</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              We are analyzing your application to provide insights on the most optimal resume strategies and improve your chances of success.
            </p>
          </DialogHeader>
          <div className="py-4 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-blue"></div>
              </div>
            ) : (
              <>
                <p className="text-sm">{geminiResponse}</p>
                {geminiResponse && !geminiResponse.startsWith("Error:") && (
                  <div className="flex gap-3 mt-6">
                    <Button onClick={saveToInsights} className="flex-1 bg-blue-dark">
                      Save to Insights
                    </Button>
                    <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                      Close
                    </Button>
                  </div>
                )}
              </>
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
