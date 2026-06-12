import { getApiClient } from './client.js'

// Same call signatures as shframework v5's shApis. Auth headers, session
// touching and 401 handling now live in the shared client interceptors.

function doGet (endPoint, data, extraConfig) {
    return getApiClient().get(endPoint, {
        params: data,
        ...extraConfig
    })
}

function doPost (endPoint, data, extraConfig) {
    return getApiClient().post(endPoint, data, extraConfig)
}

function doPut (endPoint, data, extraConfig) {
    return getApiClient().put(endPoint, data, extraConfig)
}

function doPatch (endPoint, data, extraConfig) {
    return getApiClient().patch(endPoint, data, extraConfig)
}

function doDelete (endPoint, data, extraConfig) {
    return getApiClient().delete(endPoint, {
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
