import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import Configuration from "@/pages/configuration";
import Logs from "@/pages/logs";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import { useMemo, useState, useEffect } from "react";
import { BUILD_INFO } from "@/lib/buildInfo";
import { useIsMobile } from "@/hooks/use-mobile";

function DebugBanner() {
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  
  useEffect(() => {
    const update = () => setWidth(document.documentElement.clientWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black text-xs p-1 z-[9999] font-mono"
      onClick={() => setClickCount(c => c + 1)}
      data-testid="debug-banner"
    >
      v{BUILD_INFO.version} | W:{width} | Mobile:{isMobile ? "Y" : "N"} | Clicks:{clickCount}
    </div>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/config" component={Configuration} />
      <Route path="/logs" component={Logs} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Get base path from current location for HA ingress support
  const basePath = useMemo(() => {
    const path = window.location.pathname;
    const match = path.match(/^(\/api\/hassio_ingress\/[^/]+)/);
    if (match) {
      return match[1];
    }
    return "";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <SidebarProvider style={sidebarStyle as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                  <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-auto p-6">
                    <Routes />
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
            <Toaster />
            <DebugBanner />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
