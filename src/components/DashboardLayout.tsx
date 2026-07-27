"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Modal from "./Modal";
import OrderModal from "./OrderModal";
import UpgradeModal from "./UpgradeModal";
import Preloader from "./Preloader";
import { useDashboard } from "@/context/DashboardContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
    inventory 
  } = useDashboard();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Global Hydration & Supabase Preloader Overlay */}
      <Preloader isLoading={isLoading} />
      {/* Sidebar with standard Next.js route navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

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
