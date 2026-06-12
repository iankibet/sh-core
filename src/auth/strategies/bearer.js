import shStorage from '../../utils/storage.js'
import { resolveTokenStorage } from '../tokenStorage.js'

const LEGACY_KEY = 'access_token'

export class BearerStrategy {
    constructor (storage = 'session') {
        this.storage = resolveTokenStorage(storage)
        this.token = undefined
    }

    getToken () {
        if (this.token !== undefined) {
            return this.token
        }
        let token = this.storage.get()
        if (!token) {
            // One-time migration from the v5 localStorage token
            const legacy = shStorage.getItem(LEGACY_KEY)
            if (legacy && legacy !== 'undefined' && legacy !== 'null') {
                token = legacy
                this.storage.set(token)
                shStorage.removeItem(LEGACY_KEY)
            }
        }
        this.token = token ?? null
        return this.token
    }

    setToken (token) {
        this.token = token ?? null
        if (token) {
            this.storage.set(token)
        } else {
            this.storage.clear()
        }
    }

    clear () {
        this.token = null
        this.storage.clear()
        shStorage.removeItem(LEGACY_KEY)
    }

    isAuthenticated () {
        return !!this.getToken()
    }

    async beforeRequest (config) {
        const token = this.getToken()
        if (token) {
            config.headers = config.headers ?? {}
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    }
}
