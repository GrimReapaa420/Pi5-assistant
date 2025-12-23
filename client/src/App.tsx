import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ResponsiveNav } from "@/components/responsive-nav";
import Dashboard from "@/pages/dashboard";
import Configuration from "@/pages/configuration";
import Logs from "@/pages/logs";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import { useMemo } from "react";

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
            <div className="flex flex-col min-h-[100dvh] bg-background text-foreground">
              <ResponsiveNav />
              <main className="flex-1 overflow-auto p-4 md:p-6">
                <Routes />
              </main>
            </div>
            <Toaster />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
