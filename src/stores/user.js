import { defineStore } from 'pinia'
import { DateTime } from 'luxon'
import shStorage from '../utils/storage.js'
import shApis from '../api/shApis.js'
import { getAuthStrategy } from '../api/client.js'
import { getShConfig } from '../config.js'
import { signOutUser } from '../auth/signOut.js'

function checkPermission (permissions, slug) {
    if (!slug) {
        return true
    }
    if (!permissions) {
        return false
    }
    return permissions.includes(slug)
}

// Compat: app code and the v-if-user-can directive call these on the user
// object itself (user.isAllowedTo(...), user.can(...))
function attachUserHelpers (user, store) {
    if (!user || typeof user !== 'object') {
        return user
    }
    user.isAllowedTo = function (slug) {
        return checkPermission(this.permissions, slug)
    }
    user.can = user.isAllowedTo
    user.signOut = () => store.signOut()
    user.logout = user.signOut
    user.logOut = user.signOut
    return user
}

export const useUserStore = defineStore('user-store', {
    state: () => ({
        user: null,
        role: null,
        permissions: null,
        menus: [],
        loggedOut: false
    }),
    actions: {
        fetchUser (defaultEndpoint) {
            // Hydrate instantly from the cached user, then revalidate
            let cached = null
            try {
                cached = shStorage.getItem('user')
            } catch (err) {
                cached = null
            }
            if (cached && typeof cached === 'object') {
                this.user = attachUserHelpers(cached, this)
                this.permissions = cached.permissions ?? null
            }
            shStorage.setItem('session_start', DateTime.now().toISO())

            const userEndpoint = defaultEndpoint ?? getShConfig('userEndpoint', 'auth/user')
            return shApis.doGet(userEndpoint).then(res => {
                let user = res.data?.user
                if (typeof user === 'undefined') {
                    user = res.data
                }
                // Only persist valid JSON user objects; anything else (HTML
                // error page, plain string, array) would leave a user without
                // isAllowedTo/can helpers and break consumers
                if (!user || typeof user !== 'object' || Array.isArray(user)) {
                    console.warn('[sh-core] userEndpoint did not return a valid user object, keeping previous user', user)
                    return this.user
                }
                shStorage.setItem('user', user)
                this.user = attachUserHelpers(user, this)
                this.permissions = user.permissions ?? null
                return this.user
            }).catch((reason) => {
                if (reason.response && reason.response.status) {
                    if (reason.response.status === 401) {
                        shStorage.setItem('user', null)
                        this.user = null
                        this.permissions = null
                    }
                    this.loggedOut = true
                }
            })
        },
        // v5 compat aliases
        setUser (defaultEndpoint) {
            return this.fetchUser(defaultEndpoint)
        },
        getUser () {
            return this.fetchUser()
        },
        setAccessToken (accessToken) {
            getAuthStrategy()?.setToken(accessToken)
            return this.fetchUser()
        },
        isAllowedTo (slug) {
            return checkPermission(this.user?.permissions ?? this.permissions, slug)
        },
        signOut () {
            return signOutUser()
        },
        logOut () {
            return this.signOut()
        }
    },
    getters: {
        userId (state) {
            return state.user === null ? null : state.user.id
        },
        isLoggedIn (state) {
            return state.user !== null
        }
    }
})
