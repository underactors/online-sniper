import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Settings, Stats, BotToken, UserToken } from "@shared/schema";

export function useSettings() {
  return useQuery<Settings>({
    queryKey: [api.settings.get.path],
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const res = await apiRequest("PATCH", api.settings.update.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({
        title: "Settings Saved",
        description: "Your bot configuration has been updated.",
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

export function useBotTokens() {
  return useQuery<BotToken[]>({
    queryKey: [api.botTokens.list.path],
  });
}

export function useAddBotToken() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { token: string; channelId: string; assignedModes: string[] }) => {
      const res = await apiRequest("POST", api.botTokens.add.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.botTokens.list.path] });
      toast({ title: "Bot token added" });
    },
  });
}

export function useDeleteBotToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", api.botTokens.delete.path.replace(":id", id.toString()));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.botTokens.list.path] });
    },
  });
}

export function useUserTokens() {
  return useQuery<UserToken[]>({
    queryKey: [api.userTokens.list.path],
  });
}

export function useAddUserToken() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await apiRequest("POST", api.userTokens.add.path, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userTokens.list.path] });
      toast({ title: "User token added" });
    },
  });
}

export function useDeleteUserToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", api.userTokens.delete.path.replace(":id", id.toString()));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userTokens.list.path] });
    },
  });
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: [api.stats.get.path],
    refetchInterval: 3000,
  });
}

export function useStartBot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", api.bot.start.path);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({
        title: "Bot Started",
        description: "The sniper is now active and checking usernames.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useStopBot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", api.bot.stop.path);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
      toast({
        title: "Bot Stopped",
        description: "The sniper has been paused.",
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
