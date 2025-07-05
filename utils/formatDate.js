import { format, isValid, parseISO } from 'date-fns'

export const formatDate = date => {
  try {
    if (!date) return 'N/A'

    // Try parsing as ISO string first
    let dateObj
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    } else {
      dateObj = new Date(date)
    }

    // Validate the date
    if (!isValid(dateObj)) {
      return 'Invalid date'
    }

    return format(dateObj, 'MMM dd, yyyy • h:mm a')
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}
