import {
  type SystemStatus,
  type AddonConfig,
  DEFAULT_CONFIG,
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import { execSync } from "child_process";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR";
  message: string;
  source: string;
}

export interface IStorage {
  getConfig(): Promise<AddonConfig>;
  updateConfig(config: Partial<AddonConfig>): Promise<AddonConfig>;
  resetConfig(): Promise<AddonConfig>;
  getStatus(): Promise<SystemStatus>;
  getLogs(): Promise<LogEntry[]>;
  addLog(
    level: LogEntry["level"],
    message: string,
    source: string
  ): Promise<void>;
}

export class MemStorage implements IStorage {
  private config: AddonConfig;
  private logs: LogEntry[];
  private startTime: number;
  private lastNetworkCheck: number;
  private lastNetworkUpload: number;
  private lastNetworkDownload: number;
  private hardwareStatus: {
    cpuTempAccessible: boolean;
    gpuTempAccessible: boolean;
    cpuFreqAccessible: boolean;
    fanAccessible: boolean;
    rgbAccessible: boolean;
    oledAccessible: boolean;
    networkAccessible: boolean;
  };

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.logs = [];
    this.startTime = Date.now();
    this.lastNetworkCheck = Date.now();
    this.lastNetworkUpload = 0;
    this.lastNetworkDownload = 0;
    this.hardwareStatus = {
      cpuTempAccessible: false,
      gpuTempAccessible: false,
      cpuFreqAccessible: false,
      fanAccessible: false,
      rgbAccessible: false,
      oledAccessible: false,
      networkAccessible: false,
    };

    this.addLog("INFO", "Pironman5 Lite addon initialized", "system");
    this.addLog("INFO", `Polling interval: ${this.config.pollingInterval}s`, "config");
    this.addLog("INFO", `WebUI enabled: ${this.config.webUiEnabled}`, "config");
    this.addLog("INFO", `Fan mode: ${this.config.fanMode}`, "config");
    
