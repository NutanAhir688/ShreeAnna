import { ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";

import { dashboardApi } from "@/services/api";


function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActivities() {
      try {
        setLoading(true);

        const data = await dashboardApi.getRecentActivities();

        setActivities(data);
      } catch (err) {
        console.error("Failed to load activities:", err);
        setError("Unable to load recent activities.");
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  function getDotClass(activity) {
    if (activity.type === "Farmer") {
      return "bg-slate-400";
    }

    if (activity.status === "Verified") {
      return "bg-emerald-500";
    }

    if (activity.status === "Pending Verification") {
      return "bg-amber-500";
    }

    return "bg-blue-500";
  }

  function formatTime(dateString) {
    const createdAt = new Date(dateString);
    const now = new Date();

    const differenceInMinutes = Math.floor(
      (now - createdAt) / (1000 * 60)
    );

    if (differenceInMinutes < 1) {
      return "Just now";
    }

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} minutes ago`;
    }

    const hours = Math.floor(differenceInMinutes / 60);

    if (hours < 24) {
      return `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);

    return days === 1 ? "Yesterday" : `${days} days ago`;
  }

  return (
    <Card className="shadow-xs border-slate-200/80 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-bold text-slate-900">
          Recent Activity
        </CardTitle>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200"
        >
          View All
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent>
        {loading && (
          <p className="text-sm text-slate-500">
            Loading activities...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && activities.length === 0 && (
          <p className="text-sm text-slate-500">
            No recent activities.
          </p>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={`${activity.type}-${index}`}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getDotClass(
                      activity
                    )}`}
                  />

                  <div>
                    <p className="font-bold text-slate-800 text-xs">
                      {activity.title}
                    </p>

                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {activity.subtitle}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  {formatTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentActivity;

