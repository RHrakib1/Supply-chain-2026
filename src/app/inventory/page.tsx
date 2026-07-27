"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import InventoryView from "@/components/InventoryView";

export default function InventoryPage() {
  const router = useRouter();
  const { inventory, searchQuery, restockSku, setIsModalOpen, isAdmin } = useDashboard();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <InventoryView 
      inventory={inventory}
      searchQuery={searchQuery}
      onRestock={restockSku}
      onOpenAddSkuModal={() => setIsModalOpen(true)}
    />
  );
}

