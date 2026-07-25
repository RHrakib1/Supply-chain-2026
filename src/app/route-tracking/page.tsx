"use client";

import { useDashboard } from "@/context/DashboardContext";
import RouteTrackingView from "@/components/RouteTrackingView";

export default function RouteTrackingPage() {
  const { searchQuery } = useDashboard();

  return (
    <RouteTrackingView 
      searchQuery={searchQuery}
    />
  );
}
