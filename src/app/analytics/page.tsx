"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import AnalyticsView from "@/components/AnalyticsView";

function AnalyticsPageContent() {
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

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-900/40 rounded-3xl" />}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
