#!/usr/bin/with-contenv bashio

CONFIG_PATH=/data/options.json

export POLLING_INTERVAL=$(bashio::config 'polling_interval')
export WEB_UI_ENABLED=$(bashio::config 'web_ui_enabled')
export WEB_UI_PORT=$(bashio::config 'web_ui_port')
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

bashio::log.info "Starting Pironman5 Lite..."
bashio::log.info "Polling interval: ${POLLING_INTERVAL}s"
bashio::log.info "Web UI enabled: ${WEB_UI_ENABLED}"
bashio::log.info "Fan mode: ${FAN_MODE}"

cd /app
exec node dist/server/index.js
