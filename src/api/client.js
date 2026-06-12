import Axios from 'axios'
import { getShConfig } from '../config.js'
import shStorage from '../utils/storage.js'
import { BearerStrategy } from '../auth/strategies/bearer.js'
import { CookieStrategy } from '../auth/strategies/cookie.js'
import { touchSession } from '../auth/session.js'

let client = null
let strategy = null

const settings = {
    freeEndpoints: ['auth/login', 'auth/register/client'],
    onUnauthorized: null
}

function viteEnv (key) {
    try {
        return import.meta.env?.[key]
    } catch (err) {
        return undefined
    }
}

function isFreeEndpoint (url) {
    if (!url) {
        return false
    }
    const path = String(url).split('?')[0]
    return settings.freeEndpoints.some(endpoint => path.includes(endpoint))
}

function defaultUnauthorized () {
    strategy?.clear()
    shStorage.removeItem('user')
    shStorage.removeItem('last_activity')
    const loginUrl = getShConfig('loginUrl', '/sh-auth')
    if (!window.location.pathname.startsWith(loginUrl)) {
        window.location.href = loginUrl
    }
}

export function createApiClient (options = {}) {
    const {
        baseURL,
        authMode = 'bearer',
        tokenStorage,
        freeEndpoints,
        onUnauthorized,
        csrfEndpoint
    } = options

    if (freeEndpoints) {
        settings.freeEndpoints = [...new Set([...settings.freeEndpoints, ...freeEndpoints])]
    }
    settings.onUnauthorized = onUnauthorized ?? settings.onUnauthorized

    // Fallback chain: explicit option -> window global (set by app entry,
    // works in any bundler) -> import.meta.env (works when sh-core source is
    // served by the app's own Vite; inlined away in the published dist)
    client = Axios.create({
        baseURL: baseURL ?? window.VITE_APP_API_URL ?? viteEnv('VITE_APP_API_URL'),
        withCredentials: authMode === 'cookie',
        withXSRFToken: authMode === 'cookie'
    })

    strategy = authMode === 'cookie'
        ? new CookieStrategy(client, { csrfEndpoint })
        : new BearerStrategy(tokenStorage)

    client.interceptors.request.use(async (config) => {
        touchSession()
        if (!isFreeEndpoint(config.url)) {
            await strategy.beforeRequest(config)
        }
        return config
    })

    client.interceptors.response.use(
        response => response,
        (error) => {
            if (error.response?.status === 401 && !isFreeEndpoint(error.config?.url)) {
                (settings.onUnauthorized ?? defaultUnauthorized)(error)
            }
            return Promise.reject(error)
        }
    )

    // Legacy side-channel: app-level interceptors (e.g. nprogress) attach here
    window.shAxionInstance = client
    return client
}

export function getApiClient () {
    return client ?? createApiClient()
}

export function getAuthStrategy () {
    if (!strategy) {
        createApiClient()
    }
    return strategy
}

// Legacy signature kept for ShFrontend and direct callers
export function initApi (baseApiUrl) {
    return createApiClient({ baseURL: baseApiUrl })
}
