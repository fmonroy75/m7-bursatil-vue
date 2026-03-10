// src/services/newsApiIn.js
const BASE_URL = 'https://saurav.tech/NewsAPI'

// Mapeo de categorías (mismas que usabas antes)
const categoryMapping = {
  'business': 'Empresas',
  'technology': 'Tecnología',
  'science': 'Ciencia',
  'general': 'General'
}

// Detección por contenido (para Economía, Política, etc.)
const detectCategoryByContent = (title, description) => {
  const text = `${title} ${description || ''}`.toLowerCase()
  
  const keywords = {
    'Economía': ['economy', 'economics', 'inflation', 'gdp', 'interest rates', 'federal reserve'],
    'Política': ['politics', 'government', 'congress', 'senate', 'election', 'policy']
  }
  
  if (keywords['Economía'].some(k => text.includes(k))) return 'Economía'
  if (keywords['Política'].some(k => text.includes(k))) return 'Política'
  return null
}

export const fetchNewsFromNewsAPIIn = async () => {
  console.log('📡 Cargando noticias desde NewsAPI.in...')
  
  const categories = ['business', 'technology', 'general', 'science', 'health', 'entertainment', 'sports']
  const allNews = []
  
  for (const category of categories) {
    try {
      const response = await fetch(
        `${BASE_URL}/top-headlines/category/${category}/us.json`
      )
      
      if (!response.ok) {
        console.warn(`⚠️ Error en categoría ${category}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        data.articles.forEach((article, index) => {
          if (!article.title || article.title === '[Removed]') return
          
          // Determinar categoría final
          let finalCategory = categoryMapping[category] || 'General'
          const detected = detectCategoryByContent(article.title, article.description)
          if (detected) finalCategory = detected
          
          allNews.push({
            id: `news_${Date.now()}_${category}_${index}`,
            title: article.title,
            summary: article.description || 'Sin descripción',
            content: article.content || article.description || 'Contenido no disponible',
            imageUrl: article.urlToImage || 'https://via.placeholder.com/300x200',
            author: article.author || 'Autor Desconocido',
            source: article.source?.name || 'NewsAPI.in',
            url: article.url,
            category: finalCategory,
            publishedAt: article.publishedAt || new Date().toISOString(),
            views: 0
          })
        })
      }
      
      // Pequeña pausa para no saturar
      await new Promise(r => setTimeout(r, 300))
      
    } catch (error) {
      console.error(`Error en categoría ${category}:`, error)
    }
  }
  
  console.log(`✅ ${allNews.length} noticias cargadas desde NewsAPI.in`)
  return allNews
}

// Función para obtener noticias por categoría específica
export const fetchNewsByCategory = async (category) => {
  try {
    const response = await fetch(
      `${BASE_URL}/top-headlines/category/${category}/us.json`
    )
    const data = await response.json()
    return data.articles || []
  } catch (error) {
    console.error(`Error fetching ${category}:`, error)
    return []
  }
}