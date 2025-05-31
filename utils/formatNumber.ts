// Format number with 2 decimal places and commas
const formatNumber = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '0.00'
  return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

// Format price with handling for strings and undefined
const formatPrice = (price: number | string | undefined): string => {
  if (!price) return '0.00'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return formatNumber(num)
}

// Export both functions
export { formatNumber, formatPrice }

// Default export for backwards compatibility
export default formatNumber
0.
