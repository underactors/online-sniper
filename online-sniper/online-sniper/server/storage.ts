import { db } from "./db";
import { settings, stats, foundUsernames, proxies, botTokens, userTokens, logs } from "@shared/schema";
import type { Settings, Stats, FoundUsername, Proxy, UpdateSettingsRequest, BotToken, UserToken, Log } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
  
  getBotTokens(): Promise<BotToken[]>;
  addBotToken(token: string, channelId: string): Promise<BotToken>;
  deleteBotToken(id: number): Promise<void>;
  
  getUserTokens(): Promise<UserToken[]>;
  addUserToken(token: string, label?: string): Promise<UserToken>;
  deleteUserToken(id: number): Promise<void>;
  popUserToken(): Promise<UserToken | undefined>;
  
  getStats(): Promise<Stats>;
  incrementStats(field: 'totalChecked' | 'availableFound' | 'rateLimitedCount'): Promise<void>;
  
  getFoundUsernames(): Promise<FoundUsername[]>;
  addFoundUsername(username: string, snipedOnAccount?: boolean): Promise<FoundUsername>;
  
  getProxies(): Promise<Proxy[]>;
  addProxy(url: string): Promise<Proxy>;
  deleteProxy(id: number): Promise<void>;
  updateProxyLastUsed(id: number): Promise<void>;

  addLog(message: string, level: string): Promise<Log>;
  getLogs(limit?: number): Promise<Log[]>;
  
  seedInitialData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<Settings> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    const existing = await this.getSettings();
    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  async getBotTokens(): Promise<BotToken[]> {
    return await db.select().from(botTokens);
  }

  async addBotToken(token: string, channelId: string): Promise<BotToken> {
    const [bt] = await db.insert(botTokens).values({ token, channelId }).returning();
    return bt;
  }

  async deleteBotToken(id: number): Promise<void> {
    await db.delete(botTokens).where(eq(botTokens.id, id));
  }

  async getUserTokens(): Promise<UserToken[]> {
    return await db.select().from(userTokens);
  }

  async addUserToken(token: string, label: string = ""): Promise<UserToken> {
    const [ut] = await db.insert(userTokens).values({ token, label }).returning();
    return ut;
  }

  async deleteUserToken(id: number): Promise<void> {
    await db.delete(userTokens).where(eq(userTokens.id, id));
  }

  async popUserToken(): Promise<UserToken | undefined> {
    const [token] = await db.select().from(userTokens).limit(1);
    if (token) {
      await this.deleteUserToken(token.id);
      return token;
    }
    return undefined;
  }

  async getStats(): Promise<Stats> {
    const [stat] = await db.select().from(stats).limit(1);
    return stat;
  }

  async incrementStats(field: 'totalChecked' | 'availableFound' | 'rateLimitedCount'): Promise<void> {
    const existing = await this.getStats();
    await db.update(stats)
      .set({ [field]: sql`${stats[field]} + 1` })
      .where(eq(stats.id, existing.id));
  }

  async getFoundUsernames(): Promise<FoundUsername[]> {
    return await db.select().from(foundUsernames).orderBy(sql`${foundUsernames.createdAt} DESC`);
  }

  async addFoundUsername(username: string, snipedOnAccount: boolean = false): Promise<FoundUsername> {
    const [found] = await db.insert(foundUsernames).values({ username, snipedOnAccount }).returning();
    return found;
  }

  async getProxies(): Promise<Proxy[]> {
    return await db.select().from(proxies).orderBy(sql`${proxies.id} DESC`);
  }

  async addProxy(url: string): Promise<Proxy> {
    const [proxy] = await db.insert(proxies).values({ url }).returning();
    return proxy;
  }

  async deleteProxy(id: number): Promise<void> {
    await db.delete(proxies).where(eq(proxies.id, id));
  }

  async updateProxyLastUsed(id: number): Promise<void> {
    await db.update(proxies).set({ lastUsedAt: new Date() }).where(eq(proxies.id, id));
  }

  async addLog(message: string, level: string): Promise<Log> {
    const [log] = await db.insert(logs).values({ message, level }).returning();
    return log;
  }

  async getLogs(limit: number = 100): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.timestamp)).limit(limit);
  }

  async seedInitialData(): Promise<void> {
    const existingSettings = await db.select().from(settings).limit(1);
    if (existingSettings.length === 0) {
      await db.insert(settings).values({ words: [] });
    }
    const existingStats = await db.select().from(stats).limit(1);
    if (existingStats.length === 0) {
      await db.insert(stats).values({});
    }
  }
}

export const storage = new DatabaseStorage();
