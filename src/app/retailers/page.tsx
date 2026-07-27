"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import RetailersView from "@/components/RetailersView";

export default function RetailersPage() {
  const router = useRouter();
  const { retailers, searchQuery, isAdmin } = useDashboard();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <RetailersView 
      retailers={retailers}
      searchQuery={searchQuery}
    />
  );
}

