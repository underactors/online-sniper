import { z } from "zod";
import { insertSettingsSchema, insertBotTokenSchema, insertUserTokenSchema, insertProxySchema, settings, stats, foundUsernames, proxies, botTokens, userTokens } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      }
    }
  },
  botTokens: {
    list: {
      method: 'GET' as const,
      path: '/api/bot-tokens' as const,
      responses: {
        200: z.array(z.custom<typeof botTokens.$inferSelect>()),
      }
    },
    add: {
      method: 'POST' as const,
      path: '/api/bot-tokens' as const,
      input: insertBotTokenSchema,
      responses: {
        201: z.custom<typeof botTokens.$inferSelect>(),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bot-tokens/:id' as const,
      responses: {
        204: z.void(),
      }
    },
  },
  userTokens: {
    list: {
      method: 'GET' as const,
      path: '/api/user-tokens' as const,
      responses: {
        200: z.array(z.custom<typeof userTokens.$inferSelect>()),
      }
    },
    add: {
      method: 'POST' as const,
      path: '/api/user-tokens' as const,
      input: insertUserTokenSchema,
      responses: {
        201: z.custom<typeof userTokens.$inferSelect>(),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/user-tokens/:id' as const,
      responses: {
        204: z.void(),
      }
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.custom<typeof stats.$inferSelect>(),
      }
    }
  },
  bot: {
    start: {
      method: 'POST' as const,
      path: '/api/bot/start' as const,
      responses: {
        200: z.object({ message: z.string() }),
        400: z.object({ message: z.string() })
      }
    },
    stop: {
      method: 'POST' as const,
      path: '/api/bot/stop' as const,
      responses: {
        200: z.object({ message: z.string() }),
      }
    }
  },
  usernames: {
    list: {
      method: 'GET' as const,
      path: '/api/usernames' as const,
      responses: {
        200: z.array(z.custom<typeof foundUsernames.$inferSelect>()),
      }
    }
  },
  proxies: {
    list: {
      method: 'GET' as const,
      path: '/api/proxies' as const,
      responses: {
        200: z.array(z.custom<typeof proxies.$inferSelect>()),
      }
    },
    add: {
      method: 'POST' as const,
      path: '/api/proxies' as const,
      input: z.object({ proxies: z.string() }),
      responses: {
        201: z.object({ added: z.number() }),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/proxies/:id' as const,
      responses: {
        204: z.void(),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
