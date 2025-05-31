function formatNumber(number) {
  if (!number && number !== 0) return '0.00'
  return Number(number)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

// Make sure to use CommonJS exports for Next.js
module.exports = formatNumber
