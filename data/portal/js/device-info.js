// SPDX-FileCopyrightText: 2026 André Fiedler
//
// SPDX-License-Identifier: GPL-3.0-or-later

;(function () {
    const hasDeviceInfo = () => document.getElementById('deviceId') !== null
    const setField = (id, val, unit = '') => {
        const el = document.getElementById(id)
        if (!el) return
        if (val === null || val === undefined || val === '') {
            el.textContent = '—'
            return
        }
        el.textContent = unit ? `${val} ${unit}`.trim() : val
    }

    const REFRESH_MS = 10000
    const RETRY_MS = 2000
    const FETCH_TIMEOUT_MS = 3000
    let lastMeasurementSeconds = null
    let refreshHandle = null
    let isFetching = false

    const updateMeasurementAgeDisplay = () => {
        if (!hasDeviceInfo()) return
        if (lastMeasurementSeconds === null) {
            setField('measurementAge', '—')
            return
        }
        const translated =
            typeof portalTranslate === 'function' ? portalTranslate('T_MEASUREMENT_AGE', { seconds: lastMeasurementSeconds }) : null
        if (!translated || translated === 'T_MEASUREMENT_AGE') {
            setField('measurementAge', '—')
        } else {
            setField('measurementAge', translated)
        }
    }

    const scheduleRefresh = (delay) => {
        if (document.hidden || !hasDeviceInfo()) return
        if (refreshHandle) clearTimeout(refreshHandle)
        refreshHandle = setTimeout(refreshDeviceInfo, delay)
    }

    async function refreshDeviceInfo() {
        if (!hasDeviceInfo() || document.hidden || isFetching) return
        isFetching = true
        refreshHandle = null
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
        let nextDelay = REFRESH_MS
        try {
            const resp = await fetch('/device.json', { cache: 'no-store', signal: controller.signal })
            if (!resp.ok) throw new Error('bad status')
            const data = await resp.json()
            setField('manufacturer', data.manufacturer)
            setField('model', data.model)
            setField('firmware', data.firmware)
            setField('deviceId', data.deviceId)
            setField('locale', data.locale)
            const powerLabel =
                data.devicePower === '1'
                    ? portalTranslate('T_POWER_ON')
                    : data.devicePower === '0'
                    ? portalTranslate('T_POWER_OFF')
                    : data.devicePower
            setField('devicePower', powerLabel)
            setField('batteryVoltage', data.batteryVoltage)
            setField('batteryPercent', data.batteryPercent ? `${data.batteryPercent} %` : data.batteryPercent)
            setField('tubeRate', data.tubeRate)
            setField('tubeDoseRate', data.tubeDoseRate)
            setField('tubePulseCount', data.tubePulseCount)
            if (data.measurementAgeMs !== null && data.measurementAgeMs !== undefined) {
                lastMeasurementSeconds = (data.measurementAgeMs / 1000).toFixed(1)
            } else {
                lastMeasurementSeconds = null
            }
            updateMeasurementAgeDisplay()
        } catch (err) {
            nextDelay = RETRY_MS
            console.warn('Device info refresh failed', err)
        } finally {
            clearTimeout(timeout)
            isFetching = false
            scheduleRefresh(nextDelay)
        }
    }

    document.addEventListener('portal-locale-ready', updateMeasurementAgeDisplay)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (refreshHandle) clearTimeout(refreshHandle)
            refreshHandle = null
        } else if (hasDeviceInfo()) {
            refreshDeviceInfo()
        }
    })
    document.addEventListener('DOMContentLoaded', () => {
        if (!hasDeviceInfo()) return
        refreshDeviceInfo()
    })
})()
