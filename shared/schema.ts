import { pgTable, text, varchar, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// System Status - read from hardware
export interface SystemStatus {
  cpuTemperature: number | null;
  gpuTemperature: number | null;
  cpuPercent: number;
  cpuFrequency: number;
  memoryTotal: number;
  memoryUsed: number;
  memoryPercent: number;
  diskTotal: number;
  diskUsed: number;
  diskPercent: number;
  networkUpload: number;
  networkDownload: number;
  fanSpeed: number;
  fanState: 'on' | 'off' | 'auto';
  uptime: number;
  timestamp: number;
}

// Fan modes matching Pironman5
export type FanMode = 'always_on' | 'performance' | 'cool' | 'balanced' | 'quiet';

export const FAN_MODE_THRESHOLDS: Record<FanMode, number> = {
  always_on: 0,
  performance: 50,
  cool: 60,
  balanced: 67.5,
  quiet: 70,
};

// RGB styles matching Pironman5
export type RGBStyle = 'solid' | 'breathing' | 'flow' | 'rainbow' | 'hue_cycle';

// Configuration schema
export interface AddonConfig {
  // Polling settings
  pollingInterval: number; // seconds
  
  // WebUI settings
  webUiEnabled: boolean;
  webUiPort: number;
  
  // Fan settings
  fanMode: FanMode;
  fanGpioPin: number;
  fanLedPin: number;
  fanLedMode: 'on' | 'off' | 'follow';
  
  // RGB settings
  rgbEnabled: boolean;
  rgbColor: string;
  rgbBrightness: number;
  rgbStyle: RGBStyle;
  rgbSpeed: number;
  rgbLedCount: number;
  
  // OLED settings
  oledEnabled: boolean;
  oledRotation: 0 | 180;
  oledSleepEnabled: boolean;
  oledSleepTimeout: number;
  
  // Temperature settings
  temperatureUnit: 'C' | 'F';
  
  // Debug settings
  debugLevel: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
}

// Default configuration
export const DEFAULT_CONFIG: AddonConfig = {
  pollingInterval: 5,
  webUiEnabled: true,
  webUiPort: 34001,
  fanMode: 'balanced',
  fanGpioPin: 6,
  fanLedPin: 5,
  fanLedMode: 'follow',
  rgbEnabled: true,
  rgbColor: '#0a1aff',
  rgbBrightness: 50,
  rgbStyle: 'breathing',
  rgbSpeed: 50,
  rgbLedCount: 4,
  oledEnabled: true,
  oledRotation: 0,
  oledSleepEnabled: false,
  oledSleepTimeout: 10,
  temperatureUnit: 'C',
  debugLevel: 'INFO',
};

// Zod schemas for validation
export const configSchema = z.object({
  pollingInterval: z.number().min(1).max(60),
  webUiEnabled: z.boolean(),
  webUiPort: z.number().min(1024).max(65535),
  fanMode: z.enum(['always_on', 'performance', 'cool', 'balanced', 'quiet']),
  fanGpioPin: z.number().min(0).max(27),
  fanLedPin: z.number().min(0).max(27),
  fanLedMode: z.enum(['on', 'off', 'follow']),
  rgbEnabled: z.boolean(),
  rgbColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  rgbBrightness: z.number().min(0).max(100),
  rgbStyle: z.enum(['solid', 'breathing', 'flow', 'rainbow', 'hue_cycle']),
  rgbSpeed: z.number().min(0).max(100),
  rgbLedCount: z.number().min(1).max(100),
  oledEnabled: z.boolean(),
  oledRotation: z.union([z.literal(0), z.literal(180)]),
  oledSleepEnabled: z.boolean(),
  oledSleepTimeout: z.number().min(1).max(300),
  temperatureUnit: z.enum(['C', 'F']),
  debugLevel: z.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR']),
});

export type InsertConfig = z.infer<typeof configSchema>;

// Status history for charts
export interface StatusHistoryPoint {
  timestamp: number;
  cpuTemperature: number | null;
  gpuTemperature: number | null;
  cpuPercent: number;
  memoryPercent: number;
  fanSpeed: number;
}

// Users table (for potential future auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
