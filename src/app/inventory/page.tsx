"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import InventoryView from "@/components/InventoryView";

export default function InventoryPage() {
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

