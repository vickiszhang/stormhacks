"use client";

import React, { useState, useEffect } from "react";
import { ApplicationData, sampleApplicationData } from "@/data/sample-applications-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
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
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

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
    // Parse the date as UTC to avoid timezone shifts
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      // Format as MM/DD/YY
      const shortYear = year.slice(-2);
      return `${month}/${day}/${shortYear}`;
    }
    // Fallback for other formats
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

  const toggleRow = (applicationId: string) => {
    setExpandedRow(expandedRow === applicationId ? null : applicationId);
  };

  const openResume = async (resumeUrl: string) => {
    if (!resumeUrl) {
      toast.error("No resume URL available");
      return;
    }

    try {
      const response = await fetch(`/api/s3?s3Url=${encodeURIComponent(resumeUrl)}`);
      const data = await response.json();

      if (data.success) {
        // Convert base64 to blob and open in new window
        const byteCharacters = atob(data.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.contentType });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        toast.error("Failed to load resume");
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      toast.error("Error loading resume");
    }
  };

  const handleEditStart = (applicationId: string, field: string, currentValue: string) => {
    setEditingCell({ id: applicationId, field });
    // Convert the date to YYYY-MM-DD format for the date input
    if (currentValue) {
      const date = new Date(currentValue);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setEditValue(`${year}-${month}-${day}`);
    } else {
      setEditValue("");
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleEditSave = async (applicationId: string, field: string) => {
    try {
      const app = applications.find(a => a.ApplicationID === applicationId);
      if (!app) return;

      // Ensure the date is stored in ISO format (YYYY-MM-DD)
      const dateToSave = editValue || "";

      // Update in database
      await fetch("/api/dynamodb", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ApplicationID: applicationId,
          updates: {
            [field]: dateToSave,
          },
        }),
      });

      // Update local state
      const updatedApps = applications.map(a =>
        a.ApplicationID === applicationId
          ? { ...a, [field]: dateToSave }
          : a
      );
      setApplications(updatedApps);

      toast.success("Date updated successfully");
      setEditingCell(null);
      setEditValue("");
    } catch (error) {
      console.error("Error updating date:", error);
      toast.error("Failed to update date");
    }
  };

  const renderEditableDate = (application: ApplicationData, field: string, label: string) => {
    const isEditing = editingCell?.id === application.ApplicationID && editingCell?.field === field;
    const dateValue = (application as any)[field];

    if (isEditing) {
      return (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground mb-1">{label}</div>
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-1 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditSave(application.ApplicationID, field);
              }}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditCancel();
              }}
              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleEditStart(application.ApplicationID, field, dateValue || "");
        }}
        className="cursor-pointer hover:bg-blue-50 rounded p-1 transition-colors"
      >
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm font-medium flex items-center justify-center gap-1">
          {dateValue ? formatDate(dateValue) : "-"}
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    );
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
                const isExpanded = expandedRow === application.ApplicationID;
                return (
                  <React.Fragment key={application.ApplicationID}>
                  <TableRow
                    onClick={() => toggleRow(application.ApplicationID)}
                    className={`${
                      application.DateRejected
                        ? "bg-gray-100 text-muted-foreground"
                        : ""
                    } h-16 cursor-pointer hover:bg-gray-50 transition-colors`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
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
                      {renderEditableDate(application, "DateApplied", "Applied")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderEditableDate(application, "DateScreening", "Screen")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderEditableDate(application, "DateInterview", "Interview")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderEditableDate(application, "DateAccepted", "Offer")}
                    </TableCell>
                    <TableCell className="text-center">
                      {renderEditableDate(application, "DateRejected", "Rejected")}
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${application.ApplicationID}-details`}>
                      <TableCell colSpan={6} className="bg-gray-50 p-6">
                        <div className="space-y-4">
                          {/* Application Details Grid - First Row */}
                          <div className="grid grid-cols-3 gap-4">
                            {/* Cover Letter Status */}
                            <div>
                              <h3 className="font-semibold text-sm text-gray-700 mb-1">Cover Letter</h3>
                              <p className="text-sm text-gray-600">
                                {application.DidCL ? "✓ Submitted with cover letter" : "✗ No cover letter"}
                              </p>
                            </div>

                            {/* Resume Link */}
                            <div>
                              <h3 className="font-semibold text-sm text-gray-700 mb-1">Resume</h3>
                              {application.ResumeURL ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openResume(application.ResumeURL);
                                  }}
                                  className="text-sm text-[#10559A] hover:text-[#DB4C77] underline"
                                >
                                  View Resume →
                                </button>
                              ) : (
                                <p className="text-sm text-gray-600">No resume</p>
                              )}
                            </div>

                            {/* Job Posting URL */}
                            <div>
                              <h3 className="font-semibold text-sm text-gray-700 mb-1">Job Posting</h3>
                              {application.JobURL ? (
                                <a
                                  href={application.JobURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#10559A] hover:text-[#DB4C77] underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Job Posting →
                                </a>
                              ) : (
                                <p className="text-sm text-gray-600">No job posting</p>
                              )}
                            </div>
                          </div>

                          {/* Notes Section - Bottom */}
                          {application.Notes && (
                            <div>
                              <h3 className="font-semibold text-sm text-gray-700 mb-2">Notes</h3>
                              <p className="text-sm text-gray-600">{application.Notes}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

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
