"use client";

import { useDashboard } from "@/context/DashboardContext";
import InventoryView from "@/components/InventoryView";

export default function InventoryPage() {
  const { inventory, searchQuery, restockSku, setIsModalOpen } = useDashboard();

  return (
    <InventoryView 
      inventory={inventory}
      searchQuery={searchQuery}
      onRestock={restockSku}
      onOpenAddSkuModal={() => setIsModalOpen(true)}
    />
  );
}
