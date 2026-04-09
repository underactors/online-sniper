import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Terminal, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Logs() {
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/logs"],
    queryFn: async () => {
      const res = await fetch("/api/logs");
      return res.json();
    },
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Terminal className="w-8 h-8 mr-3 text-primary" />
            System Logs
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time status updates and engine events.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCcw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-[180px] font-medium">Timestamp</TableHead>
                  <TableHead className="w-[100px] font-medium">Level</TableHead>
                  <TableHead className="w-[100px] font-medium">Mode</TableHead>
                  <TableHead className="font-medium">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No logs available yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id} className="border-border/50 hover:bg-white/5 transition-colors">
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {format(new Date(log.timestamp), "MMM d, HH:mm:ss.SSS")}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-mono",
                            log.level === 'success' && "text-success border-success/30 bg-success/10",
                            log.level === 'error' && "text-destructive border-destructive/30 bg-destructive/10",
                            log.level === 'info' && "text-primary border-primary/30 bg-primary/10"
                          )}
                        >
                          {log.level?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.mode ? (
                          <Badge variant="secondary" className="text-[10px]">{log.mode.toUpperCase()}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-mono whitespace-pre-wrap">
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
