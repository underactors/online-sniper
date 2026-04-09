import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { botService } from "./bot";
import session from "express-session";
import MemoryStore from "memorystore";

const MyMemoryStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedInitialData();

  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MyMemoryStore({
        checkPeriod: 86400000
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "fallback-dev-secret-change-in-production"
    })
  );

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && (req.session as any).authenticated) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || "discordgc";
    const adminPass = process.env.ADMIN_PASSWORD || "japan2029";
    if (username === adminUser && password === adminPass) {
      (req.session as any).authenticated = true;
      res.json({ message: "Logged in" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/me", (req, res) => {
    if (req.session && (req.session as any).authenticated) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.get(api.settings.get.path, requireAuth, async (req, res) => {
    const s = await storage.getSettings();
    res.json(s);
  });

  app.patch(api.settings.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const updated = await storage.updateSettings(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.botTokens.list.path, requireAuth, async (req, res) => {
    const tokens = await storage.getBotTokens();
    res.json(tokens);
  });

  app.post(api.botTokens.add.path, requireAuth, async (req, res) => {
    try {
      const input = api.botTokens.add.input.parse(req.body);
      const bt = await storage.addBotToken(input.token, input.channelId);
      res.status(201).json(bt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.botTokens.delete.path, requireAuth, async (req, res) => {
    await storage.deleteBotToken(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.userTokens.list.path, requireAuth, async (req, res) => {
    const tokens = await storage.getUserTokens();
    res.json(tokens);
  });

  app.post(api.userTokens.add.path, requireAuth, async (req, res) => {
    try {
      const input = api.userTokens.add.input.parse(req.body);
      const ut = await storage.addUserToken(input.token, input.label);
      res.status(201).json(ut);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.userTokens.delete.path, requireAuth, async (req, res) => {
    await storage.deleteUserToken(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    const s = await storage.getStats();
    res.json(s);
  });

  app.post(api.bot.start.path, requireAuth, async (req, res) => {
    try {
      // If already marked as running but service isn't, ensure it's clean
      if (!botService.isRunning) {
        await botService.stop(); 
      }
      await botService.start();
      res.json({ message: "Bot started successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to start bot" });
    }
  });

  app.post(api.bot.stop.path, requireAuth, async (req, res) => {
    try {
      await botService.stop();
      res.json({ message: "Bot stopped successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Failed to stop bot" });
    }
  });

  app.get(api.usernames.list.path, requireAuth, async (req, res) => {
    const usernames = await storage.getFoundUsernames();
    res.json(usernames);
  });

  app.get(api.proxies.list.path, requireAuth, async (req, res) => {
    const proxyList = await storage.getProxies();
    res.json(proxyList);
  });

  app.post(api.proxies.add.path, requireAuth, async (req, res) => {
    try {
      const input = api.proxies.add.input.parse(req.body);
      const proxiesArr = input.proxies.split('\n').map(p => p.trim()).filter(p => p.length > 0);
      
      let added = 0;
      for (const p of proxiesArr) {
        await storage.addProxy(p);
        added++;
      }
      
      res.status(201).json({ added });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.proxies.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProxy(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/logs", requireAuth, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  return httpServer;
}
