# Waveshare ESP32-S3-ETH patch notes

This tree is the Ethernet-first version of RadPro WiFi Bridge for the Waveshare ESP32-S3-ETH (onboard W5500).

## Intended startup behavior

1. Initialize the W5500 before initializing WiFiManager.
2. If Ethernet obtains a DHCP address, use Ethernet as the default network interface and start the normal web UI on port 80.
3. On that wired boot path, Wi-Fi is never initialized: no STA attempt, AP, scan, or credential wait.
4. If there is no usable Ethernet connection, initialize the existing Wi-Fi fallback and use saved credentials or the setup AP.
5. If Ethernet becomes usable later, it takes over, the Wi-Fi portal is stopped, and the Wi-Fi radio is turned off.
6. If Ethernet subsequently loses its IP address, Wi-Fi fallback is allowed to start again.

## Important build changes

- Pinned pioarduino `51.03.07` (Arduino-ESP32 3.0.7 / ESP-IDF 5.1.4).
- Enabled the ESP-IDF W5500 component in `sdkconfig.defaults`:
  - `CONFIG_ETH_ENABLED=y`
  - `CONFIG_ETH_USE_SPI_ETHERNET=y`
  - `CONFIG_ETH_SPI_ETHERNET_W5500=y`
- Removed the old generated `sdkconfig.esp32-s3-devkitc-1` and `dependencies.lock` from this package so PlatformIO regenerates them for the pinned core on the first clean build.

## Waveshare W5500 pins

- SCLK: GPIO13
- MISO: GPIO12
- MOSI: GPIO11
- CS: GPIO14
- RESET: GPIO9
- INT: GPIO10

## Build/upload for a non-programmer

1. Extract this ZIP to a new folder.
2. Open that folder in VS Code with the PlatformIO extension installed.
3. In PlatformIO, choose **Project Tasks > esp32-s3-devkitc-1 > General > Clean** once.
4. Then choose **Build**.
5. Connect the Waveshare board and choose **Upload**.
6. The project's existing upload hook also writes the LittleFS web-interface files.
7. Open the serial monitor at **115200 baud**.

On a successful Ethernet boot, expect messages similar to:

```text
Initializing Waveshare ESP32-S3-ETH W5500 Ethernet.
W5500 Ethernet initialized; waiting for link/DHCP.
Ethernet has IP ...; disabling Wi-Fi and starting Ethernet web portal.
Ethernet web server listening on port 80.
```

You should **not** see `Initializing Wi-Fi fallback.` on that path.

If no Ethernet link/IP is available, you should instead see `Initializing Wi-Fi fallback.` and the original Wi-Fi behavior should continue.

## What was made network-independent

The connectivity checks for MQTT, OpenSenseMap, OpenRadiation, Safecast, GMCMap, Radmon, OTA, diagnostics, and the main startup logic now accept either Ethernet or Wi-Fi. `WiFiClient` on Arduino-ESP32 3.x is an alias for the generic `NetworkClient`, so existing TCP clients can use the active default interface. The Ethernet web server reuses the same application routes, templates, CSRF checks, backup/restore handlers, logs, publisher configuration pages, and OTA handlers.

## Local verification performed for this patch

The development environment used to prepare this ZIP did not contain the PlatformIO/ESP32 compiler toolchain, so a real firmware compile could not be executed here. Static checks were run to verify the Ethernet-first ordering, W5500 SDK configuration, generic network gates for every publisher, Ethernet web-server route handling, and syntax of the project's Python/JavaScript helper files.
