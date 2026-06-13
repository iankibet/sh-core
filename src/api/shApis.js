import { getApiClient } from './client.js'
import { getShConfig } from '../config.js'
import { getActionUrlForStreamline } from '../streamline/useStreamline.js'

// Same call signatures as shframework v5's shApis. Auth headers, session
// touching and 401 handling now live in the shared client interceptors.

/**
 * Detects if endPoint is a streamline action format (contains :)
 */
function isStreamlineAction (endPoint) {
    return typeof endPoint === 'string' && endPoint.includes(':')
}

/**
 * Gets the streamline URL from window or config
 */
function getStreamlineUrl () {
    let url = window.streamlineUrl ?? getShConfig('streamlineUrl', '/api/streamline')
    if (url && url.startsWith('/') && !url.startsWith('//')) {
        url = window.location.origin + url
    }
    return url
}

function doGet (endPoint, data, extraConfig) {
    const resolvedEndPoint = isStreamlineAction(endPoint) 
        ? getActionUrlForStreamline(endPoint, getStreamlineUrl()) 
        : endPoint
    return getApiClient().get(resolvedEndPoint, {
        params: data,
        ...extraConfig
    })
}

function doPost (endPoint, data, extraConfig) {
    const resolvedEndPoint = isStreamlineAction(endPoint) 
        ? getActionUrlForStreamline(endPoint, getStreamlineUrl()) 
        : endPoint
    return getApiClient().post(resolvedEndPoint, data, extraConfig)
}

function doPut (endPoint, data, extraConfig) {
    const resolvedEndPoint = isStreamlineAction(endPoint) 
        ? getActionUrlForStreamline(endPoint, getStreamlineUrl()) 
        : endPoint
    return getApiClient().put(resolvedEndPoint, data, extraConfig)
}

function doPatch (endPoint, data, extraConfig) {
    const resolvedEndPoint = isStreamlineAction(endPoint) 
        ? getActionUrlForStreamline(endPoint, getStreamlineUrl()) 
        : endPoint
    return getApiClient().patch(resolvedEndPoint, data, extraConfig)
}

function doDelete (endPoint, data, extraConfig) {
    const resolvedEndPoint = isStreamlineAction(endPoint) 
        ? getActionUrlForStreamline(endPoint, getStreamlineUrl()) 
        : endPoint
    return getApiClient().delete(resolvedEndPoint, {
        data,
        ...extraConfig
    })
}

export default {
    doGet,
    doPost,
    doPut,
    doPatch,
    doDelete
}
