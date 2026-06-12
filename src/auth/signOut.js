import { getApiClient, getAuthStrategy } from '../api/client.js'
import shStorage from '../utils/storage.js'
import { getShConfig } from '../config.js'

export function signOutUser () {
    const loginUrl = getShConfig('loginUrl', 'auth/login')
    const logoutApiEndpoint = getShConfig('logoutApiEndpoint', 'auth/logout')
    const cleanup = () => {
        getAuthStrategy()?.clear()
        shStorage.removeItem('user')
        shStorage.removeItem('last_activity')
        window.location.href = loginUrl
    }
    return getApiClient().post(logoutApiEndpoint).then(cleanup).catch(cleanup)
}
