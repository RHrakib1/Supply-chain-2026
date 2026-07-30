"use client";

import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Modal from "./Modal";
import OrderModal from "./OrderModal";
import UpgradeModal from "./UpgradeModal";
import Preloader from "./Preloader";
import ToastContainer from "./Toast";
import { useDashboard } from "@/context/DashboardContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    searchQuery, 
    setSearchQuery, 
    isModalOpen, 
    setIsModalOpen, 
    isOrderModalOpen, 
    setIsOrderModalOpen, 
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeReason,
    isLoading,
    addSku, 
    createOrder,
    retailers,
    inventory,
    toasts,
    dismissToast,
  } = useDashboard();

  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0b0f19]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Global Hydration & Supabase Preloader Overlay */}
      <Preloader isLoading={isLoading} />
      
      {/* Global B2B Notification Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar with standard Next.js route navigation */}
      <Suspense fallback={null}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Add Product SKU Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddSku={addSku} 
      />

      {/* Global Order Processing Modal */}
      <OrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        retailers={retailers}
        inventory={inventory}
        onCreateOrder={createOrder}
      />

      {/* Global Upgrade Plan Required Modal */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason={upgradeReason}
      />
    </div>
  );
}
