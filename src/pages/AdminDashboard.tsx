import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProductsManager from "@/components/admin/ProductsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import AnalyticsSection from "@/components/admin/AnalyticsSection";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const getAdminSession = () => {
  const raw = localStorage.getItem("admin_session") || sessionStorage.getItem("admin_session");
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem("admin_session");
      sessionStorage.removeItem("admin_session");
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("products");
  const navigate = useNavigate();

  useEffect(() => {
    const session = getAdminSession();
    if (!session) navigate("/admin");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_session");
    navigate("/admin");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 md:h-14 flex items-center border-b border-border px-3 md:px-4 gap-2 md:gap-3 bg-card sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="font-display text-base md:text-lg font-semibold capitalize">{activeSection}</h1>
          </header>
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            {activeSection === "products" && <ProductsManager />}
            {activeSection === "orders" && <OrdersManager />}
            {activeSection === "analytics" && <AnalyticsSection />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
