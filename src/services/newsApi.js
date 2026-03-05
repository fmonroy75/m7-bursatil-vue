// src/services/newsApi.js
import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  updateDoc // Añadir updateDoc para incrementar views
} from 'firebase/firestore'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_API_URL = import.meta.env.VITE_NEWS_API_URL

// Categorías de NewsAPI
const NEWS_API_CATEGORIES = [
  'business',      // → Empresas, Economía, Mercados
  'technology',    // → Tecnología
  /*'science',       // → Ciencia
  'health',        // → Salud
  'entertainment', // → Entretenimiento
  'sports',        // → Deportes*/
  'general'        // → General
]

// Términos de búsqueda para categorías específicas
const CATEGORY_KEYWORDS = {
  'Economía': ['economy', 'economics', 'inflation', 'gdp', 'interest rates', 'federal reserve', 'banco central'],
  'Política': ['politics', 'government', 'congress', 'senate', 'election', 'policy', 'legislation'],
  'Empresas': ['business', 'corporation', 'company', 'earnings', 'merger', 'acquisition', 'ceo', 'corporate']
}

// Mapeo de categorías
const categoryMapping = {
  'business': 'Empresas',
  'technology': 'Tecnología',
  /*'science': 'Ciencia',
  'health': 'Salud',
  'entertainment': 'Entretenimiento',
  'sports': 'Deportes',*/
  'general': 'General',
  'economy': 'Economía',
  'politics': 'Política',
  'markets': 'Mercados'
}

// Detectar categoría por contenido
const detectCategoryByContent = (title, description) => {
  const text = `${title} ${description || ''}`.toLowerCase()
  
  if (CATEGORY_KEYWORDS['Economía'].some(keyword => text.includes(keyword.toLowerCase()))) {
    return 'Economía'
  }
  
  if (CATEGORY_KEYWORDS['Política'].some(keyword => text.includes(keyword.toLowerCase()))) {
    return 'Política'
  }
  
  if (CATEGORY_KEYWORDS['Empresas'].some(keyword => text.includes(keyword.toLowerCase()))) {
    return 'Empresas'
  }
  
  return null
}

// ============= FUNCIONES DE NOTICIAS =============

export const fetchNews = async () => {
  try {
    console.log('📰 Verificando noticias en Firestore...')
    
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    const newsRef = collection(db, 'news')
    const recentQuery = query(newsRef, orderBy('publishedAt', 'desc'), limit(1))
    const recentSnapshot = await getDocs(recentQuery)
    
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
            
            let finalCategory = categoryMapping[category] || 'General'
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
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (catError) {
        console.error(`Error en categoría ${category}:`, catError)
      }
    }
    
    // Búsquedas adicionales por palabras clave
    console.log('🔍 Realizando búsquedas por palabras clave...')
    
    for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      try {
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
    
    if (allNews.length > 0) {
      await batch.commit()
      console.log(`✅ ${allNews.length} noticias guardadas en Firestore`)
      
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

export const fetchNewsById = async (newsId) => {
  try {
    const docRef = doc(db, 'news', newsId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      
      // Incrementar contador de vistas
      await updateDoc(docRef, {
        views: (data.views || 0) + 1
      })
      
      return {
        id: docSnap.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.() || data.publishedAt
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching news by id:', error)
    return null
  }
}

// ============= FUNCIONES DE COMENTARIOS =============

export const fetchComments = async (newsId) => {
  try {
    const commentsRef = collection(db, 'comments')
    const q = query(
      commentsRef,
      where('newsId', '==', newsId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }))
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export const addComment = async (newsId, comment) => {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      newsId,
      ...comment,
      createdAt: Timestamp.now()
    })
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: error.message }
  }
}

// ============= FUNCIONES AUXILIARES =============

export const getNewsByCategory = async (category) => {
  try {
    const newsRef = collection(db, 'news')
    const q = query(
      newsRef,
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(20)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
    }))
  } catch (error) {
    console.error('Error fetching news by category:', error)
    return []
  }
}

export const searchNews = async (searchTerm) => {
  try {
    // Nota: Firestore no soporta búsqueda de texto completo nativamente
    // Esta es una implementación simple, para búsqueda avanzada considera Algolia o MeiliSearch
    const newsRef = collection(db, 'news')
    const snapshot = await getDocs(newsRef)
    
    const results = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
      }))
      .filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 20)
    
    return results
  } catch (error) {
    console.error('Error searching news:', error)
    return []
  }
}