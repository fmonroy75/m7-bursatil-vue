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
  updateDoc
} from 'firebase/firestore'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_API_URL = import.meta.env.VITE_NEWS_API_URL

// Categorías de NewsAPI
const NEWS_API_CATEGORIES = [
  'business',      // → Empresas, Economía, Mercados
  'technology',    // → Tecnología
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
  'general': 'General',
  'economy': 'Economía',
  'politics': 'Política',
  'markets': 'Mercados'
}

// ===== FUNCIÓN: Verificar configuración de API =====
/*const isApiConfigured = () => {
  return !!(
    NEWS_API_KEY && 
    NEWS_API_URL && 
    !NEWS_API_KEY.includes('undefined') && 
    !NEWS_API_URL.includes('undefined')
  )
}*/
const isApiConfigured = () => {
  return true // Siempre disponible
}

// ===== FUNCIÓN: Detectar categoría por contenido =====
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

// ===== FUNCIÓN: Verificar si una noticia ya existe en Firebase =====
const newsExists = async (url) => {
  try {
    const newsRef = collection(db, 'news')
    const q = query(newsRef, where('url', '==', url))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Error verificando existencia:', error)
    return false
  }
}

// ===== FUNCIÓN: Obtener noticias desde Firebase =====
const fetchNewsFromFirebase = async () => {
  try {
    //console.log('📰 Cargando noticias desde Firebase...')
    const newsRef = collection(db, 'news')
    const q = query(newsRef, orderBy('publishedAt', 'desc'), limit(50))
    const snapshot = await getDocs(q)
    
    const news = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishedAt: doc.data().publishedAt?.toDate?.() || doc.data().publishedAt
    }))
    
    //console.log(`✅ ${news.length} noticias cargadas desde Firebase`)
    return news
  } catch (error) {
    console.error('Error cargando desde Firebase:', error)
    return []
  }
}

