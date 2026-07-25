"use client";

import { useDashboard } from "@/context/DashboardContext";
import OrdersView from "@/components/OrdersView";

export default function OrdersPage() {
  const { orders, searchQuery, updateOrderStatus, setIsOrderModalOpen } = useDashboard();

  return (
    <OrdersView 
      orders={orders}
      searchQuery={searchQuery}
      onUpdateOrderStatus={updateOrderStatus}
      onOpenOrderModal={() => setIsOrderModalOpen(true)}
    />
  );
}
