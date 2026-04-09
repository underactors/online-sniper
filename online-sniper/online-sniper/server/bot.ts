import { Client, IntentsBitField, TextChannel } from 'discord.js';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { storage } from './storage';

export class DiscordBot {
  botClients: Map<string, Client> = new Map(); // token -> client
  isRunning = false;
  timer: NodeJS.Timeout | null = null;

  async start() {
    if (this.isRunning) return;
    
    const botTokens = await storage.getBotTokens();
    if (botTokens.length === 0) {
      await storage.addLog("No bot tokens configured. Cannot start engine.", "error");
      throw new Error("No bot tokens configured. Please add at least one in Settings.");
    }

    for (const bt of botTokens) {
      const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });
      try {
        await client.login(bt.token);
        this.botClients.set(bt.token, client);
        await storage.addLog(`Bot logged in: ${bt.token.substring(0, 10)}...`, "info");
      } catch (err) {
        await storage.addLog(`Failed to login bot token: ${bt.token.substring(0, 10)}...`, "error");
      }
    }

    if (this.botClients.size === 0) {
      this.isRunning = false;
      await storage.updateSettings({ isRunning: false });
      throw new Error("All bot tokens failed to login.");
    }
    
    this.isRunning = true;
    await storage.updateSettings({ isRunning: true });
    await storage.addLog("Target sniper engine started.", "success");
    this.checkLoop();
  }

  async stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    for (const client of this.botClients.values()) {
      try {
        client.destroy();
      } catch (e) {}
    }
    this.botClients.clear();
    
    this.isRunning = false;
    await storage.updateSettings({ isRunning: false });
    await storage.addLog("Target sniper engine stopped.", "info");
  }

  async checkLoop() {
    if (!this.isRunning) return;

    try {
      await this.checkTargets();
    } catch (error) {
      console.error("Error in check loop:", error);
    }

    const settings = await storage.getSettings();
    const interval = settings?.checkIntervalSeconds || 180;
    
    if (!this.isRunning) return;
    this.timer = setTimeout(() => this.checkLoop(), interval * 1000);
  }

  async checkTargets() {
    const settings = await storage.getSettings();
    const words = settings?.words || [];
    if (words.length === 0) return;

    for (const username of words) {
      if (!this.isRunning) break;
      
      const proxyAgent = await this.getProxyAgent(settings.rotationalProxyUrl);
      await storage.addLog(`Checking availability for: ${username}`, "info");

      try {
        const response = await axios.post(
          "https://discord.com/api/v9/unique-username/username-attempt-unauthed",
          { username },
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            httpsAgent: proxyAgent,
            timeout: 10000
          }
        );

        await storage.incrementStats('totalChecked');

        if (response.data && !response.data.taken) {
          await storage.incrementStats('availableFound');
          await storage.addLog(`TARGET AVAILABLE: ${username}! Attempting to claim...`, "success");
          
          let sniped = false;
          const userToken = await storage.popUserToken();
          
          if (userToken) {
            try {
              await axios.patch(
                "https://discord.com/api/v9/users/@me",
                { username },
                {
                  headers: {
                    "Authorization": userToken.token,
                    "Content-Type": "application/json"
                  },
                  httpsAgent: proxyAgent
                }
              );
              sniped = true;
              await storage.addLog(`SUCCESS: Claimed ${username} on account: ${userToken.label || userToken.token.substring(0, 10)}.`, "success");
            } catch (e: any) {
              const errMsg = e.response?.data?.message || e.message;
              await storage.addLog(`CLAIM FAILED for ${username}: ${errMsg}`, "error");
            }
          } else {
            await storage.addLog(`TARGET ${username} IS FREE but no user tokens are available to claim it!`, "error");
          }

          await storage.addFoundUsername(username, sniped);

          // Output to ALL bot channels
          const botTokens = await storage.getBotTokens();
          for (const bt of botTokens) {
            const client = this.botClients.get(bt.token);
            if (client) {
              try {
                const channel = await client.channels.fetch(bt.channelId) as TextChannel;
                if (channel && channel.isTextBased()) {
                  const statusMsg = sniped ? `✅ **CLAIMED**: Successfully sniped \`${username}\`!` : `⚠️ **AVAILABLE**: \`${username}\` is free but claim failed!`;
                  await channel.send(statusMsg);
                }
              } catch (e) {}
            }
          }
        }
      } catch (error: any) {
        if (error.response?.status === 429) {
          await storage.incrementStats('rateLimitedCount');
          await storage.addLog(`Rate limited while checking ${username}.`, "error");
        } else {
          console.error(`Request failed for ${username}: ${error.message}`);
        }
      }
    }
  }

  async getProxyAgent(rotationalUrl?: string): Promise<HttpsProxyAgent<string> | undefined> {
    if (rotationalUrl) return new HttpsProxyAgent(rotationalUrl);
    
    const proxiesList = await storage.getProxies();
    const workingProxies = proxiesList.filter(p => p.isWorking);
    if (workingProxies.length > 0) {
      const proxy = workingProxies[Math.floor(Math.random() * workingProxies.length)];
      await storage.updateProxyLastUsed(proxy.id);
      return new HttpsProxyAgent(proxy.url);
    }
    return undefined;
  }
}

export const botService = new DiscordBot();
