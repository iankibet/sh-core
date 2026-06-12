import shStorage from '../../utils/storage.js'

function readCookie (name) {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[2]) : null
}

// Laravel Sanctum SPA mode: the session lives in an httpOnly cookie the server
// sets - no token ever touches JS. We only make sure the CSRF cookie exists
// before mutating requests; axios reflects XSRF-TOKEN into the X-XSRF-TOKEN
// header automatically when withCredentials/withXSRFToken are enabled.
export class CookieStrategy {
    constructor (client, { csrfEndpoint = 'sanctum/csrf-cookie' } = {}) {
        this.client = client
        this.csrfEndpoint = csrfEndpoint
    }

    async ensureCsrf () {
        if (!readCookie('XSRF-TOKEN')) {
            await this.client.get(this.csrfEndpoint)
        }
    }

    async beforeRequest (config) {
        const method = (config.method ?? 'get').toLowerCase()
        const isCsrfCall = (config.url ?? '').includes(this.csrfEndpoint)
        if (!['get', 'head', 'options'].includes(method) && !isCsrfCall) {
            await this.ensureCsrf()
        }
        return config
    }

    getToken () {
        return null
    }

    setToken () {
        // session cookie is httpOnly and server-managed
    }

    clear () {
        // server invalidates the session on logout; nothing stored in JS
    }

    isAuthenticated () {
        // No token to inspect; presence of a hydrated user is the best signal
        return !!shStorage.getItem('user')
    }
}
