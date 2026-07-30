"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import InventoryView from "@/components/InventoryView";

function InventoryPageContent() {
  const router = useRouter();
  const { inventory, searchQuery, restockSku, setIsModalOpen, userRole } = useDashboard();

  useEffect(() => {
    if (userRole === "driver" || userRole === "retailer") {
      router.replace("/route-tracking");
    }
  }, [userRole, router]);

  if (userRole === "driver" || userRole === "retailer") return null;

  return (
    <InventoryView 
      inventory={inventory}
      searchQuery={searchQuery}
      onRestock={restockSku}
      onOpenAddSkuModal={() => setIsModalOpen(true)}
    />
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-900/40 rounded-3xl" />}>
      <InventoryPageContent />
    </Suspense>
  );
}
