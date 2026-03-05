// src/utils/formatters.js
export const formatCurrency = (value) => {
    if (!value && value !== 0) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  export const formatPercentage = (value) => {
    if (!value && value !== 0) return '-'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }
  
  export const formatNumber = (value, decimals = 2) => {
    if (!value && value !== 0) return '0'
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }