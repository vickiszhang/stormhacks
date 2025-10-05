export interface ActivityLogItem {
  id: number;
  type: "application" | "interview" | "update" | "offer" | "rejection" | "note";
  action: string;
  details: string;
  timestamp: string;
  icon: "plus" | "calendar" | "update" | "check" | "x" | "note";
  applicationId?: string;
}

// Sample activity log data - in a real app, this would be fetched from your database
export const activityLog: ActivityLogItem[] = [
  {
    id: 1,
    type: "application",
    action: "New application",
    details: "Applied to Software Engineer at Google",
    timestamp: "2 hours ago",
    icon: "plus",
  },
  {
    id: 2,
    type: "interview",
    action: "Interview scheduled",
    details: "Frontend Developer at Meta - Oct 15, 2025",
    timestamp: "5 hours ago",
    icon: "calendar",
  },
  {
    id: 3,
    type: "update",
    action: "Status update",
    details: "Product Manager at Amazon moved to Screening",
    timestamp: "1 day ago",
    icon: "update",
  },
  {
    id: 4,
    type: "offer",
    action: "Offer received",
    details: "Senior Engineer at Microsoft",
    timestamp: "2 days ago",
    icon: "check",
  },
  {
    id: 5,
    type: "rejection",
    action: "Application closed",
    details: "Data Scientist at Netflix",
    timestamp: "3 days ago",
    icon: "x",
  },
  {
    id: 6,
    type: "note",
    action: "Note added",
    details: "Added follow-up note for Backend Engineer at Stripe",
    timestamp: "4 days ago",
    icon: "note",
  },
];

// Helper function to add new activity
export function addActivity(activity: Omit<ActivityLogItem, "id">): ActivityLogItem {
  const newActivity: ActivityLogItem = {
    ...activity,
    id: Date.now(), // Use timestamp as unique ID
  };
  activityLog.unshift(newActivity); // Add to beginning of array
  return newActivity;
}

// Helper function to get recent activities (limit)
export function getRecentActivities(limit: number = 10): ActivityLogItem[] {
  return activityLog.slice(0, limit);
}

// Helper function to format timestamp
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  
  return date.toLocaleDateString();
}
