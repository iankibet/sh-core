import { inject, onMounted, reactive, ref } from 'vue'
import shApis from '../api/shApis.js'
import { runPlainRequest } from '../notify/swal.js'
import { getShConfig } from '../config.js'
import Cache from './cache.js'

const useStreamline = (stream, ...initialArgs) => {
    const formData = {}
    const loading = ref(false)
    const propertiesFetched = ref(false)
    const confirmationMessage = ref(null)

    // Cache key for IndexedDB, include initialArgs in the key
    const cacheKey = `streamline_${stream}_${initialArgs.join('_')}`

    // Resolve the streamline endpoint: injection -> window global -> ShConfig
    let streamlineUrl = inject('streamlineUrl', window.streamlineUrl ?? getShConfig('streamlineUrl', '/api/streamline'))
    if (streamlineUrl && streamlineUrl.startsWith('/') && !streamlineUrl.startsWith('//') && typeof window !== 'undefined') {
        streamlineUrl = window.location.origin + streamlineUrl
    }
    const enableCache = inject('enableCache', window.enableCache ?? true)

    const originalProps = reactive({})

    // Proxy to intercept access
    const props = new Proxy(originalProps, {
        get (target, property, receiver) {
            if (!propertiesFetched.value) {
                fetchServiceProperties().then(() => target[property])
            }
            return Reflect.get(target, property, receiver) // Return the actual value
        },
        set (target, property, value, receiver) {
            return Reflect.set(target, property, value, receiver) // Update the value
        }
    })

    const fetchServiceProperties = async (force) => {
        if (!force) {
            if (loading.value || propertiesFetched.value) return
        }

        try {
            loading.value = true
            const response = await shApis.doPost(streamlineUrl, {
                action: 'onMounted',
                stream,
                params: initialArgs
            })
            assignProperties(response.data)
            if (enableCache) {
                await Cache.set(cacheKey, response.data)
            }
        } catch (error) {
            console.error(`Error fetching properties for stream ${stream}`, error)
            throw error
        } finally {
            propertiesFetched.value = true
            loading.value = false
        }
    }

    const assignProperties = (data) => {
        Object.assign(service, data.properties)
        Object.assign(originalProps, data.properties)
    }

    const handler = {
        get (target, prop, receiver) {
            if (prop in target) {
                return target[prop]
            }

            return (...args) => {
                if (prop === 'refresh' || prop === 'reload') {
                    return fetchServiceProperties(true)
                }
                if (prop === 'confirm') {
                    return confirmAction(args[0] ?? 'Are you sure?')
                }
                let repo = null
                const data = {
                    action: prop,
                    stream,
                    ...formData,
                    params: args,
                    initialParams: initialArgs
                }
                args.forEach(arg => {
                    if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
                        Object.assign(data, arg)
                    }
                })
                if (confirmationMessage.value) {
                    repo = runPlainRequest(streamlineUrl, null, confirmationMessage.value, data)
                } else {
                    repo = shApis.doPost(streamlineUrl, data)
                }

                loading.value = true
                return repo.then((response) => {
                    loading.value = false
                    if (confirmationMessage.value) {
                        confirmationMessage.value = null

                        if (!response.isConfirmed) {
                            return
                        }
                        if (response.value?.success) {
                            return response.value.response
                        } else {
                            // throw error
                            throw response.value.error
                        }
                    }

                    return response.data
                })
                    .catch((error) => {
                        loading.value = false
                        console.error(`Error calling ${prop} on stream ${stream}`, error)
                        throw error
                    })
            }
        }
    }
    const getActionUrl = (action, ...args) => {
        let newStream = stream
        if (action.includes(':')) {
            [newStream, action] = action.split(':')
        }
        const post = {
            action,
            stream: newStream,
            params: args
        }
        return `${streamlineUrl}?${new URLSearchParams(post).toString()}`
    }

    const service = reactive({})

    // Confirmation wrapper
    const confirmAction = (message) => {
        confirmationMessage.value = message
        return new Proxy(service, handler)
    }

    onMounted(async () => {
        if (enableCache) {
            const cachedData = await Cache.get(cacheKey)
            if (cachedData) {
                assignProperties(cachedData)
            }
        }
        if (initialArgs.length > 0) {
            fetchServiceProperties()
        }
    })

    return {
        loading,
        service: new Proxy(service, handler),
        getActionUrl,
        confirmAction,
        props
    }
}

export default useStreamline
