import { Search, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useUsernames } from "@/hooks/use-usernames";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Usernames() {
  const { data: usernames = [], isLoading } = useUsernames();
  const [search, setSearch] = useState("");

  const filteredUsernames = usernames.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-primary" />
            Sniped Treasury
          </h2>
          <p className="text-muted-foreground mt-1">
            Successfully found combinations.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search usernames..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-white/10 focus-visible:ring-primary font-data"
          />
        </div>
      </div>

      <Card className="glass-panel border-white/5">
        <CardHeader className="pb-0">
          {/* Subtle header content if needed */}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-[100px] font-medium text-center">#</TableHead>
                  <TableHead className="font-medium text-lg">Username</TableHead>
                  <TableHead className="font-medium">Mode</TableHead>
                  <TableHead className="font-medium">Sniped</TableHead>
                  <TableHead className="text-right font-medium">Found At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                        Accessing database...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsernames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      {search ? (
                        "No usernames match your search."
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Trophy className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-lg font-medium text-foreground/50">No usernames sniped yet</p>
                          <p className="text-sm">Start the bot and configure proxies to begin hunting.</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsernames.map((item, index) => (
                    <TableRow key={item.id} className="border-border/50 hover:bg-white/5 group transition-colors">
                      <TableCell className="text-center font-data text-muted-foreground">
                        {filteredUsernames.length - index}
                      </TableCell>
                      <TableCell className="font-bold text-xl tracking-widest text-primary font-data">
                        {item.username}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-mono",
                            item.mode === '3-letter' && "text-purple-400 border-purple-400/30 bg-purple-400/10",
                            item.mode === '4-letter' && "text-blue-400 border-blue-400/30 bg-blue-400/10",
                            item.mode === '4-number' && "text-orange-400 border-orange-400/30 bg-orange-400/10",
                            item.mode === 'both' && "text-pink-400 border-pink-400/30 bg-pink-400/10"
                          )}
                        >
                          {item.mode?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.snipedOnAccount ? (
                          <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> SNIPED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-border/50">
                            FOUND
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground flex items-center justify-end">
                        <Calendar className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                        {item.createdAt 
                          ? format(new Date(item.createdAt), "MMM d, yyyy • HH:mm:ss")
                          : "Unknown"
                        }
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
