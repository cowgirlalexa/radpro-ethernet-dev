/*
 * SPDX-FileCopyrightText: 2026 André Fiedler
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

#pragma once

#include <WiFi.h>

#if defined(RADPRO_WAVESHARE_ESP32_S3_ETH)
#include <ETH.h>
#define RADPRO_HAS_ETHERNET 1
#else
#define RADPRO_HAS_ETHERNET 0
#endif

namespace NetworkStatus
{
inline bool ethernetStarted()
{
#if RADPRO_HAS_ETHERNET
    return ETH.started();
#else
    return false;
#endif
}

inline bool ethernetLinkUp()
{
#if RADPRO_HAS_ETHERNET
    return ETH.started() && ETH.linkUp();
#else
    return false;
#endif
}

inline bool ethernetConnected()
{
#if RADPRO_HAS_ETHERNET
    return ETH.started() && ETH.hasIP();
#else
    return false;
#endif
}

inline bool wifiConnected()
{
    return WiFi.status() == WL_CONNECTED;
}

inline bool connected()
{
    return ethernetConnected() || wifiConnected();
}

inline bool usingEthernet()
{
    return ethernetConnected();
}

inline IPAddress localIP()
{
#if RADPRO_HAS_ETHERNET
    if (ethernetConnected())
        return ETH.localIP();
#endif
    return WiFi.localIP();
}
} // namespace NetworkStatus
