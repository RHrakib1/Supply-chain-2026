"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import OrdersView from "@/components/OrdersView";

function OrdersPageContent() {
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-900/40 rounded-3xl" />}>
      <OrdersPageContent />
    </Suspense>
  );
}
