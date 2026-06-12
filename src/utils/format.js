import { DateTime } from 'luxon'

export function formatDate (date, format) {
    if (!format) {
        format = 'lll'
    }

    const formatMap = {
        'lll': 'MMM d, yyyy, h:mm a',
        'LLL': 'MMMM d, yyyy, h:mm a',
        'll': 'MMMM d, yyyy',
        'LL': 'MMMM d, yyyy',
        'L': 'MM/dd/yyyy',
        'l': 'MM/dd/yyyy',
        'YYYY-MM-DD': 'yyyy-MM-dd',
        'YYYY/MM/DD': 'yyyy/MM/dd',
        'YYYY': 'yyyy',
        'MM': 'MM',
        'DD': 'dd',
        'HH:mm': 'HH:mm',
        'hh:mm A': 'hh:mm a',
        'MMM D, YYYY': 'MMM d, yyyy',
        'MMMM D, YYYY': 'MMMM d, yyyy',
        'MMM D, YYYY h:mm A': 'MMM d, yyyy h:mm a',
        'MMMM D, YYYY h:mm A': 'MMMM d, yyyy h:mm a'
    }
    const luxonFormat = formatMap[format] || format
    // Accepts ISO string, JS Date, or Luxon DateTime
    let dt
    if (typeof date === 'string' || date instanceof String) {
        dt = DateTime.fromISO(date)
        if (!dt.isValid) dt = DateTime.fromRFC2822(date)
        if (!dt.isValid) dt = DateTime.fromFormat(date, 'yyyy-MM-dd')
    } else if (date instanceof Date) {
        dt = DateTime.fromJSDate(date)
    } else if (date && typeof date === 'object' && date.isValid !== undefined) {
        dt = date
    } else {
        return ''
    }
    return dt.isValid ? dt.toFormat(luxonFormat) : ''
}

export function numberFormat (amount, decimalPoints = 0) {
    let formatted = parseFloat(amount).toFixed(decimalPoints)
    formatted = new Intl.NumberFormat().format(formatted)
    const formattedArr = formatted.split('.')
    return decimalPoints === 0 ? formattedArr[0] : formattedArr[0] + '.' + (formattedArr[1] || '0').padEnd(decimalPoints, 0)
}

export function formatNumber (amount, decimalPoints = 0) {
    return numberFormat(amount, decimalPoints)
}
