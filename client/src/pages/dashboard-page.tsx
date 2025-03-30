import { useState } from "react";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import StatsOverview from "@/components/dashboard/stats-overview";
import AlertsSection from "@/components/dashboard/alerts-section";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import QuickActions from "@/components/dashboard/quick-actions";
import ExpiringMedications from "@/components/dashboard/expiring-medications";
import RecentPatients from "@/components/dashboard/recent-patients";

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <div className="flex items-center mt-2 text-sm text-slate-500">
              <span>{currentDate}</span>
              <span className="mx-2">•</span>
              <span>Last updated {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* Stats Overview */}
          <StatsOverview />
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <AlertsSection />
              <RecentTransactions />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <QuickActions />
              <ExpiringMedications />
              <RecentPatients />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
