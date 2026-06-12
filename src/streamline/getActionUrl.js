import useStreamline from './useStreamline.js'

export default function getActionUrl (actionSlug, ...args) {
    const { getActionUrl } = useStreamline('')
    return getActionUrl(actionSlug, ...args)
}
