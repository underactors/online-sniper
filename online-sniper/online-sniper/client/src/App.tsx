import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import { useEffect } from "react";

import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Proxies from "@/pages/proxies";
import Usernames from "@/pages/usernames";
import Logs from "@/pages/logs";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const { data: auth, isLoading } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      return res.json();
    }
  });

  useEffect(() => {
    if (!isLoading && auth) {
      if (!auth.authenticated && location !== "/login") {
        setLocation("/login");
      } else if (auth.authenticated && location === "/login") {
        setLocation("/");
      }
    }
  }, [auth, isLoading, location, setLocation]);

  if (isLoading) return null;

  if (auth && !auth.authenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/settings" component={Settings} />
        <Route path="/proxies" component={Proxies} />
        <Route path="/usernames" component={Usernames} />
        <Route path="/logs" component={Logs} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
