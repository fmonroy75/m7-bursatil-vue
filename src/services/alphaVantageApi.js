// src/services/alphaVantageApi.js
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY
const ALPHA_VANTAGE_URL = import.meta.env.VITE_ALPHA_VANTAGE_URL

// Símbolos principales para seguimiento
const SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'BTC-USD', 'ETH-USD', '^GSPC', '^IXIC', '^DJI'
]

const symbolNames = {
  'AAPL': 'Apple',
  'MSFT': 'Microsoft',
  'GOOGL': 'Google',
  'AMZN': 'Amazon',
  'META': 'Meta',
  'BTC-USD': 'Bitcoin',
  'ETH-USD': 'Ethereum',
  '^GSPC': 'S&P 500',
  '^IXIC': 'Nasdaq',
  '^DJI': 'Dow Jones'
}

// Datos de respaldo en caso de error
const FALLBACK_DATA = [
  { simbolo: 'S&P 500', precio: 5200.50, variacion: 0.85, volumen: 2500000 },
  { simbolo: 'Nasdaq', precio: 16300.75, variacion: 1.20, volumen: 1800000 },
  { simbolo: 'Dow Jones', precio: 39000.30, variacion: 0.45, volumen: 2100000 },
  { simbolo: 'Bitcoin', precio: 68000.00, variacion: 2.30, volumen: 45000 },
  { simbolo: 'Ethereum', precio: 3500.00, variacion: 1.80, volumen: 28000 }
]

export const fetchMarketData = async () => {
  try {
    console.log('📊 Obteniendo datos de mercado desde Alpha Vantage...')
    
    // Verificar que tenemos API key
    if (!ALPHA_VANTAGE_KEY || ALPHA_VANTAGE_KEY === 'tu_alpha_vantage_key') {
      console.warn('⚠️ Alpha Vantage API key no configurada, usando datos de respaldo')
      return FALLBACK_DATA
    }
    
    const promises = SYMBOLS.map(async (symbol) => {
      try {
        const response = await fetch(
          `${ALPHA_VANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
        )
        
        if (!response.ok) return null
        
        // Verificar que la respuesta es JSON válido
        const text = await response.text()
        
        // Si empieza con <!DOCTYPE, es HTML (error)
        if (text.trim().startsWith('<!DOCTYPE')) {
          console.warn(`⚠️ Alpha Vantage devolvió HTML para ${symbol} - límite de API excedido?`)
          return null
        }
        
        const data = JSON.parse(text)
        const quote = data['Global Quote']
        
        if (quote && Object.keys(quote).length > 0) {
          return {
            simbolo: symbolNames[symbol] || symbol,
            precio: parseFloat(quote['05. price'] || 0),
            variacion: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
            volumen: parseInt(quote['06. volume'] || 0)
          }
        }
        
        // Mensaje de límite de API
        if (data.Note) {
          console.warn(`⚠️ Alpha Vantage: ${data.Note}`)
        }
        
        return null
      } catch (error) {
        console.warn(`Error fetching ${symbol}:`, error)
        return null
      }
    })
    
    const results = await Promise.all(promises)
    const validResults = results.filter(r => r !== null)
    
    if (validResults.length > 0) {
      console.log(`✅ Datos de mercado cargados: ${validResults.length} activos`)
      return validResults
    } else {
      console.log('📊 Usando datos de respaldo para el mercado')
      return FALLBACK_DATA
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    return FALLBACK_DATA
  }
}

export const fetchNewsSentiment = async (symbol) => {
  try {
    if (!ALPHA_VANTAGE_KEY || ALPHA_VANTAGE_KEY === 'tu_alpha_vantage_key') {
      console.warn('⚠️ Alpha Vantage API key no configurada')
      return []
    }
    
    const response = await fetch(
      `${ALPHA_VANTAGE_URL}?function=NEWS_SENTIMENT&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    )
    
    if (!response.ok) throw new Error('Error fetching news sentiment')
    
    const text = await response.text()
    
    if (text.trim().startsWith('<!DOCTYPE')) {
      console.warn(`⚠️ Alpha Vantage devolvió HTML para news sentiment - límite de API excedido?`)
      return []
    }
    
    const data = JSON.parse(text)
    return data.feed || []
  } catch (error) {
    console.error('Error fetching news sentiment:', error)
    return []
  }
}