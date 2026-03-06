// src/services/alphaVantageApi.js
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY
const ALPHA_VANTAGE_URL = import.meta.env.VITE_ALPHA_VANTAGE_URL

// Cache en localStorage para persistencia entre sesiones
const STORAGE_KEY = 'alpha_vantage_cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hora (reducir requests)

// Cola de requests para rate limiting
const requestQueue = []
let isProcessingQueue = false

// Símbolos con nombres amigables
const SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Google' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'Nasdaq' },
  { symbol: '^DJI', name: 'Dow Jones' }
]

// Datos de respaldo actualizados
const FALLBACK_DATA = {
  'Apple': { precio: 175.30, variacion: 0.95, volumen: 8500000 },
  'Microsoft': { precio: 420.75, variacion: 0.85, volumen: 7200000 },
  'Google': { precio: 155.20, variacion: 0.65, volumen: 6800000 },
  'Amazon': { precio: 185.90, variacion: 1.25, volumen: 5200000 },
  'Meta': { precio: 485.60, variacion: 1.80, volumen: 3800000 },
  'Bitcoin': { precio: 67500.00, variacion: 2.10, volumen: 42000 },
  'Ethereum': { precio: 3480.50, variacion: 1.65, volumen: 26000 },
  'S&P 500': { precio: 5210.30, variacion: 0.75, volumen: 2450000 },
  'Nasdaq': { precio: 16350.20, variacion: 1.15, volumen: 1750000 },
  'Dow Jones': { precio: 39120.45, variacion: 0.55, volumen: 1950000 }
}

// Cargar caché de localStorage
const loadCache = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch (e) {
    console.warn('Error loading cache:', e)
    return {}
  }
}

// Guardar en localStorage
const saveCache = (cache) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn('Error saving cache:', e)
  }
}

// Obtener datos de caché
const getCachedData = (symbol) => {
  const cache = loadCache()
  const item = cache[symbol]
  
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    //console.log(`📦 Usando datos en caché para ${symbol}`)
    return item.data
  }
  return null
}

// Guardar en caché
const setCachedData = (symbol, data) => {
  const cache = loadCache()
  cache[symbol] = {
    data,
    timestamp: Date.now()
  }
  saveCache(cache)
}

// Función para procesar la cola de requests
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return
  
  isProcessingQueue = true
  
  while (requestQueue.length > 0) {
    const { symbol, name, resolve, reject } = requestQueue.shift()
    
    try {
      //console.log(`📡 Procesando request para ${name} (${symbol})...`)
      
      const response = await fetch(
        `${ALPHA_VANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const text = await response.text()
      
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.warn(`⚠️ HTML recibido para ${symbol} - usando fallback`)
        resolve(FALLBACK_DATA[name])
        continue
      }
      
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.warn(`⚠️ Error parseando JSON para ${symbol}`)
        resolve(FALLBACK_DATA[name])
        continue
      }
      
      if (data.Note) {
        console.warn(`ℹ️ Rate limit: ${data.Note}`)
        resolve(FALLBACK_DATA[name])
        continue
      }
      
      const quote = data['Global Quote']
      
      if (quote && Object.keys(quote).length > 0) {
        const result = {
          precio: parseFloat(quote['05. price'] || 0),
          variacion: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
          volumen: parseInt(quote['06. volume'] || 0)
        }
        
        setCachedData(symbol, result)
        resolve(result)
      } else {
        resolve(FALLBACK_DATA[name])
      }
      
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error)
      resolve(FALLBACK_DATA[name])
    }
    
    // Esperar 12 segundos entre requests (5 por minuto)
    await new Promise(r => setTimeout(r, 12000))
  }
  
  isProcessingQueue = false
}

// Función principal optimizada
export const fetchMarketData = async () => {
  //console.log('📊 Obteniendo datos de mercado...')
  
  // Verificar API key
  if (!ALPHA_VANTAGE_KEY || ALPHA_VANTAGE_KEY === 'tu_alpha_vantage_key') {
    console.warn('⚠️ API key no configurada, usando datos de respaldo')
    return Object.entries(FALLBACK_DATA).map(([name, data]) => ({
      simbolo: name,
      ...data
    }))
  }

  // Intentar obtener datos de caché primero
  const results = []
  const symbolsNeeded = []
  
  for (const { symbol, name } of SYMBOLS) {
    const cached = getCachedData(symbol)
    if (cached) {
      results.push({
        simbolo: name,
        ...cached
      })
    } else {
      symbolsNeeded.push({ symbol, name })
    }
  }
  
  // Si todos los datos están en caché, devolver inmediatamente
  if (symbolsNeeded.length === 0) {
    //console.log('✅ Todos los datos obtenidos de caché')
    return results
  }
  
  //console.log(`🔄 Solicitando ${symbolsNeeded.length} símbolos nuevos...`)
  
  // Crear promesas para los símbolos necesarios
  const promises = symbolsNeeded.map(({ symbol, name }) => {
    return new Promise((resolve) => {
      requestQueue.push({ symbol, name, resolve })
    })
  })
  
  // Iniciar procesamiento de cola
  processQueue()
  
  // Esperar todos los resultados
  const newResults = await Promise.all(promises)
  
  // Combinar resultados
  symbolsNeeded.forEach(({ name }, index) => {
    results.push({
      simbolo: name,
      ...newResults[index]
    })
  })
  
  //console.log(`✅ Datos de mercado listos: ${results.length} activos`)
  return results
}

// Función para obtener un símbolo específico (útil para detalles)
export const fetchSymbolData = async (symbol) => {
  const symbolMap = SYMBOLS.find(s => s.symbol === symbol)
  const name = symbolMap?.name || symbol
  
  const cached = getCachedData(symbol)
  if (cached) return { simbolo: name, ...cached }
  
  return new Promise((resolve) => {
    requestQueue.push({ 
      symbol, 
      name,
      resolve: (data) => resolve({ simbolo: name, ...data })
    })
    processQueue()
  })
}

// Limpiar caché (útil para testing)
export const clearCache = () => {
  localStorage.removeItem(STORAGE_KEY)
  //console.log('🗑️ Caché eliminada')
}