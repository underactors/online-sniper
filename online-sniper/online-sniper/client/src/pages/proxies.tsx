import { useState } from "react";
import { Trash2, Plus, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useProxies, useAddProxies, useDeleteProxy } from "@/hooks/use-proxies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Proxies() {
  const [proxyInput, setProxyInput] = useState("");
  const { data: proxies = [], isLoading } = useProxies();
  const addProxies = useAddProxies();
  const deleteProxy = useDeleteProxy();

  const handleAdd = () => {
    if (!proxyInput.trim()) return;
    addProxies.mutate({ proxies: proxyInput }, {
      onSuccess: () => setProxyInput("")
    });
  };

  const workingCount = proxies.filter(p => p.isWorking).length;
  const deadCount = proxies.length - workingCount;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-white/5 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              Add Proxies
            </CardTitle>
            <CardDescription>
              Paste your proxies here. Format: <code className="text-primary/80 bg-primary/10 px-1 rounded">http://user:pass@ip:port</code> or <code className="text-primary/80 bg-primary/10 px-1 rounded">http://ip:port</code>. One per line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={proxyInput}
              onChange={(e) => setProxyInput(e.target.value)}
              placeholder="http://username:password@192.168.1.1:8080&#10;http://10.0.0.1:3128"
              className="min-h-[160px] font-data text-sm bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary resize-none"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Residential proxies are highly recommended to bypass Discord's strict rate limits.
              </span>
              <Button 
                onClick={handleAdd}
                disabled={!proxyInput.trim() || addProxies.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
              >
                {addProxies.isPending ? "Adding..." : "Import Proxies"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader>
            <CardTitle>Pool Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div>
              <div className="text-4xl font-bold font-data text-foreground">{proxies.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Proxies in Pool</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center text-success font-medium">
                  <ShieldCheck className="w-4 h-4 mr-2" /> Working
                </div>
                <span className="font-data font-bold text-success">{workingCount}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center text-destructive font-medium">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Dead / Blocked
                </div>
                <span className="font-data font-bold text-destructive">{deadCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader>
          <CardTitle>Active Proxy Rotation</CardTitle>
          <CardDescription>
            The bot automatically rotates through these IPs for every request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-medium">Proxy URL</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Last Used</TableHead>
                  <TableHead className="text-right font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Loading proxy pool...
                    </TableCell>
                  </TableRow>
                ) : proxies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Info className="w-8 h-8 mb-2 opacity-50" />
                        <p>No proxies configured.</p>
                        <p className="text-sm">The bot will use your server's IP (highly likely to get rate limited).</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  proxies.map((proxy) => {
                    // Mask password in URL for display
                    let displayUrl = proxy.url;
                    try {
                      const url = new URL(proxy.url);
                      if (url.password) {
                        displayUrl = proxy.url.replace(`:${url.password}@`, ':********@');
                      }
                    } catch (e) {}

                    return (
                      <TableRow key={proxy.id} className="border-border/50 hover:bg-white/5">
                        <TableCell className="font-data text-sm">{displayUrl}</TableCell>
                        <TableCell>
                          {proxy.isWorking ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              Working
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                              Dead
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {proxy.lastUsedAt 
                            ? formatDistanceToNow(new Date(proxy.lastUsedAt), { addSuffix: true })
                            : "Never"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteProxy.mutate(proxy.id)}
                            disabled={deleteProxy.isPending}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
