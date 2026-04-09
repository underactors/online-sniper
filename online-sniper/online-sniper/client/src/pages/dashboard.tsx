import { Play, Square, Activity, ShieldAlert, CheckCircle2, Target } from "lucide-react";
import { useStats, useSettings, useStartBot, useStopBot } from "@/hooks/use-bot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  
  const startBot = useStartBot();
  const stopBot = useStopBot();

  const isRunning = settings?.isRunning || false;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Control Panel */}
      <Card className="glass-panel overflow-hidden relative border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardContent className="p-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500",
                isRunning 
                  ? "bg-success/10 text-success glow-success border border-success/30" 
                  : "bg-muted text-muted-foreground border border-border"
              )}>
                <BotIcon className={cn("w-10 h-10", isRunning && "animate-pulse")} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Sniper Engine</h3>
                <p className="text-muted-foreground mt-1 flex items-center">
                  Status: 
                  <span className={cn(
                    "ml-2 font-semibold font-data",
                    isRunning ? "text-success" : "text-muted-foreground"
                  )}>
                    {isRunning ? "ONLINE_AND_HUNTING" : "OFFLINE"}
                  </span>
                  {settings?.words && settings.words.length > 0 && (
                    <span className="ml-3 px-2 py-0.5 rounded bg-orange-400/10 text-orange-400 text-xs font-mono border border-orange-400/20">
                      TARGETING: {settings.words.length} WORDS
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                onClick={() => startBot.mutate()}
                disabled={isRunning || startBot.isPending || settingsLoading}
                className={cn(
                  "w-32 font-semibold transition-all",
                  !isRunning && "bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
                )}
              >
                {startBot.isPending ? "Starting..." : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" /> START
                  </>
                )}
              </Button>
              
              <Button
                size="lg"
                variant={isRunning ? "destructive" : "outline"}
                onClick={() => stopBot.mutate()}
                disabled={!isRunning || stopBot.isPending || settingsLoading}
                className={cn(
                  "w-32 font-semibold transition-all",
                  isRunning && "glow-destructive"
                )}
              >
                {stopBot.isPending ? "Stopping..." : (
                  <>
                    <Square className="w-4 h-4 mr-2 fill-current" /> STOP
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Attempts"
          value={stats?.totalChecked.toLocaleString() || "0"}
          icon={Activity}
          loading={statsLoading}
          description="Total usernames checked"
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <MetricCard
          title="Successful Snipes"
          value={stats?.availableFound.toLocaleString() || "0"}
          icon={CheckCircle2}
          loading={statsLoading}
          description="Total usernames claimed"
          colorClass="text-success"
          bgClass="bg-success/10"
          glowClass="glow-success"
        />
        <MetricCard
          title="Current Targets"
          value={settings?.words?.length.toString() || "0"}
          icon={Target}
          loading={settingsLoading}
          description="Active target usernames"
          colorClass="text-orange-400"
          bgClass="bg-orange-400/10"
        />
        <MetricCard
          title="Rate Limits"
          value={stats?.rateLimitedCount.toLocaleString() || "0"}
          icon={ShieldAlert}
          loading={statsLoading}
          description="429 Too Many Requests"
          colorClass="text-destructive"
          bgClass="bg-destructive/10"
          glowClass={stats?.rateLimitedCount && stats.rateLimitedCount > 0 ? "glow-destructive border-destructive/30" : ""}
        />
      </div>

    </div>
  );
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  loading, 
  description,
  colorClass,
  bgClass,
  glowClass
}: { 
  title: string; 
  value: string; 
  icon: any; 
  loading: boolean;
  description: string;
  colorClass: string;
  bgClass: string;
  glowClass?: string;
}) {
  return (
    <Card className={cn("glass-panel relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/20", glowClass)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl", bgClass)}>
          <Icon className={cn("h-4 w-4", colorClass)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1" />
        ) : (
          <div className={cn("text-3xl font-bold tracking-tight font-data mt-1", colorClass)}>
            {value}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
