import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useUsernames() {
  return useQuery({
    queryKey: [api.usernames.list.path],
    queryFn: async () => {
      const res = await fetch(api.usernames.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch usernames");
      return api.usernames.list.responses[200].parse(await res.json());
    },
    // Poll every 3 seconds to see newly sniped names in real-time
    refetchInterval: 3000,
  });
}
