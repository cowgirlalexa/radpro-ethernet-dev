// SPDX-FileCopyrightText: 2026 André Fiedler
//
// SPDX-License-Identifier: GPL-3.0-or-later

;(function () {
    const hasBridgeInfo = () => document.getElementById('bridgeFirmware') !== null

    const setField = (id, val) => {
        const el = document.getElementById(id)
        if (!el) return
        if (val === null || val === undefined || val === '') {
            el.textContent = '—'
            return
        }
        el.textContent = val
    }

    const REFRESH_MS = 4000
    const RETRY_MS = 2000
    const FETCH_TIMEOUT_MS = 3000
    let refreshHandle = null
    let isFetching = false

    const scheduleRefresh = (delay) => {
        if (document.hidden || !hasBridgeInfo()) return
        if (refreshHandle) clearTimeout(refreshHandle)
        refreshHandle = setTimeout(refreshBridgeInfo, delay)
    }

    async function refreshBridgeInfo() {
        if (!hasBridgeInfo() || document.hidden || isFetching) return
        isFetching = true
        refreshHandle = null
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
        let nextDelay = REFRESH_MS
        try {
            const resp = await fetch('/bridge.json', { cache: 'no-store', signal: controller.signal })
            if (!resp.ok) throw new Error('bad status')
            const data = await resp.json()
            setField('chipRev', data.chipRevision)
            setField('sdkVersion', data.sdkVersion)
            setField('bridgeFirmware', data.bridgeFirmware)
            setField('heapFree', data.heapFree ? `${(data.heapFree / 1024).toFixed(1)} kB` : null)
            setField('heapMax', data.heapMax ? `${(data.heapMax / 1024).toFixed(1)} kB` : null)
            setField('networkType', data.networkType)
            setField('wifiMode', data.wifiMode)
            setField('ipAddress', data.ipAddress)
            setField('wifiRSSI', data.wifiRSSI)
            setField('macAddress', data.macAddress)
        } catch (err) {
            nextDelay = RETRY_MS
            console.warn('Bridge info refresh failed', err)
        } finally {
            clearTimeout(timeout)
            isFetching = false
            scheduleRefresh(nextDelay)
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (refreshHandle) clearTimeout(refreshHandle)
            refreshHandle = null
        } else if (hasBridgeInfo()) {
            refreshBridgeInfo()
        }
    })
    document.addEventListener('DOMContentLoaded', () => {
        if (!hasBridgeInfo()) return
        refreshBridgeInfo()
    })
})()
