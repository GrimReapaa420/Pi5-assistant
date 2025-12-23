#!/usr/bin/with-contenv bashio

bashio::log.info "=========================================="
bashio::log.info "Starting Pironman5 Lite v1.0.0"
bashio::log.info "=========================================="

export POLLING_INTERVAL=$(bashio::config 'polling_interval')
export WEB_UI_ENABLED=$(bashio::config 'web_ui_enabled')
export FAN_MODE=$(bashio::config 'fan_mode')
export FAN_GPIO_PIN=$(bashio::config 'fan_gpio_pin')
export FAN_LED_PIN=$(bashio::config 'fan_led_pin')
export FAN_LED_MODE=$(bashio::config 'fan_led_mode')
export RGB_ENABLED=$(bashio::config 'rgb_enabled')
export RGB_COLOR=$(bashio::config 'rgb_color')
export RGB_BRIGHTNESS=$(bashio::config 'rgb_brightness')
export RGB_STYLE=$(bashio::config 'rgb_style')
export RGB_SPEED=$(bashio::config 'rgb_speed')
export RGB_LED_COUNT=$(bashio::config 'rgb_led_count')
export OLED_ENABLED=$(bashio::config 'oled_enabled')
export OLED_ROTATION=$(bashio::config 'oled_rotation')
export OLED_SLEEP_ENABLED=$(bashio::config 'oled_sleep_enabled')
export OLED_SLEEP_TIMEOUT=$(bashio::config 'oled_sleep_timeout')
export TEMPERATURE_UNIT=$(bashio::config 'temperature_unit')
export DEBUG_LEVEL=$(bashio::config 'debug_level')
export NODE_ENV=production
export PORT=5000

bashio::log.info "Configuration:"
bashio::log.info "  Polling interval: ${POLLING_INTERVAL}s"
bashio::log.info "  Web UI enabled: ${WEB_UI_ENABLED}"
bashio::log.info "  Fan mode: ${FAN_MODE} (GPIO ${FAN_GPIO_PIN})"
bashio::log.info "  RGB enabled: ${RGB_ENABLED}"
bashio::log.info "  OLED enabled: ${OLED_ENABLED}"

bashio::log.info "Checking hardware access..."

if [ -e /dev/spidev0.0 ]; then
    bashio::log.info "  SPI device: FOUND (/dev/spidev0.0)"
else
    bashio::log.warning "  SPI device: NOT FOUND - RGB LEDs may not work"
fi

if [ -e /dev/i2c-1 ]; then
    bashio::log.info "  I2C device: FOUND (/dev/i2c-1)"
else
    bashio::log.warning "  I2C device: NOT FOUND - OLED display may not work"
fi

if [ -e /dev/gpiomem ]; then
    bashio::log.info "  GPIO memory: FOUND (/dev/gpiomem)"
else
    bashio::log.warning "  GPIO memory: NOT FOUND - Fan control may not work"
fi

if [ -e /sys/class/thermal/thermal_zone0/temp ]; then
    CPU_TEMP=$(cat /sys/class/thermal/thermal_zone0/temp)
    CPU_TEMP_C=$((CPU_TEMP / 1000))
    bashio::log.info "  CPU temperature: ${CPU_TEMP_C}C"
else
    bashio::log.warning "  CPU temperature: sensor not accessible"
fi

bashio::log.info "=========================================="
bashio::log.info "Starting web server on port ${PORT}..."
bashio::log.info "=========================================="

cd /app
exec node dist/index.js
