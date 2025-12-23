import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Settings,
  FileText,
  Info,
  Cpu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Configuration",
    url: "/config",
    icon: Settings,
  },
  {
    title: "Logs",
    url: "/logs",
    icon: FileText,
  },
  {
    title: "About",
    url: "/about",
    icon: Info,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer hover-elevate rounded-md p-2 -m-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-base" data-testid="text-app-title">
                Pironman5 Lite
              </h1>
              <p className="text-xs text-muted-foreground">HA Addon</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Version</span>
          <Badge variant="secondary" className="text-xs">
            1.0.0
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
