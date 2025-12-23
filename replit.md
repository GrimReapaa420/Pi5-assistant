# Pironman5 Lite - Home Assistant Addon

A clean, standalone clone of the SunFounder Pironman5 Home Assistant addon with reduced bloatware, configurable polling, and optional WebUI.

## Overview

This project provides a lightweight alternative to the original Pironman5 addon for Home Assistant. It monitors Raspberry Pi 5 hardware (CPU/GPU temperature, fan control, RGB LEDs, OLED display) with significantly reduced log spam and full configuration via the HA addon config tab.

## Key Features

- **Configurable Polling**: Set polling interval from 1-60 seconds to reduce supervisor log spam
- **Optional WebUI**: Dashboard can be disabled entirely if only background monitoring is needed
- **Modular Architecture**: Clean codebase without scattered dependencies
- **Hardware Monitoring**: 
  - CPU/GPU temperature via `/sys/class/thermal/thermal_zone0/temp` and `vcgencmd`
  - Memory/Disk usage via system APIs
  - Network speed tracking
  - Fan control with 5 modes (Always On, Performance, Cool, Balanced, Quiet)
  - RGB LED control (WS2812 via SPI)
  - OLED display support

## Project Structure

```
├── client/                # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route pages (Dashboard, Config, Logs, About)
│       └── lib/           # Utilities and providers
├── server/                # Express backend
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Hardware reading & config storage
├── shared/
│   └── schema.ts          # TypeScript types & Zod schemas
└── design_guidelines.md   # Frontend design system
```

## API Endpoints

- `GET /api/status` - System status (temp, CPU, memory, disk, network, fan)
- `GET /api/config` - Current configuration
- `PATCH /api/config` - Update configuration
- `POST /api/config/reset` - Reset to defaults
- `GET /api/logs` - Addon logs
- `POST /api/fan/control` - Set fan mode
- `POST /api/rgb/control` - Set RGB settings
- `GET /api/health` - Health check

## Hardware IO Methods (Pironman5 Compatible)

The addon reads hardware values using the same methods as the original:

### Temperature
- CPU: `cat /sys/class/thermal/thermal_zone0/temp` (divide by 1000 for °C)
- GPU: `vcgencmd measure_temp`

### Fan Control
- GPIO pin for RGB fans (default: GPIO 6)
- Fan LED pin (default: GPIO 5)
- PWM fan controlled by system via `/sys/class/thermal/cooling_device0/cur_state`

### RGB LEDs (WS2812)
- Connected via SPI (GPIO 10)
- Styles: solid, breathing, flow, rainbow, hue_cycle

## Configuration Options

All settings available via HA addon config tab or WebUI:

| Setting | Default | Description |
|---------|---------|-------------|
| pollingInterval | 5 | Seconds between hardware reads |
| webUiEnabled | true | Enable/disable web dashboard |
| fanMode | balanced | Fan trigger temperature mode |
| rgbEnabled | true | Enable RGB LEDs |
| rgbColor | #0a1aff | RGB color (hex) |
| rgbBrightness | 50 | Brightness 0-100% |
| rgbStyle | breathing | Animation style |
| oledEnabled | true | Enable OLED display |
| temperatureUnit | C | Celsius or Fahrenheit |
| debugLevel | INFO | Log verbosity |

## Development

```bash
npm install
npm run dev
```

Frontend runs on port 5000 with the Express backend.

## Building for Home Assistant

The addon is designed to run in a Docker container on Home Assistant OS. Configuration is exposed through the addon config.yaml schema.
