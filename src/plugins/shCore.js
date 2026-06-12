import { createApiClient } from '../api/client.js'
import { setShConfig } from '../config.js'
import shStorage from '../utils/storage.js'
import { startSession } from '../auth/session.js'
import ifUserCan from '../directives/ifUserCan.js'

// Core plugin: API client, auth strategy, config, session and the
// v-if-user-can directive. Deliberately registers NO components and NO
// routes - UI packages (shframework, sh-tailwind) layer those on top.
export const ShCore = {
    install (app, options = {}) {
        const config = {
            authMode: 'bearer',
            tokenStorage: 'session',
            loginUrl: '/sh-auth',
            loginEndpoint: 'auth/login',
            registerEndpoint: 'auth/register',
            logoutApiEndpoint: 'auth/logout',
            userEndpoint: 'auth/user',
            forgotEndpoint: 'auth/forgot-password',
            swalPosition: 'top-end',
            streamlineUrl: '/api/streamline',
            enableCache: true,
            ...options
        }

        setShConfig(config)

        createApiClient({
            baseURL: config.baseApiUrl,
            authMode: config.authMode,
            tokenStorage: config.tokenStorage,
            freeEndpoints: config.freeEndpoints,
            onUnauthorized: config.onUnauthorized,
            csrfEndpoint: config.csrfEndpoint
        })

        app.directive('if-user-can', ifUserCan)

        const provideKeys = [
            'loginEndpoint',
            'registerEndpoint',
            'logoutApiEndpoint',
            'userEndpoint',
            'forgotEndpoint',
            'loginUrl',
            'sessionTimeout',
            'streamlineUrl',
            'enableCache'
        ]
        provideKeys.forEach(key => {
            if (typeof config[key] !== 'undefined') {
                app.provide(key, config[key])
            }
        })

        // Window globals kept for vue-streamline v1 consumers and swal position
        window.swalPosition = config.swalPosition
        window.streamlineUrl = config.streamlineUrl
        window.enableCache = config.enableCache

        if (config.sessionTimeout) {
            shStorage.setItem('sessionTimeout', config.sessionTimeout)
            startSession()
        }
    }
}

export const createShCore = (options = {}) => ({
    install: (app) => ShCore.install(app, options)
})

export default ShCore
