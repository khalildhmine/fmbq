/**
 * Format a number as a price with the French locale and 2 decimal places
 * @param {number|string} price - The price to format
 * @returns {string} The formatted price
 */
function formatPrice(price) {
  if (!price && price !== 0) return '0.00'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(price))
}

module.exports = {
  formatPrice,
}
