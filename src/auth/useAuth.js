import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user.js'
import { getApiClient, getAuthStrategy } from '../api/client.js'
import { getShConfig } from '../config.js'
import { startSession } from './session.js'
import { CookieStrategy } from './strategies/cookie.js'

export function useAuth () {
    const userStore = useUserStore()
    const { user } = storeToRefs(userStore)

    const login = async (credentials, { endpoint } = {}) => {
        const url = endpoint ?? getShConfig('loginEndpoint', 'auth/login')
        const strategy = getAuthStrategy()
        if (strategy instanceof CookieStrategy) {
            await strategy.ensureCsrf()
        }
        const res = await getApiClient().post(url, credentials)
        const token = res.data?.token ?? res.data?.access_token
        if (token) {
            strategy.setToken(token)
        }
        startSession()
        await userStore.fetchUser()
        return res.data
    }

    const logout = () => userStore.signOut()

    return {
        user,
        isLoggedIn: () => userStore.isLoggedIn,
        login,
        logout,
        fetchUser: (endpoint) => userStore.fetchUser(endpoint),
        isAllowedTo: (slug) => userStore.isAllowedTo(slug)
    }
}
