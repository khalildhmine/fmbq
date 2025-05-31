import { format } from 'date-fns'

export const formatDate = date => {
  try {
    const dateObj = new Date(date)
    return format(dateObj, 'MMM dd, yyyy • h:mm a')
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}