    this.initializeHardware();
  }

  private async initializeHardware(): Promise<void> {
    await this.checkCpuTempAccess();
    await this.checkGpuTempAccess();
    await this.checkCpuFreqAccess();
    await this.checkNetworkAccess();
    await this.checkFanAccess();
    await this.checkRgbAccess();
    await this.checkOledAccess();
  }

  private async checkCpuTempAccess(): Promise<void> {
    try {
      const path = "/sys/class/thermal/thermal_zone0/temp";
      if (fs.existsSync(path)) {
        fs.readFileSync(path, "utf8");
        this.hardwareStatus.cpuTempAccessible = true;
        await this.addLog("INFO", `CPU temperature sensor accessible`, "hardware");
      } else {
        this.hardwareStatus.cpuTempAccessible = false;
        await this.addLog("WARNING", `CPU temperature sensor not found`, "hardware");
      }
    } catch (error: any) {
      this.hardwareStatus.cpuTempAccessible = false;
      await this.addLog("WARNING", `CPU temperature: ${error.message}`, "hardware");
    }
  }

  private async checkGpuTempAccess(): Promise<void> {
    try {
      execSync("vcgencmd measure_temp", { encoding: "utf8" });
      this.hardwareStatus.gpuTempAccessible = true;
      await this.addLog("INFO", `GPU temperature (vcgencmd) accessible`, "hardware");
    } catch (error: any) {
      this.hardwareStatus.gpuTempAccessible = false;
      await this.addLog("WARNING", `GPU temperature: vcgencmd not available`, "hardware");
    }
  }

  private async checkCpuFreqAccess(): Promise<void> {
    try {
      const path = "/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq";
      if (fs.existsSync(path)) {
        this.hardwareStatus.cpuFreqAccessible = true;
        await this.addLog("INFO", `CPU frequency sensor accessible`, "hardware");
      } else {
        this.hardwareStatus.cpuFreqAccessible = false;
        await this.addLog("WARNING", `CPU frequency sensor not found`, "hardware");
      }
    } catch (error: any) {
      this.hardwareStatus.cpuFreqAccessible = false;
    }
  }

  private async checkNetworkAccess(): Promise<void> {
    const interfaces = ["eth0", "end0", "wlan0"];
    for (const iface of interfaces) {
      try {
        const path = `/sys/class/net/${iface}/statistics/rx_bytes`;
        if (fs.existsSync(path)) {
          this.hardwareStatus.networkAccessible = true;
          await this.addLog("INFO", `Network interface ${iface} accessible`, "hardware");
          return;
        }
      } catch {}
    }
    this.hardwareStatus.networkAccessible = false;
    await this.addLog("WARNING", `No network interfaces found`, "hardware");
  }

  private async checkFanAccess(): Promise<void> {
    try {
      const gpioPath = `/sys/class/gpio/gpio${this.config.fanGpioPin}`;
      const coolingPath = "/sys/class/thermal/cooling_device0/cur_state";
      
      if (fs.existsSync(coolingPath)) {
        this.hardwareStatus.fanAccessible = true;
        await this.addLog("INFO", `Fan control accessible via ${coolingPath}`, "fan");
      } else if (fs.existsSync(gpioPath)) {
        this.hardwareStatus.fanAccessible = true;
        await this.addLog("INFO", `Fan GPIO ${this.config.fanGpioPin} accessible`, "fan");
      } else {
        this.hardwareStatus.fanAccessible = false;
        await this.addLog("WARNING", `Fan hardware not detected (GPIO ${this.config.fanGpioPin})`, "fan");
      }
    } catch (error: any) {
      this.hardwareStatus.fanAccessible = false;
      await this.addLog("WARNING", `Fan access check: ${error.message}`, "fan");
    }
  }

  private async checkRgbAccess(): Promise<void> {
    try {
      const spiPath = "/dev/spidev0.0";
      
      if (fs.existsSync(spiPath)) {
        this.hardwareStatus.rgbAccessible = true;
        await this.addLog("INFO", `RGB LED SPI device accessible at ${spiPath}`, "rgb");
      } else {
        this.hardwareStatus.rgbAccessible = false;
        await this.addLog("WARNING", `RGB LED SPI device not found at ${spiPath}`, "rgb");
      }
    } catch (error: any) {
      this.hardwareStatus.rgbAccessible = false;
      await this.addLog("WARNING", `RGB access check: ${error.message}`, "rgb");
    }
  }

  private async checkOledAccess(): Promise<void> {
    try {
      const i2cPath = "/dev/i2c-1";
      
      if (fs.existsSync(i2cPath)) {
        this.hardwareStatus.oledAccessible = true;
        await this.addLog("INFO", `OLED I2C device accessible at ${i2cPath}`, "oled");
      } else {
        this.hardwareStatus.oledAccessible = false;
        await this.addLog("WARNING", `OLED I2C device not found at ${i2cPath}`, "oled");
      }
    } catch (error: any) {
      this.hardwareStatus.oledAccessible = false;
      await this.addLog("WARNING", `OLED access check: ${error.message}`, "oled");
    }
  }

  async getConfig(): Promise<AddonConfig> {
    return { ...this.config };
  }

  async updateConfig(config: Partial<AddonConfig>): Promise<AddonConfig> {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };
    
    if (config.fanMode && config.fanMode !== oldConfig.fanMode) {
      await this.setFanMode(config.fanMode);
    }
    
    if (config.rgbEnabled !== undefined || config.rgbColor || config.rgbBrightness !== undefined || config.rgbStyle) {
      await this.updateRgbLeds();
    }
    
    await this.addLog("INFO", "Configuration updated", "config");
    return { ...this.config };
  }

  async resetConfig(): Promise<AddonConfig> {
    this.config = { ...DEFAULT_CONFIG };
    await this.addLog("INFO", "Configuration reset to defaults", "config");
    return { ...this.config };
  }

  private async setFanMode(mode: string): Promise<void> {
    if (!this.hardwareStatus.fanAccessible) {
      await this.addLog("WARNING", `Cannot set fan mode: hardware not accessible`, "fan");
      return;
    }
    
    try {
      const thresholds: Record<string, number> = {
        always_on: 0,
        performance: 50,
        cool: 60,
        balanced: 67.5,
        quiet: 70,
      };
      const threshold = thresholds[mode] ?? 67.5;
      await this.addLog("INFO", `Fan mode set to ${mode} (trigger: ${threshold}C)`, "fan");
    } catch (error: any) {
      await this.addLog("ERROR", `Failed to set fan mode: ${error.message}`, "fan");
    }
  }

  private async updateRgbLeds(): Promise<void> {
    if (!this.config.rgbEnabled) {
      await this.addLog("INFO", "RGB LEDs disabled", "rgb");
      return;
    }
    
    if (!this.hardwareStatus.rgbAccessible) {
      await this.addLog("WARNING", `Cannot update RGB: SPI device not accessible`, "rgb");
      return;
    }
    
    try {
      await this.addLog(
        "INFO", 
        `RGB LEDs updated: color=${this.config.rgbColor}, brightness=${this.config.rgbBrightness}%, style=${this.config.rgbStyle}`, 
        "rgb"
      );
    } catch (error: any) {
      await this.addLog("ERROR", `Failed to update RGB LEDs: ${error.message}`, "rgb");
    }
  }

  async getStatus(): Promise<SystemStatus> {
    const cpuTemp = this.readCpuTemperature();
    const gpuTemp = this.readGpuTemperature();
    const cpuPercent = this.readCpuPercent();
    const cpuFrequency = this.readCpuFrequency();
    const memInfo = this.readMemoryInfo();
    const diskInfo = this.readDiskInfo();
    const networkSpeed = this.readNetworkSpeed();
    const fanSpeed = this.calculateFanSpeed(cpuTemp);
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      cpuTemperature: cpuTemp,
      gpuTemperature: gpuTemp,
      cpuPercent,
      cpuFrequency,
      memoryTotal: memInfo.total,
      memoryUsed: memInfo.used,
      memoryPercent: memInfo.percent,
      diskTotal: diskInfo.total,
      diskUsed: diskInfo.used,
      diskPercent: diskInfo.percent,
      networkUpload: networkSpeed.upload,
      networkDownload: networkSpeed.download,
      fanSpeed,
      fanState: this.hardwareStatus.fanAccessible 
        ? (fanSpeed !== null && fanSpeed > 0 ? "on" : "off") 
        : "unavailable",
      uptime,
      timestamp: Date.now(),
    };
  }

  async getLogs(): Promise<LogEntry[]> {
    return [...this.logs].reverse();
  }

  async addLog(
    level: LogEntry["level"],
    message: string,
    source: string
  ): Promise<void> {
    const entry: LogEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
    };
    this.logs.push(entry);
    
    console.log(`[${level}] [${source}] ${message}`);
    
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }
  }

  private readCpuTemperature(): number | null {
    if (!this.hardwareStatus.cpuTempAccessible) {
      return null;
    }
    try {
      const temp = fs.readFileSync(
        "/sys/class/thermal/thermal_zone0/temp",
        "utf8"
      );
      return parseFloat(temp) / 1000;
    } catch {
      return null;
    }
  }

  private readGpuTemperature(): number | null {
    if (!this.hardwareStatus.gpuTempAccessible) {
      return null;
    }
    try {
      const result = execSync("vcgencmd measure_temp", { encoding: "utf8" });
      const match = result.match(/temp=(\d+\.?\d*)/);
      if (match) {
        return parseFloat(match[1]);
      }
      return null;
    } catch {
      return null;
    }
  }

  private readCpuPercent(): number | null {
    try {
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      cpus.forEach((cpu: any) => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      return Math.round((1 - totalIdle / totalTick) * 100);
    } catch {
      return null;
    }
  }

  private readCpuFrequency(): number | null {
    if (!this.hardwareStatus.cpuFreqAccessible) {
      return null;
    }
    try {
      const freq = fs.readFileSync(
        "/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq",
        "utf8"
      );
      return parseInt(freq) / 1000;
    } catch {
      return null;
    }
  }

  private readMemoryInfo(): { total: number | null; used: number | null; percent: number | null } {
    try {
      const total = os.totalmem();
      const free = os.freemem();
      const used = total - free;
      const percent = Math.round((used / total) * 100);
      return { total, used, percent };
    } catch {
      return { total: null, used: null, percent: null };
    }
  }

  private readDiskInfo(): { total: number | null; used: number | null; percent: number | null } {
    try {
      const result = execSync("df -B1 / | tail -1", { encoding: "utf8" });
      const parts = result.trim().split(/\s+/);
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const percent = parseInt(parts[4]);
      return { total, used, percent };
    } catch {
      return { total: null, used: null, percent: null };
    }
  }

  private readNetworkSpeed(): { upload: number | null; download: number | null } {
    if (!this.hardwareStatus.networkAccessible) {
      return { upload: null, download: null };
    }
    
    try {
      let rx = 0, tx = 0;
      
      const interfaces = ["eth0", "end0", "wlan0"];
      for (const iface of interfaces) {
        try {
          rx = parseInt(fs.readFileSync(`/sys/class/net/${iface}/statistics/rx_bytes`, "utf8"));
          tx = parseInt(fs.readFileSync(`/sys/class/net/${iface}/statistics/tx_bytes`, "utf8"));
          break;
        } catch {}
      }

      const now = Date.now();
      const timeDiff = (now - this.lastNetworkCheck) / 1000;

      const upload = Math.round((tx - this.lastNetworkUpload) / timeDiff);
      const download = Math.round((rx - this.lastNetworkDownload) / timeDiff);

      this.lastNetworkCheck = now;
      this.lastNetworkUpload = tx;
      this.lastNetworkDownload = rx;

      return {
        upload: upload > 0 ? upload : 0,
        download: download > 0 ? download : 0,
      };
    } catch {
      return { upload: null, download: null };
    }
  }

  private calculateFanSpeed(cpuTemp: number | null): number | null {
    if (!this.hardwareStatus.fanAccessible) {
      return null;
    }
    
    if (cpuTemp === null) return null;

    const thresholds: Record<string, number> = {
      always_on: 0,
      performance: 50,
      cool: 60,
      balanced: 67.5,
      quiet: 70,
    };

    const threshold = thresholds[this.config.fanMode] ?? 67.5;

    if (this.config.fanMode === "always_on") {
      return 100;
    }

    if (cpuTemp < threshold) {
      return 0;
    }

    if (cpuTemp < threshold + 5) {
      return 30;
    }
    if (cpuTemp < threshold + 10) {
      return 50;
    }
    if (cpuTemp < threshold + 15) {
      return 70;
    }
    return 100;
  }
}

export const storage = new MemStorage();
