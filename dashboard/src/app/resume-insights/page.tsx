"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sampleApplicationData } from "@/data/sample-applications-data";

interface ResumeVersion {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  dateApplied: string;
  resumeUrl: string;
  extractedText?: string;
  analysisGenerated?: boolean;
}

interface ResumeDiff {
  from: ResumeVersion;
  to: ResumeVersion;
  summary: string;
  changes: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  aiInsights?: string;
}

export default function ResumeInsightsPage() {
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComparison, setSelectedComparison] = useState<ResumeDiff | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      // Fetch applications with resumes
      const response = await fetch("/api/dynamodb");
      const data = await response.json();
      
      const fetchedApps = data.data || data.applications || [];
      const resumeData: ResumeVersion[] = fetchedApps
        .filter((app: any) => app.ResumeURL)
        .map((app: any) => ({
          id: app.ApplicationID,
          applicationId: app.ApplicationID,
          company: app.Company,
          role: app.Role,
          dateApplied: app.DateApplied,
          resumeUrl: app.ResumeURL,
        }));

      if (resumeData.length === 0) {
        // Use sample data if no real data with resumes
        const sampleResumes = sampleApplicationData
          .filter(app => app.ResumeURL)
          .map(app => ({
            id: app.ApplicationID,
            applicationId: app.ApplicationID,
            company: app.Company,
            role: app.Role,
            dateApplied: app.DateApplied,
            resumeUrl: app.ResumeURL,
          }));
        setResumes(sampleResumes);
        setUsingSampleData(true);
      } else {
        setResumes(resumeData);
        setUsingSampleData(false);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
      // Fallback to sample data on error
      const sampleResumes = sampleApplicationData
        .filter(app => app.ResumeURL)
        .map(app => ({
          id: app.ApplicationID,
          applicationId: app.ApplicationID,
          company: app.Company,
          role: app.Role,
          dateApplied: app.DateApplied,
          resumeUrl: app.ResumeURL,
        }));
      setResumes(sampleResumes);
      setUsingSampleData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTextFromPDF = async (resumeUrl: string): Promise<string> => {
    // This would call your backend endpoint to extract text from PDF
    // For now, return placeholder
    return "Sample resume text content...";
  };

  const compareResumes = async (resume1: ResumeVersion, resume2: ResumeVersion) => {
    setIsAnalyzing(true);
    
    try {
      // Extract text from both resumes
      const text1 = await extractTextFromPDF(resume1.resumeUrl);
      const text2 = await extractTextFromPDF(resume2.resumeUrl);

      // Simple text comparison (in production, use a proper diff library)
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');

      const added = lines2.filter(line => !lines1.includes(line));
      const removed = lines1.filter(line => !lines2.includes(line));

      // Call Gemini API for AI analysis
      const aiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Analyze the differences between these two resume versions:

Resume 1 (for ${resume1.role} at ${resume1.company}):
${text1}

Resume 2 (for ${resume2.role} at ${resume2.company}):
${text2}

Provide insights on:
1. What specific changes were made (skills, experience, formatting)
2. How these changes might impact the application for this specific role
3. Whether the changes align with the job requirements
4. Suggestions for improvement

Keep the response concise and actionable.`,
        }),
      });

      const aiData = await aiResponse.json();

      const diff: ResumeDiff = {
        from: resume1,
        to: resume2,
        summary: `Comparing resume for ${resume1.company} vs ${resume2.company}`,
        changes: {
          added: added.slice(0, 5), // Limit to 5 for display
          removed: removed.slice(0, 5),
          modified: [],
        },
        aiInsights: aiData.text || "AI analysis unavailable",
      };

      setSelectedComparison(diff);
    } catch (error) {
      console.error("Error comparing resumes:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4C77]"></div>
      </div>
    );
  }

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
                No resume data found in DynamoDB. Showing sample resumes to demonstrate features. 
                Upload resumes with your applications to see AI-powered insights here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#DB4C77] to-[#10559A] bg-clip-text text-transparent">
          AI Resume Insights
        </h1>
        <p className="text-gray-600 mt-2">
          Compare resume versions and get AI-powered insights on changes
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
            <p className="text-gray-500 mb-4">
              Upload resumes with your applications to start tracking changes
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume List */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Resume Versions ({resumes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {resumes.map((resume, index) => (
                    <div
                      key={resume.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#10559A] transition-colors cursor-pointer"
                      onClick={() => {
                        if (index > 0) {
                          compareResumes(resumes[index - 1], resume);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{resume.role}</h4>
                          <p className="text-sm text-gray-600">{resume.company}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied: {formatDate(resume.dateApplied)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            v{resumes.length - index}
                          </span>
                        </div>
                      </div>
                      {index > 0 && (
                        <Button
                          size="sm"
                          className="mt-3 w-full bg-gradient-to-r from-[#10559A] to-[#3CA2C8]"
                          onClick={(e) => {
                            e.stopPropagation();
                            compareResumes(resumes[index - 1], resume);
                          }}
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Compare with previous
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-0 shadow-lg mt-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-[#10559A] flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How it works</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Click "Compare with previous" to analyze changes</li>
                      <li>• AI extracts text from both PDF resumes</li>
                      <li>• Identifies added, removed, and modified content</li>
                      <li>• Provides insights on how changes impact your application</li>
                      <li>• Suggests improvements for future versions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Results */}
          <div>
            {isAnalyzing ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4C77] mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing resume changes with AI...</p>
                </CardContent>
              </Card>
            ) : selectedComparison ? (
              <div className="space-y-6">
                {/* Comparison Header */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-[#10559A] to-[#3CA2C8] text-white">
                  <CardContent className="py-6">
                    <h3 className="font-bold text-lg mb-2">Resume Comparison</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex-1">
                        <p className="opacity-90">From:</p>
                        <p className="font-semibold">{selectedComparison.from.company}</p>
                      </div>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <div className="flex-1 text-right">
                        <p className="opacity-90">To:</p>
                        <p className="font-semibold">{selectedComparison.to.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#DB4C77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI-Powered Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                        <p className="text-gray-700 whitespace-pre-line">
                          {selectedComparison.aiInsights}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Text Changes */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Textual Changes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedComparison.changes.added.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Added Content
                          </h4>
                          <div className="space-y-1">
                            {selectedComparison.changes.added.map((line, i) => (
                              <div key={i} className="bg-green-50 border-l-4 border-green-500 px-3 py-2 text-sm">
                                <code className="text-green-800">{line}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedComparison.changes.removed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                            Removed Content
                          </h4>
                          <div className="space-y-1">
                            {selectedComparison.changes.removed.map((line, i) => (
                              <div key={i} className="bg-red-50 border-l-4 border-red-500 px-3 py-2 text-sm">
                                <code className="text-red-800">{line}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedComparison.changes.added.length === 0 && selectedComparison.changes.removed.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No significant changes detected</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-lg bg-green-50">
                    <CardContent className="py-4 text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {selectedComparison.changes.added.length}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Lines Added</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-red-50">
                    <CardContent className="py-4 text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {selectedComparison.changes.removed.length}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Lines Removed</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select resumes to compare
                  </h3>
                  <p className="text-gray-500">
                    Click "Compare with previous" on any resume version to see AI-powered insights
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
