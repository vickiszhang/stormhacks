"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApplicationData,
  sampleApplicationData,
} from "@/data/sample-applications-data";

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dynamodb");
        const data = await response.json();
        // API returns { success: true, data: [...], count: N }
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
        console.error("Error fetching applications:", error);
        // Fallback to sample data on error
        setApplications(sampleApplicationData);
        setUsingSampleData(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate analytics
  const totalApplications = applications.length;
  const withCoverLetter = applications.filter((app) => app.DidCL).length;
  const withoutCoverLetter = totalApplications - withCoverLetter;

  // Status breakdown
  const screening = applications.filter((app) => app.DateScreening).length;

  const interviews = applications.filter((app) => app.DateInterview).length;
  const offers = applications.filter((app) => app.DateAccepted).length;
  const rejections = applications.filter((app) => app.DateRejected).length;
  const pending =
    totalApplications - screening - interviews - offers - rejections;

  // Cover letter impact
  const clScreeningRate =
    withCoverLetter > 0
      ? (
          (applications.filter((app) => app.DidCL && app.DateScreening).length /
            withCoverLetter) *
          100
        ).toFixed(1)
      : "0";
  const noclScreeningRate =
    withoutCoverLetter > 0
      ? (
          (applications.filter((app) => !app.DidCL && app.DateScreening)
            .length /
            withoutCoverLetter) *
          100
        ).toFixed(1)
      : "0";

  const clInterviewRate =
    withCoverLetter > 0
      ? (
          (applications.filter((app) => app.DidCL && app.DateInterview).length /
            withCoverLetter) *
          100
        ).toFixed(1)
      : "0";
  const noclInterviewRate =
    withoutCoverLetter > 0
      ? (
          (applications.filter((app) => !app.DidCL && app.DateInterview)
            .length /
            withoutCoverLetter) *
          100
        ).toFixed(1)
      : "0";

  const clOfferRate =
    withCoverLetter > 0
      ? (
          (applications.filter((app) => app.DidCL && app.DateAccepted).length /
            withCoverLetter) *
          100
        ).toFixed(1)
      : "0";
  const noclOfferRate =
    withoutCoverLetter > 0
      ? (
          (applications.filter((app) => !app.DidCL && app.DateAccepted).length /
            withoutCoverLetter) *
          100
        ).toFixed(1)
      : "0";

  // Company distribution
  const companyCount: { [key: string]: number } = {};
  applications.forEach((app) => {
    companyCount[app.Company] = (companyCount[app.Company] || 0) + 1;
  });
  const topCompanies = Object.entries(companyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Time to response
  const avgDaysToScreening = applications
    .filter((app) => app.DateApplied && app.DateScreening)
    .map((app) => {
      const applied = new Date(app.DateApplied).getTime();
      const screening = new Date(app.DateScreening).getTime();
      return Math.floor((screening - applied) / (1000 * 60 * 60 * 24));
    })
    .reduce((sum, days, _, arr) => sum + days / arr.length, 0);

  const avgDaysToInterview = applications
    .filter((app) => app.DateApplied && app.DateInterview)
    .map((app) => {
      const applied = new Date(app.DateApplied).getTime();
      const interview = new Date(app.DateInterview).getTime();
      return Math.floor((interview - applied) / (1000 * 60 * 60 * 24));
    })
    .reduce((sum, days, _, arr) => sum + days / arr.length, 0);

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
            <svg
              className="w-5 h-5 text-[#10559A] mr-3 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-[#10559A] mb-1">
                Using Sample Data
              </h3>
              <p className="text-sm text-gray-600">
                No application data found in DynamoDB. Showing sample analytics
                to demonstrate features. Start tracking applications with the
                Chrome extension to see your real data here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#DB4C77] to-[#10559A] bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Data-driven insights about your job search
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#10559A]">
              {totalApplications}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Interview Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3CA2C8]">
              {totalApplications > 0
                ? ((interviews / totalApplications) * 100).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Offers Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{offers}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#DB4C77]">
              {totalApplications > 0
                ? ((offers / totalApplications) * 100).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Breakdown */}
      <Card className="border-0 shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-sm text-gray-600">
                  {pending} (
                  {totalApplications > 0
                    ? ((pending / totalApplications) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-400 h-3 rounded-full"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (pending / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Screening</span>
                <span className="text-sm text-gray-600">
                  {screening} (
                  {totalApplications > 0
                    ? ((screening / totalApplications) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#3CA2C8] h-3 rounded-full"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (screening / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Interview</span>
                <span className="text-sm text-gray-600">
                  {interviews} (
                  {totalApplications > 0
                    ? ((interviews / totalApplications) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#10559A] h-3 rounded-full"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (interviews / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Offers</span>
                <span className="text-sm text-gray-600">
                  {offers} (
                  {totalApplications > 0
                    ? ((offers / totalApplications) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (offers / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Rejections</span>
                <span className="text-sm text-gray-600">
                  {rejections} (
                  {totalApplications > 0
                    ? ((rejections / totalApplications) * 100).toFixed(0)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (rejections / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cover Letter Impact */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Cover Letter Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">
                    Total Applications
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-center mb-2">
                      <div className="text-2xl font-bold text-[#10559A]">
                        {withCoverLetter}
                      </div>
                      <div className="text-xs text-gray-500">
                        With Cover Letter
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-center mb-2">
                      <div className="text-2xl font-bold text-gray-400">
                        {withoutCoverLetter}
                      </div>
                      <div className="text-xs text-gray-500">
                        Without Cover Letter
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Screening Rate
                      </span>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <div className="bg-[#10559A] text-white text-center py-2 rounded-lg font-semibold">
                          {clScreeningRate}%
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          With Cover Letter
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-300 text-gray-700 text-center py-2 rounded-lg font-semibold">
                          {noclScreeningRate}%
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          Without Cover Letter
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Interview Rate
                      </span>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <div className="bg-[#3CA2C8] text-white text-center py-2 rounded-lg font-semibold">
                          {clInterviewRate}%
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          With Cover Letter
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-300 text-gray-700 text-center py-2 rounded-lg font-semibold">
                          {noclInterviewRate}%
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          Without Cover Letter
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Offer Rate</span>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <div className="bg-green-600 text-white text-center py-2 rounded-lg font-semibold">
                          {clOfferRate}%
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          With Cover Letter
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-300 text-gray-700 text-center py-2 rounded-lg font-semibold">
                          {noclOfferRate}%
                        </div>
                        <div className="text-xs text-center text-gray-500 mt-1">
                          Without Cover Letter
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {withCoverLetter > 0 && withoutCoverLetter > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Insight:</strong> Applications with cover letters
                    have a{" "}
                    {parseFloat(clScreeningRate) > parseFloat(noclScreeningRate)
                      ? "higher"
                      : "lower"}{" "}
                    screening rate (
                    {Math.abs(
                      parseFloat(clScreeningRate) -
                        parseFloat(noclScreeningRate)
                    ).toFixed(1)}
                    % difference).
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Companies */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Companies You're Targeting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCompanies.length > 0 ? (
                topCompanies.map(([company, count]) => (
                  <div key={company}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {company}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} {count === 1 ? "application" : "applications"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#DB4C77] to-[#F9C6D7] h-2 rounded-full"
                        style={{
                          width: `${(count / totalApplications) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No application data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#10559A] mb-2">
                  {avgDaysToScreening > 0
                    ? Math.round(avgDaysToScreening)
                    : "—"}
                </div>
                <div className="text-sm text-gray-600">Days to Screening</div>
                <p className="text-xs text-gray-500 mt-2">
                  Average time from application to first screening call
                </p>
              </div>

              <div className="border-t pt-6 text-center">
                <div className="text-5xl font-bold text-[#3CA2C8] mb-2">
                  {avgDaysToInterview > 0
                    ? Math.round(avgDaysToInterview)
                    : "—"}
                </div>
                <div className="text-sm text-gray-600">Days to Interview</div>
                <p className="text-xs text-gray-500 mt-2">
                  Average time from application to interview
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Application → Screening
                  </span>
                  <span className="text-2xl font-bold text-[#3CA2C8]">
                    {totalApplications > 0
                      ? ((screening / totalApplications) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#3CA2C8] h-2 rounded-full"
                    style={{
                      width: `${
                        totalApplications > 0
                          ? (screening / totalApplications) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Application → Interview
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {totalApplications > 0
                      ? ((interviews / totalApplications) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${
                        totalApplications > 0
                          ? (interviews / totalApplications) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Screening → Interview
                  </span>
                  <span className="text-2xl font-bold text-[#10559A]">
                    {screening > 0
                      ? (
                          (Math.min(interviews, screening) / screening) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#10559A] h-2 rounded-full"
                    style={{
                      width: `${
                        screening > 0
                          ? (Math.min(interviews, screening) / screening) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Interview → Offer</span>
                  <span className="text-2xl font-bold text-green-600">
                    {interviews > 0
                      ? ((offers / interviews) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        interviews > 0 ? (offers / interviews) * 100 : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#DB4C77] to-[#F9C6D7] rounded-lg p-4 text-white mt-4">
                <p className="text-sm font-semibold mb-1">Overall Conversion</p>
                <p className="text-3xl font-bold">
                  {totalApplications > 0
                    ? ((offers / totalApplications) * 100).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-xs opacity-90 mt-1">
                  of applications result in offers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
