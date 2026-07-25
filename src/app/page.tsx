"use client";

import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import DashboardView from "@/components/DashboardView";

export default function Home() {
  const router = useRouter();
  const { inventory, orders, setIsModalOpen } = useDashboard();

  const handleNavigate = (tab: string) => {
    const routeMap: Record<string, string> = {
      "Dashboard": "/",
      "Inventory": "/inventory",
      "Orders": "/orders",
      "Retailers": "/retailers",
      "Route Tracking": "/route-tracking",
      "Analytics": "/analytics"
    };
    if (routeMap[tab]) {
      router.push(routeMap[tab]);
    }
  };

  return (
    <DashboardView 
      inventory={inventory} 
      orders={orders} 
      onOpenRestockModal={() => setIsModalOpen(true)}
      onNavigate={handleNavigate}
    />
  );
}