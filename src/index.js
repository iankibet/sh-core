import shApis from './api/shApis.js'
import shStorage from './utils/storage.js'
import shRepo from './shRepo.js'
import useShFetch from './composables/useShFetch.js'
import useStreamline from './streamline/useStreamline.js'
import getActionUrl from './streamline/getActionUrl.js'
import streamlineCache from './streamline/cache.js'
import ifUserCan from './directives/ifUserCan.js'

export { createApiClient, getApiClient, getAuthStrategy, initApi } from './api/client.js'
export { useUserStore } from './stores/user.js'
export { useAppStore } from './stores/app.js'
export { useAuth } from './auth/useAuth.js'
export { signOutUser } from './auth/signOut.js'
export { BearerStrategy } from './auth/strategies/bearer.js'
export { CookieStrategy } from './auth/strategies/cookie.js'
export {
    memoryTokenStorage,
    sessionTokenStorage,
    localTokenStorage,
    resolveTokenStorage
} from './auth/tokenStorage.js'
export { startSession, stopSession, touchSession, checkSession, sessionRestored } from './auth/session.js'
export { getShConfig, setShConfig } from './config.js'
export {
    swalSuccess,
    swalError,
    swalHttpError,
    formatHttpCatchError,
    showToast,
    confirmAction,
    runPlainRequest
} from './notify/swal.js'
export { formatDate, formatNumber, numberFormat } from './utils/format.js'
export { ShCore, createShCore } from './plugins/shCore.js'

export {
    shApis,
    shStorage,
    shRepo,
    useShFetch,
    useStreamline,
    getActionUrl,
    streamlineCache,
    ifUserCan
}