// ===== FUNCIÓN: Obtener noticias desde NewsAPI (sin duplicados) =====
const fetchNewsFromAPI = async () => {
  //console.log('🌐 Intentando obtener noticias desde NewsAPI...')
  
  if (!isApiConfigured()) {
    throw new Error('API no configurada correctamente')
  }

  const allNews = []
  const batch = writeBatch(db)
  let hasErrors = false
  let nuevasNoticias = 0
  
  // Obtener noticias por categorías de API
  for (const category of NEWS_API_CATEGORIES) {
    try {
      const response = await fetch(
        //`${NEWS_API_URL}/top-headlines?country=us&category=${category}&pageSize=10&apiKey=${NEWS_API_KEY}`
        `${NEWS_API_URL}/top-headlines/category/${category}/us.json`
      )
      
      if (!response.ok) {
        if (response.status === 426) {
          throw new Error('NewsAPI bloqueado en producción (error 426)')
        }
        console.warn(`⚠️ Error en categoría ${category}: ${response.status}`)
        hasErrors = true
        continue
      }
      
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        for (const [index, article] of data.articles.entries()) {
          if (!article.title || article.title === '[Removed]') continue
          
          // VERIFICAR SI YA EXISTE EN FIREBASE
          const existe = await newsExists(article.url)
          if (existe) {
            //console.log(`⏭️ Noticia ya existe: ${article.title.substring(0, 30)}...`)
            continue
          }
          
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
          nuevasNoticias++
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (catError) {
      console.error(`Error en categoría ${category}:`, catError.message)
      hasErrors = true
    }
  }
  
  // Búsquedas adicionales por palabras clave
  // Simplificación de fetchNewsFromAPI
const fetchNewsFromAPI = async () => {
  console.log('🌐 Intentando obtener noticias desde NewsAPI.in...')
  
  const allNews = []
  const batch = writeBatch(db)
  const BASE_URL = 'https://saurav.tech/NewsAPI'
  
  for (const category of NEWS_API_CATEGORIES) {
    try {
      const response = await fetch(
        `${BASE_URL}/top-headlines/category/${category}/us.json`
      )
      
      if (!response.ok) continue
      
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        // ... mismo procesamiento que antes ...
      }
    } catch (error) {
      console.error(`Error en categoría ${category}:`, error)
    }
  }
  
  return allNews
}
  /*for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    try {
      const keyword = keywords[0]
      
      const response = await fetch(
        `${NEWS_API_URL}/everything?q=${encodeURIComponent(keyword)}&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`
      )
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.articles && data.articles.length > 0) {
          for (const [index, article] of data.articles.entries()) {
            if (!article.title || article.title === '[Removed]') continue
            if (allNews.some(n => n.url === article.url)) continue
            
            // VERIFICAR SI YA EXISTE EN FIREBASE
            const existe = await newsExists(article.url)
            if (existe) {
              //console.log(`⏭️ Noticia ya existe (keyword): ${article.title.substring(0, 30)}...`)
              continue
            }
            
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
            nuevasNoticias++
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (keywordError) {
      console.error(`Error buscando ${catName}:`, keywordError.message)
      hasErrors = true
    }
  }*/
  
  // Guardar en Firestore solo si hay noticias NUEVAS
  if (nuevasNoticias > 0) {
    await batch.commit()
    //console.log(`✅ ${nuevasNoticias} noticias NUEVAS guardadas en Firestore desde API`)
  } else {
    //console.log('📦 No hay noticias nuevas para guardar')
  }
  
  // Si hubo errores pero tenemos noticias, las devolvemos igual
  if (hasErrors && allNews.length > 0) {
    //console.log('⚠️ Algunas categorías fallaron, pero se obtuvieron noticias parciales')
  }
  
  return allNews
}

// ===== FUNCIÓN PRINCIPAL: fetchNews =====
export const fetchNews = async () => {
  //console.log('📰 Iniciando carga de noticias...')
  
  // 1. INTENTAR CON NEWSAPI (si está configurada)
  if (isApiConfigured()) {
    try {
      //console.log('🌐 NewsAPI configurada, intentando obtener noticias frescas...')
      const apiNews = await fetchNewsFromAPI()
      
      if (apiNews.length > 0) {
        //console.log(`✅ ${apiNews.length} noticias obtenidas desde NewsAPI (${apiNews.length} nuevas)`)
        return apiNews
      } else {
        //console.log('⚠️ NewsAPI devolvió 0 noticias nuevas')
      }
    } catch (error) {
      console.error('❌ Error en NewsAPI:', error.message)
    }
  } else {
    //console.log('⚠️ NewsAPI no está configurada correctamente')
  }
  
  // 2. FALLBACK: Usar Firebase
  //console.log('📦 Usando noticias desde Firebase como fallback...')
  const firebaseNews = await fetchNewsFromFirebase()
  
  if (firebaseNews.length > 0) {
    //console.log(`✅ ${firebaseNews.length} noticias cargadas desde Firebase`)
    return firebaseNews
  }
  
  // 3. Si Firebase también está vacío
  //console.log('❌ No hay noticias disponibles en Firebase')
  return []
}

// ===== FUNCIÓN PARA REFRESCAR MANUALMENTE =====
export const refreshNews = async () => {
  //console.log('🔄 Forzando actualización desde NewsAPI...')
  
  if (!isApiConfigured()) {
    //console.log('⚠️ API no configurada, no se puede refrescar')
    return await fetchNewsFromFirebase()
  }
  
  try {
    const apiNews = await fetchNewsFromAPI()
    if (apiNews.length > 0) {
      console.log(`✅ ${apiNews.length} noticias nuevas obtenidas desde API`)
      return apiNews
    }
  } catch (error) {
    console.error('Error en refresh:', error.message)
  }
  
  // Si falla API, devolver Firebase
  //console.log('📦 Refresh falló, usando Firebase...')
  return await fetchNewsFromFirebase()
}

// ===== FUNCIÓN PARA VERIFICAR CONFIGURACIÓN =====
export const checkNewsConfig = () => {
  //console.log('🔧 Verificación de configuración NewsAPI:')
  //console.log(`   - URL: ${NEWS_API_URL ? '✓' : '✗'} ${NEWS_API_URL || 'no configurada'}`)
  //console.log(`   - Key: ${NEWS_API_KEY ? '✓' : '✗'}`)
  
  if (NEWS_API_URL?.includes('undefined')) {
    console.warn('   ⚠️ La URL contiene "undefined" - revisa .env.production')
  }
  
  return isApiConfigured()
}

// ===== FUNCIÓN: Obtener noticia por ID =====
export const fetchNewsById = async (newsId) => {
  try {
    const docRef = doc(db, 'news', newsId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      
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

// ===== FUNCIÓN: Obtener comentarios =====
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

// ===== FUNCIÓN: Agregar comentario =====
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

// ===== FUNCIÓN: Obtener noticias por categoría =====
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

// ===== FUNCIÓN: Buscar noticias =====
export const searchNews = async (searchTerm) => {
  try {
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