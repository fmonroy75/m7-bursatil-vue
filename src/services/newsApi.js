// src/services/newsApi.js
/*import { db } from './firebase'
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
}* /
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
  }* /
  
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
}*/

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
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

const API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY
const API_URL = import.meta.env.VITE_NEWSDATA_API_URL

// Mapeo de categorías de NewsData a nuestras categorías
const categoryMapping = {
  'business': 'Empresas',
  'technology': 'Tecnología',
  'science': 'Ciencia',
  'top': 'General',
  'world': 'Internacional'
}

// ===== FUNCIÓN PARA VERIFICAR CONFIGURACIÓN =====
export const checkNewsConfig = () => {
  const isOk = !!(
    import.meta.env.VITE_NEWSDATA_API_KEY && 
    !import.meta.env.VITE_NEWSDATA_API_KEY.includes('undefined') &&
    import.meta.env.VITE_NEWSDATA_API_KEY !== 'tu_key_aqui'
  )
  
 // console.log('🔧 Verificación de configuración:')
 // console.log(`   - NewsData.io: ${isOk ? '✓' : '✗'}`)
 // console.log(`   - API Key: ${import.meta.env.VITE_NEWSDATA_API_KEY ? 'presente' : 'ausente'}`)
  
  if (!isOk) {
    console.warn('⚠️ Agrega VITE_NEWSDATA_API_KEY válida en .env')
  }
  
  return isOk
}

// ===== FUNCIÓN: Verificar duplicados =====
const newsExists = async (url) => {
  try {
    const q = query(collection(db, 'news'), where('url', '==', url))
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('Error verificando existencia:', error)
    return false
  }
}

// ===== FUNCIÓN: Obtener desde Firebase =====
export const fetchNewsFromFirebase = async () => {
  try {
   // console.log('📰 Cargando noticias desde Firebase...')
    const q = query(collection(db, 'news'), orderBy('publishedAt', 'desc'), limit(50))
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

// ===== FUNCIÓN: Obtener desde NewsData.io =====
export const fetchFromNewsData = async () => {
  //console.log('🌐 Obteniendo noticias desde NewsData.io...')
  
  if (!API_KEY || API_KEY.includes('undefined') || API_KEY === 'tu_key_aqui') {
    throw new Error('API no configurada correctamente')
  }

  const allNews = []
  const batch = writeBatch(db)
  //const categories = ['business', 'technology', 'science', 'health', 'entertainment', 'sports', 'top']
  const categories = ['business', 'technology', 'science',  'top']
  
  for (const category of categories) {
    try {
      const url = `${API_URL}/news?apikey=${API_KEY}&category=${category}&language=en&size=10`
      //console.log(`📡 Solicitando categoría: ${category}`)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`⚠️ Error en categoría ${category}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.results && data.results.length > 0) {
        for (const article of data.results) {
          if (!article.title) continue
          
          // Verificar duplicados
          const existe = await newsExists(article.link)
          if (existe) continue
          
          const newsId = `newsdata_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const newsRef = doc(db, 'news', newsId)
          
          // Determinar categoría final
          let finalCategory = 'General'
          if (article.category && article.category.length > 0) {
            const cat = article.category[0].toLowerCase()
            finalCategory = categoryMapping[cat] || 'General'
          }
          
          const newsItem = {
            title: article.title,
            summary: article.description || 'Sin descripción',
            content: article.content || article.description || 'Contenido no disponible',
            imageUrl: article.image_url || null,
            author: article.creator?.join(', ') || 'Autor Desconocido',
            source: article.source_id || 'NewsData.io',
            url: article.link,
            category: finalCategory,
            publishedAt: Timestamp.fromDate(new Date(article.pubDate)),
            views: 0,
            createdAt: Timestamp.now()
          }
          
          batch.set(newsRef, newsItem)
          allNews.push({ id: newsId, ...newsItem, publishedAt: article.pubDate })
        }
      }
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`Error en categoría ${category}:`, error.message)
    }
  }
  
  if (allNews.length > 0) {
    await batch.commit()
    //console.log(`✅ ${allNews.length} noticias guardadas desde NewsData.io`)
  } else {
    //console.log('📦 No hay noticias nuevas para guardar')
  }
  
  return allNews
}

// ===== FUNCIÓN PRINCIPAL =====
export const fetchNews = async () => {
  //console.log('📰 Iniciando carga de noticias...')
  
  // 1. Verificar configuración
  const configOk = checkNewsConfig()
  
  // 2. Intentar NewsData.io si está configurado
  if (configOk) {
    try {
    //  console.log('🌐 Usando NewsData.io como fuente principal...')
      const news = await fetchFromNewsData()
      if (news.length > 0) {
      //  console.log(`✅ ${news.length} noticias obtenidas desde NewsData.io`)
        return news
      } else {
        //console.log('⚠️ NewsData.io devolvió 0 noticias')
      }
    } catch (error) {
      console.error('❌ NewsData.io falló:', error.message)
    }
  } else {
    //console.log('⚠️ NewsData.io no está configurado correctamente')
  }
  
  // 3. Fallback a Firebase
 // console.log('📦 Usando Firebase como fallback...')
  const firebaseNews = await fetchNewsFromFirebase()
  if (firebaseNews.length > 0) {
   // console.log(`✅ ${firebaseNews.length} noticias desde Firebase`)
    return firebaseNews
  }
  
  // 4. Si todo falla
  //console.log('❌ No hay noticias disponibles')
  return []
}

// ===== FUNCIÓN PARA REFRESCAR MANUALMENTE =====
export const refreshNews = async () => {
  //console.log('🔄 Forzando actualización desde NewsData.io...')
  
  const configOk = checkNewsConfig()
  
  if (configOk) {
    try {
      const news = await fetchFromNewsData()
      if (news.length > 0) {
    //    console.log(`✅ ${news.length} noticias actualizadas`)
        return news
      }
    } catch (error) {
      console.error('Error en refresh:', error.message)
    }
  }
  
  // Si falla, devolver Firebase
  //console.log('📦 Refresh falló, usando Firebase...')
  return await fetchNewsFromFirebase()
}

// ===== FUNCIÓN: Obtener noticia por ID =====
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
        item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 20)
    
    return results
  } catch (error) {
    console.error('Error searching news:', error)
    return []
  }
}

// ===== FUNCIÓN: Eliminar noticia (útil para limpieza) =====
export const deleteNews = async (newsId) => {
  try {
    await deleteDoc(doc(db, 'news', newsId))
    return { success: true }
  } catch (error) {
    console.error('Error deleting news:', error)
    return { success: false, error: error.message }
  }
}

// ===== FUNCIÓN: Contar noticias por categoría =====
export const countNewsByCategory = async () => {
  try {
    const newsRef = collection(db, 'news')
    const snapshot = await getDocs(newsRef)
    
    const counts = {}
    snapshot.docs.forEach(doc => {
      const category = doc.data().category || 'General'
      counts[category] = (counts[category] || 0) + 1
    })
    
    return counts
  } catch (error) {
    console.error('Error counting news:', error)
    return {}
  }
}