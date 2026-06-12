// Token storages share the { get, set, clear } contract used by BearerStrategy.
// Default is sessionStorage: tokens never persist beyond the tab, unlike the
// old localStorage approach. 'local' remains an opt-in escape hatch for apps
// that need multi-tab login continuity.

const TOKEN_KEY = 'sh_access_token'

let inMemoryToken = null

export const memoryTokenStorage = {
    get: () => inMemoryToken,
    set: (token) => { inMemoryToken = token },
    clear: () => { inMemoryToken = null }
}

export const sessionTokenStorage = {
    get: () => sessionStorage.getItem(TOKEN_KEY),
    set: (token) => sessionStorage.setItem(TOKEN_KEY, token),
    clear: () => sessionStorage.removeItem(TOKEN_KEY)
}

export const localTokenStorage = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY)
}

export function resolveTokenStorage (storage = 'session') {
    if (storage && typeof storage === 'object') {
        return storage
    }
    switch (storage) {
    case 'memory':
        return memoryTokenStorage
    case 'local':
        return localTokenStorage
    case 'session':
    default:
        return sessionTokenStorage
    }
}
