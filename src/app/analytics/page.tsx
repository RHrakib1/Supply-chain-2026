"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import AnalyticsView from "@/components/AnalyticsView";

export default function AnalyticsPage() {
  const router = useRouter();
  const { searchQuery, isAdmin } = useDashboard();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <AnalyticsView 
      searchQuery={searchQuery}
    />
  );
}

