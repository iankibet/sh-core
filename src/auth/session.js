import { DateTime } from 'luxon'
import Swal from 'sweetalert2'
import shStorage from '../utils/storage.js'
import { getAuthStrategy } from '../api/client.js'
import { signOutUser } from './signOut.js'

// Ported from shframework's ShSession, without the start-on-import side
// effect. startSession() is triggered by the plugin (when sessionTimeout is
// configured) or after login(); touchSession() runs on every API request.

function isAuthenticated () {
    try {
        return !!getAuthStrategy()?.isAuthenticated()
    } catch (err) {
        return false
    }
}

function logoutUser () {
    if (!sessionRestored()) {
        signOutUser()
    } else {
        console.log('session has been restored in another tab')
    }
}

export function sessionRestored () {
    const timeout = shStorage.getItem('sessionTimeout') * 60
    const lastActivity = shStorage.getItem('last_activity')
    if (!isAuthenticated()) {
        return false
    }
    const pastSeconds = DateTime.now().diff(DateTime.fromISO(lastActivity), 'seconds').seconds
    return pastSeconds < timeout
}

export function checkSession () {
    const timeout = shStorage.getItem('sessionTimeout')
    const lastActivity = shStorage.getItem('last_activity')
    if (isAuthenticated()) {
        const pastMinutes = DateTime.now().diff(DateTime.fromISO(lastActivity), 'minutes').minutes
        const pastSeconds = DateTime.now().diff(DateTime.fromISO(lastActivity), 'seconds').seconds
        if (pastMinutes >= timeout) {
            const gracePeriod = pastSeconds - (timeout * 60)
            if (gracePeriod >= 60) {
                logoutUser()
            } else if (!window.ShConfirmation) {
                window.ShConfirmation = shSwalLogout(30)
            }
        }
    } else {
        stopSession()
    }
}

async function shSwalLogout (seconds = 30) {
    let timerInterval
    return Swal.fire({
        title: 'Your session is about to Expire!',
        html: 'You will be logged out in <strong></strong> seconds due to inactivity!',
        showCancelButton: true,
        cancelButtonColor: '#32c787',
        confirmButtonColor: '#000',
        cancelButtonText: 'Stay signed in',
        confirmButtonText: 'Sign out now!',
        timer: seconds * 1000,
        allowOutsideClick: false,
        reverseButtons: true,
        showLoaderOnConfirm: true,
        didOpen () {
            timerInterval = setInterval(() => {
                const strong = Swal.getHtmlContainer()?.querySelector('strong')
                if (strong) {
                    strong.textContent = (Swal.getTimerLeft() / 1000).toFixed(0)
                }
            }, 100)
        },
        willClose: () => {
            clearInterval(timerInterval)
        }
    }).then((result) => {
        if (result.isConfirmed || result.dismiss === 'timer') {
            logoutUser()
        } else {
            window.ShConfirmation = null
            stopSession()
            shStorage.setItem('last_activity', DateTime.now().toISO())
            startSession()
        }
    })
}

export function startSession () {
    if (!isAuthenticated()) {
        return
    }
    shStorage.setItem('last_activity', DateTime.now().toISO())
    const timeout = shStorage.getItem('sessionTimeout')
    if (!timeout) {
        return
    }
    const interval = (timeout * 60 * 1000) / 3
    stopSession()
    window.shInterval = setInterval(() => {
        checkSession()
    }, interval)
}

export function stopSession () {
    if (window.shInterval) {
        clearInterval(window.shInterval)
        window.shInterval = null
    }
}

export function touchSession () {
    if (!window.shInterval) {
        startSession()
    }
    shStorage.setItem('last_activity', DateTime.now().toISO())
}
