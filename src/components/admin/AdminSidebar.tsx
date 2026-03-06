import { Package, ShoppingCart, LogOut, BarChart3, Store } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Products", key: "products", icon: Package },
  { title: "Orders", key: "orders", icon: ShoppingCart },
  { title: "Analytics", key: "analytics", icon: BarChart3 },
];

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const AdminSidebar = ({ activeSection, onSectionChange, onLogout }: AdminSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo / Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${collapsed ? "justify-center px-2" : ""}`}>
          <img src={logo} alt="LUBB GO" className="h-16 w-auto rounded-lg" />
          {!collapsed && (
            <div>
              <p className="font-display font-black text-sm text-foreground uppercase tracking-wider">Tacti8ai</p>
              <p className="text-[10px] text-muted-foreground">Admin Dashboard</p>
            </div>
          )}
        </div>

        <SidebarGroup className="mt-2">
          {!collapsed && (
            <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Management
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = activeSection === item.key;
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.key)}
                      tooltip={item.title}
                      className={`transition-all duration-150 ${
                        active
                          ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary rounded-l-none"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick link */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="View Store"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <Store className="h-4 w-4" />
                    {!collapsed && <span>View Store</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip="Logout"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
