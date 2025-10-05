"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Insight {
  InsightID: string;
  Company: string;
  Role: string;
  Summary: string;
  CreatedAt: string;
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch("/api/insights");
        const data = await response.json();
        if (data.success) {
          setInsights(data.data);
        }
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-dark"></div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Insights Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No insights saved yet. Click the lightbulb on applications with interviews to generate insights.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Insights Reports</h1>
      <div className="grid grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.InsightID}>
            <CardHeader>
              <CardTitle className="text-lg">{insight.Role}</CardTitle>
              <p className="text-sm text-muted-foreground">{insight.Company}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(insight.CreatedAt)}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{insight.Summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
