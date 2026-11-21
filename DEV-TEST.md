# Active Development Test

This repository is the scratch/test build of **RadPro Ethernet Bridge**.

## Current test

**Baseline:** v0.6.02  
**Test:** GC-800 initial `deviceId` probe compatibility

This build restores the v0.6.01 identity-probe sequence for `GET deviceId`:

- CRLF-terminated request
- LF-terminated request
- CR-terminated request

Everything else remains the current v0.6.02 code.

## Purpose

Test whether the unreliable GC-800 recognition after an ESP32 reboot is caused by the upstream change from the three initial identity-probe terminators to a single CRLF request.

For test builds, always use this repository's **main** branch.

Stable/release development remains in:
`cowgirlalexa/radpro-ethernet-bridge`.
