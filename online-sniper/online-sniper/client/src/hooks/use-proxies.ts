import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, ProxiesAddInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useProxies() {
  return useQuery({
    queryKey: [api.proxies.list.path],
    queryFn: async () => {
      const res = await fetch(api.proxies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch proxies");
      return api.proxies.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Refresh occasionally to see proxy health
  });
}

export function useAddProxies() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ProxiesAddInput) => {
      const res = await fetch(api.proxies.add.path, {
        method: api.proxies.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add proxies");
      return api.proxies.add.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.proxies.list.path] });
      toast({
        title: "Proxies Added",
        description: `Successfully imported ${data.added} proxies.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteProxy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.proxies.delete.path, { id });
      const res = await fetch(url, {
        method: api.proxies.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete proxy");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.proxies.list.path] });
      toast({
        title: "Proxy Deleted",
        description: "The proxy was removed from the rotation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
