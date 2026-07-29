"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import OrdersView from "@/components/OrdersView";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, searchQuery, updateOrderStatus, setIsOrderModalOpen, isAdmin } = useDashboard();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/route-tracking");
    }
  }, [isAdmin, router]);

  if (!isAdmin) return null;

  return (
    <OrdersView 
      orders={orders}
      searchQuery={searchQuery}
      onUpdateOrderStatus={updateOrderStatus}
      onOpenOrderModal={() => setIsOrderModalOpen(true)}
    />
  );
}
