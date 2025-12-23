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
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh',
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              className="bg-background text-foreground"
            >
              <ResponsiveNav />
              <main 
                style={{ 
                  flex: 1, 
                  overflow: 'auto',
                  padding: '16px',
                  minHeight: 0,
                }}
              >
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
