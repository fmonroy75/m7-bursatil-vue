// src/services/newsApi.js
import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_API_URL = import.meta.env.VITE_NEWS_API_URL

// Categorías de NewsAPI (limitadas pero ampliamos con búsquedas por keywords)
const NEWS_API_CATEGORIES = [
  'business',      // → Empresas, Economía, Mercados
  'technology',    // → Tecnología
  /*'science',       // → Ciencia
  'health',        // → Salud
  'entertainment', // → Entretenimiento
  'sports',        // → Deportes*/
  'markets',
  'general'        // → General
]

// Términos de búsqueda para categorías específicas que no existen en NewsAPI
const CATEGORY_KEYWORDS = {
  'Economía': ['economy', 'economics', 'inflation', 'gdp', 'interest rates', 'federal reserve', 'banco central'],
  'Política': ['politics', 'government', 'congress', 'senate', 'election', 'policy', 'legislation'],
  'Empresas': ['business', 'corporation', 'company', 'earnings', 'merger', 'acquisition', 'ceo', 'corporate']
}

// Mapeo ampliado de categorías
const categoryMapping = {
  // Mapeo directo de categorías de API
  
  'Mercados': 'business',
  'business': 'Empresas',
  'technology': 'Tecnología',
  /*'science': 'Ciencia',
  'health': 'Salud',
  'entertainment': 'Entretenimiento',
  'sports': 'Deportes',*/
  'general': 'General',
  
  // Mapeo por palabras clave (se asignará después del análisis)
  'economy': 'Economía',
  'politics': 'Política',
  'Mercados': 'markets',
  'markets': 'Mercados'
}

// Detectar categoría por contenido (título y descripción)
const detectCategoryByContent = (title, description) => {
  const text = `${title} ${description || ''}`.toLowerCase()
  
  // Verificar Economía
  if (CATEGORY_KEYWORDS['Economía'].some(keyword => text.includes(keyword.toLowerCase()))) {
    return 'Economía'
  }
  
  // Verificar Política
  if (CATEGORY_KEYWORDS['Política'].some(keyword => text.includes(keyword.toLowerCase()))) {
    return 'Política'
  }
  
  // Verificar Empresas (si no es economía específicamente)
  if (CATEGORY_KEYWORDS['Empresas'].some(keyword => text.includes(keyword.toLowerCase()))) {
    return 'Empresas'
  }
  
  return null
}

export const fetchNews = async () => {
  try {
    console.log('📰 Verificando noticias en Firestore...')
    
    // Verificar si ya tenemos noticias recientes (últimas 24 horas)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    const newsRef = collection(db, 'news')
    const recentQuery = query(newsRef, orderBy('publishedAt', 'desc'), limit(1))
    const recentSnapshot = await getDocs(recentQuery)
    
    // Si hay noticias recientes, usarlas
    if (!recentSnapshot.empty) {
      const latestNews = recentSnapshot.docs[0].data()
      const latestDate = latestNews.publishedAt?.toDate?.() || new Date(latestNews.publishedAt)
      
      if (latestDate > oneDayAgo) {
        console.log('📰 Usando noticias existentes en Firestore (menos de 24h)')
        const allNewsQuery = query(newsRef, orderBy('publishedAt', 'desc'), limit(50))
        const allSnapshot = await getDocs(allNewsQuery)
        
        return allSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
        }))
      }
    }

    console.log('🌐 Obteniendo noticias desde NewsAPI...')
    
    const allNews = []
    const batch = writeBatch(db)
    
    // Obtener noticias por categorías de API
    for (const category of NEWS_API_CATEGORIES) {
      try {
        console.log(`📡 Cargando categoría API: ${category}...`)
        
        const response = await fetch(
          `${NEWS_API_URL}/top-headlines?country=us&category=${category}&pageSize=10&apiKey=${NEWS_API_KEY}`
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
            
            // Intentar detectar categoría más específica por contenido
            const detectedCategory = detectCategoryByContent(article.title, article.description)
            if (detectedCategory) {
              finalCategory = detectedCategory
            }
            
            const newsId = `news_${Date.now()}_${category}_${index}`
            const newsRef = doc(db, 'news', newsId)
            
            const newsItem = {
              title: article.title,
              summary: article.description || 'Sin descripción',
              content: article.content || article.description || 'Contenido no disponible',
              imageUrl: article.urlToImage || null,
              author: article.author || 'Autor Desconocido',
              source: article.source?.name || 'NewsAPI',
              url: article.url,
              category: finalCategory,
              publishedAt: Timestamp.fromDate(new Date(article.publishedAt)),
              views: 0,
              createdAt: Timestamp.now()
            }
            
            batch.set(newsRef, newsItem)
            allNews.push({ id: newsId, ...newsItem, publishedAt: article.publishedAt })
          })
        }
        
        // Pequeña pausa para no exceder límites de API
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (catError) {
        console.error(`Error en categoría ${category}:`, catError)
      }
    }
    
    // Búsquedas adicionales por palabras clave para categorías específicas
    console.log('🔍 Realizando búsquedas por palabras clave...')
    
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      try {
        // Usar solo la primera palabra clave para no exceder límites
        const keyword = keywords[0]
        console.log(`🔎 Buscando noticias de ${catName} con keyword: ${keyword}`)
        
        const response = await fetch(
          `${NEWS_API_URL}/everything?q=${encodeURIComponent(keyword)}&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.articles && data.articles.length > 0) {
            data.articles.forEach((article, index) => {
              if (!article.title || article.title === '[Removed]') return
              
              // Evitar duplicados (por URL)
              if (allNews.some(n => n.url === article.url)) return
              
              const newsId = `news_${Date.now()}_keyword_${index}`
              const newsRef = doc(db, 'news', newsId)
              
              const newsItem = {
                title: article.title,
                summary: article.description || 'Sin descripción',
                content: article.content || article.description || 'Contenido no disponible',
                imageUrl: article.urlToImage || null,
                author: article.author || 'Autor Desconocido',
                source: article.source?.name || 'NewsAPI',
                url: article.url,
                category: catName,
                publishedAt: Timestamp.fromDate(new Date(article.publishedAt)),
                views: 0,
                createdAt: Timestamp.now()
              }
              
              batch.set(newsRef, newsItem)
              allNews.push({ id: newsId, ...newsItem, publishedAt: article.publishedAt })
            })
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (keywordError) {
        console.error(`Error buscando ${catName}:`, keywordError)
      }
    }
    
    // Guardar todas las noticias en Firestore
    if (allNews.length > 0) {
      await batch.commit()
      console.log(`✅ ${allNews.length} noticias guardadas en Firestore`)
      
      // Estadísticas por categoría
      const stats = {}
      allNews.forEach(item => {
        stats[item.category] = (stats[item.category] || 0) + 1
      })
      console.log('📊 Distribución por categoría:', stats)
    }
    
    return allNews
    
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}