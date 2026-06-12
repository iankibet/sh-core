const DB_NAME = 'streamline_cache'
const STORE_NAME = 'properties'
const DB_VERSION = 1

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        request.onsuccess = (event) => {
            resolve(event.target.result)
        }

        request.onerror = (event) => {
            reject(event.target.error)
        }
    })
}

const Cache = {
    async get (key) {
        try {
            const db = await openDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly')
                const store = transaction.objectStore(STORE_NAME)
                const request = store.get(key)

                request.onsuccess = () => {
                    resolve(request.result)
                }

                request.onerror = () => {
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error getting from IndexedDB cache', error)
            return null
        }
    },

    async set (key, value) {
        try {
            const db = await openDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite')
                const store = transaction.objectStore(STORE_NAME)
                const request = store.put(value, key)

                request.onsuccess = () => {
                    resolve()
                }

                request.onerror = () => {
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error setting in IndexedDB cache', error)
        }
    },

    async delete (key) {
        try {
            const db = await openDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite')
                const store = transaction.objectStore(STORE_NAME)
                const request = store.delete(key)

                request.onsuccess = () => {
                    resolve()
                }

                request.onerror = () => {
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error deleting from IndexedDB cache', error)
        }
    },

    async clear () {
        try {
            const db = await openDB()
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite')
                const store = transaction.objectStore(STORE_NAME)
                const request = store.clear()

                request.onsuccess = () => {
                    resolve()
                }

                request.onerror = () => {
                    reject(request.error)
                }
            })
        } catch (error) {
            console.error('Error clearing IndexedDB cache', error)
        }
    }
}

export default Cache
