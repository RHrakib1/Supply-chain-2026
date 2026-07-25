"use client";

import { useDashboard } from "@/context/DashboardContext";
import RetailersView from "@/components/RetailersView";

export default function RetailersPage() {
  const { retailers, searchQuery } = useDashboard();

  return (
    <RetailersView 
      retailers={retailers}
      searchQuery={searchQuery}
    />
  );
}
