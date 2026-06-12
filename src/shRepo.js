import shApis from './api/shApis.js'
import { getShConfig } from './config.js'
import { signOutUser } from './auth/signOut.js'
import { formatDate, formatNumber, numberFormat } from './utils/format.js'
import {
    swalSuccess,
    swalError,
    swalHttpError,
    formatHttpCatchError,
    showToast,
    confirmAction,
    runPlainRequest
} from './notify/swal.js'

function runSilentRequest (url) {
    return shApis.doPost(url)
}

// Aggregate matching v5's shRepo, minus the Bootstrap/DOM helpers
// (showModal, hideModal, showOffCanvas, hideOffCanvas, setTabCounts,
// getMenuCount) which live in the UI packages.
export default {
    swalSuccess,
    swalError,
    runPlainRequest,
    confirmAction,
    getShConfig,
    showToast,
    runSilentRequest,
    swalHttpError,
    formatHttpCatchError,
    formatDate,
    numberFormat,
    formatNumber,
    signOutUser
}
