import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { configSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/status", async (req, res) => {
    try {
      const status = await storage.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting status:", error);
      res.status(500).json({ error: "Failed to get system status" });
    }
  });

  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfig();
      res.json(config);
    } catch (error) {
      console.error("Error getting config:", error);
      res.status(500).json({ error: "Failed to get configuration" });
    }
  });

  app.patch("/api/config", async (req, res) => {
    try {
      const partialConfig = req.body;
      
      const currentConfig = await storage.getConfig();
      const mergedConfig = { ...currentConfig, ...partialConfig };
      const validated = configSchema.parse(mergedConfig);
      
      const updatedConfig = await storage.updateConfig(validated);
      res.json(updatedConfig);
    } catch (error) {
      console.error("Error updating config:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid configuration", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ error: "Failed to update configuration" });
      }
    }
  });

  app.post("/api/config/reset", async (req, res) => {
    try {
      const config = await storage.resetConfig();
      res.json(config);
    } catch (error) {
      console.error("Error resetting config:", error);
      res.status(500).json({ error: "Failed to reset configuration" });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const logs = await storage.getLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error getting logs:", error);
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const { level, message, source } = req.body;
      if (!level || !message || !source) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      await storage.addLog(level, message, source);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding log:", error);
      res.status(500).json({ error: "Failed to add log" });
    }
  });

  app.post("/api/fan/control", async (req, res) => {
    try {
      const { mode } = req.body;
      if (!mode) {
        return res.status(400).json({ error: "Missing fan mode" });
      }
      
      const validModes = ["always_on", "performance", "cool", "balanced", "quiet"];
      if (!validModes.includes(mode)) {
        return res.status(400).json({ error: "Invalid fan mode" });
      }
      
      await storage.updateConfig({ fanMode: mode });
      await storage.addLog("INFO", `Fan mode changed to ${mode}`, "fan");
      
      res.json({ success: true, mode });
    } catch (error) {
      console.error("Error controlling fan:", error);
      res.status(500).json({ error: "Failed to control fan" });
    }
  });

  app.post("/api/rgb/control", async (req, res) => {
    try {
      const { enabled, color, brightness, style, speed } = req.body;
      
      const updates: Record<string, any> = {};
      if (enabled !== undefined) updates.rgbEnabled = enabled;
      if (color !== undefined) updates.rgbColor = color;
      if (brightness !== undefined) updates.rgbBrightness = brightness;
      if (style !== undefined) updates.rgbStyle = style;
      if (speed !== undefined) updates.rgbSpeed = speed;
      
      await storage.updateConfig(updates);
      await storage.addLog("INFO", "RGB settings updated", "rgb");
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error controlling RGB:", error);
      res.status(500).json({ error: "Failed to control RGB" });
    }
  });

  app.get("/api/health", async (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: Date.now(),
      version: "1.0.0"
    });
  });

  return httpServer;
}
