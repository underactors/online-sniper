import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  Users, 
  Bot,
  Activity,
  Terminal,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-bot";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: settings } = useSettings();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Sniped Names", href: "/usernames", icon: Users },
    { name: "Proxy Manager", href: "/proxies", icon: ShieldCheck },
    { name: "Logs", href: "/logs", icon: Terminal },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await apiRequest("POST", "/api/logout");
    queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    setLocation("/login");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Bot className="w-6 h-6 text-primary mr-3" />
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Sniper<span className="text-primary">X</span>
          </h1>
        </div>
        
        <div className="p-4 flex-1">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.name}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(0,150,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Status Indicator at bottom of sidebar */}
        <div className="p-4 border-t border-border/50 bg-black/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Status</span>
            <div className="flex items-center">
              <span className={cn(
                "relative flex h-2.5 w-2.5 mr-2",
                settings?.isRunning ? "text-success" : "text-muted-foreground"
              )}>
                {settings?.isRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                )}
                <span className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  settings?.isRunning ? "bg-success glow-success" : "bg-muted-foreground"
                )}></span>
              </span>
              <span className="text-sm font-medium">
                {settings?.isRunning ? "Active" : "Idle"}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        
        <header className="h-16 flex items-center justify-between px-8 border-b border-border/50 bg-background/50 backdrop-blur-md z-10">
          <h2 className="text-lg font-semibold tracking-tight">
            {navigation.find(n => n.href === location)?.name || "Dashboard"}
          </h2>
          <div className="flex items-center space-x-4">
             {settings?.isRunning && (
               <div className="flex items-center text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20 glow-success">
                 <Activity className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                 Scanning Usernames
               </div>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 z-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
