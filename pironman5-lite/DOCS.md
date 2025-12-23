# Pironman5 Lite

A clean, lightweight Home Assistant addon for monitoring Raspberry Pi 5 hardware with the SunFounder Pironman5 case.

## Features

- **Hardware Monitoring**: CPU/GPU temperature, memory, disk, network
- **Fan Control**: 5 modes (Always On, Performance, Cool, Balanced, Quiet)
- **RGB LEDs**: Full control with multiple animation styles
- **OLED Display**: Status display with configurable rotation
- **Configurable Polling**: 1-60 seconds to reduce log spam
- **Optional Web UI**: Can be disabled if only background monitoring is needed

## Configuration

All settings are available in the addon configuration tab:

| Setting | Default | Description |
|---------|---------|-------------|
| `polling_interval` | 5 | Seconds between hardware reads (1-60) |
| `web_ui_enabled` | true | Enable/disable web dashboard |
| `fan_mode` | balanced | Fan trigger mode |
| `rgb_enabled` | true | Enable RGB LEDs |
| `rgb_color` | #0a1aff | RGB color (hex) |
| `rgb_brightness` | 50 | Brightness 0-100% |
| `rgb_style` | breathing | Animation style |
| `temperature_unit` | C | Celsius or Fahrenheit |

### Fan Modes

- **Always On**: Fan runs continuously
- **Performance**: Triggers at 50C
- **Cool**: Triggers at 60C  
- **Balanced**: Triggers at 67.5C (default)
- **Quiet**: Triggers at 70C

### RGB Styles

- solid, breathing, flow, rainbow, hue_cycle

## Hardware Requirements

- Raspberry Pi 5
- SunFounder Pironman5 case with:
  - PWM fan on GPIO 6
  - WS2812 RGB LEDs on SPI (GPIO 10)
  - SSD1306 OLED on I2C

## Web UI

When enabled, access the dashboard at `http://your-ha-instance:34001`
