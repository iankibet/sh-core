import Swal from 'sweetalert2'
import shApis from '../api/shApis.js'
import { getShConfig } from '../config.js'

// Every function accepts an optional trailing `options` object merged into
// the Swal.fire config (additive over the v5 signatures).

export function swalSuccess (message, options = {}) {
    return Swal.fire({ title: 'Success!', html: message, icon: 'success', ...options })
}

export function swalError (message, options = {}) {
    return Swal.fire({ title: 'Error!', html: message, icon: 'error', ...options })
}

export function formatHttpCatchError (reason) {
    if (reason && typeof reason.response !== 'undefined') {
        let reasonString = ''
        if (typeof reason.response.data === 'string') {
            reasonString = reason.response.data
        } else {
            reasonString = JSON.stringify(reason.response.data)
        }
        return reason.response.status + ': ' + reason.response.statusText + '<br/>' + reasonString
    }
    return 'A Unexpected script error occurred<br/>' + JSON.stringify(reason)
}

export function swalHttpError (reason, options = {}) {
    return Swal.fire({ title: 'Error!', html: formatHttpCatchError(reason), icon: 'error', ...options })
}

export function showToast (message, toastType, config) {
    if (!message) {
        return
    }
    const mixinConfig = {
        toast: true,
        position: getShConfig('swalPosition', window.swalPosition ?? 'top-end'),
        showConfirmButton: false,
        customClass: {
            popup: 'colored-toast'
        },
        iconColor: 'white',
        timer: 2000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    }
    if (!toastType) {
        toastType = 'success'
    }
    if (config) {
        Object.keys(config).map(key => {
            let newKey = key
            if (key === 'duration' || key === 'timeout') {
                newKey = 'timer'
            }
            mixinConfig[newKey] = config[key]
        })
    }
    const Toast = Swal.mixin(mixinConfig)
    return Toast.fire({
        icon: toastType,
        title: message
    })
}

export async function confirmAction (title, message, options = {}) {
    if (typeof title === 'undefined') {
        title = null
    }
    return Swal.fire({
        title: title !== null ? title : 'Are you sure?',
        html: message,
        showCancelButton: true,
        confirmButtonColor: '#32c787',
        cancelButtonText: 'No, cancel',
        confirmButtonText: 'Yes, Proceed!',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        ...options
    })
}

export async function runPlainRequest (url, message, title, data, options = {}) {
    if (typeof title === 'undefined') {
        title = null
    }
    return Swal.fire({
        title: title !== null ? title : 'Are you sure?',
        html: message,
        showCancelButton: true,
        confirmButtonColor: '#32c787',
        cancelButtonText: 'No, cancel',
        confirmButtonText: 'Yes, Proceed!',
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: () => {
            return shApis.doPost(url, data).then(function (response) {
                return {
                    response: response.data,
                    success: true
                }
            })
                .catch(error => {
                    return {
                        success: false,
                        error,
                        message: error.message
                    }
                })
        },
        allowOutsideClick: () => !Swal.isLoading(),
        ...options
    })
}
