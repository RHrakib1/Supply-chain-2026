"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import OrdersView from "@/components/OrdersView";

export default function OrdersPage() {
  const router = useRouter();
  const { orders, searchQuery, updateOrderStatus, setIsOrderModalOpen, userRole } = useDashboard();

  useEffect(() => {
    if (userRole === "user" || userRole === "driver") {
      router.replace("/route-tracking");
    }
  }, [userRole, router]);

  if (userRole === "user" || userRole === "driver") return null;

  return (
    <OrdersView 
      orders={orders}
      searchQuery={searchQuery}
      onUpdateOrderStatus={updateOrderStatus}
      onOpenOrderModal={() => setIsOrderModalOpen(true)}
    />
  );
}
