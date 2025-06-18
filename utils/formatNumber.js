function formatPrice(number) {
  if (!number && number !== 0) return '0.00'
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(number))
}

// Make sure to use CommonJS exports for Next.js
module.exports = {
  formatPrice,
}
