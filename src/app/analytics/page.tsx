"use client";

import { useDashboard } from "@/context/DashboardContext";
import AnalyticsView from "@/components/AnalyticsView";

export default function AnalyticsPage() {
  const { searchQuery } = useDashboard();

  return (
    <AnalyticsView 
      searchQuery={searchQuery}
    />
  );
}
