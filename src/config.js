import shStorage from './utils/storage.js'

// In-memory config is the source of truth for the current page lifetime.
// A scalar subset is mirrored to localStorage ('ShConfig') so values survive
// a hard reload before the plugin re-installs, matching v5 behaviour.
let shConfig = null

export function setShConfig (config) {
    shConfig = { ...config }
    const persistable = {}
    Object.keys(shConfig).forEach(key => {
        if (['string', 'number', 'boolean'].includes(typeof shConfig[key])) {
            persistable[key] = shConfig[key]
        }
    })
    shStorage.setItem('ShConfig', persistable)
}

export function getShConfig (key = null, def = '') {
    const config = shConfig ?? shStorage.getItem('ShConfig') ?? {}
    if (key) {
        return config[key] ?? def
    }
    return config
}
