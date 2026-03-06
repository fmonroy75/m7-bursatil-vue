// src/stores/newsHistory.js
import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
  limit,
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useNewsHistoryStore = defineStore('newsHistory', {
  state: () => ({
    viewedNews: [],
    loading: false,
    error: null
  }),

  getters: {
    // Obtener las últimas 10 noticias vistas por el usuario
    getRecentNews: (state) => {
      return state.viewedNews.slice(0, 10)
    },
    
    // Obtener todas las noticias vistas (para historial completo)
    getAllHistory: (state) => {
      return state.viewedNews
    },
    
    // Verificar si una noticia ya fue vista
    wasNewsViewed: (state) => (newsId) => {
      return state.viewedNews.some(item => item.newsId === newsId)
    },
    
    // Obtener la última vez que se vio una noticia
    getLastViewDate: (state) => (newsId) => {
      const view = state.viewedNews.find(item => item.newsId === newsId)
      return view ? view.viewedAt : null
    }
  },

  actions: {
    // Cargar historial del usuario actual
    async loadUserHistory() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) {
        //console.log('👤 Usuario no autenticado, no se carga historial')
        return
      }

      this.loading = true
      try {
        //console.log(`📚 Cargando historial para usuario: ${authStore.user.uid}`)
        
        const q = query(
          collection(db, 'newsHistory'),
          where('userId', '==', authStore.user.uid),
          orderBy('viewedAt', 'desc'),
          limit(50) // Últimas 50 noticias
        )
        
        const querySnapshot = await getDocs(q)
        this.viewedNews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          viewedAt: doc.data().viewedAt?.toDate?.() || doc.data().viewedAt
        }))
        
        //console.log(`✅ Historial cargado: ${this.viewedNews.length} noticias`)
      } catch (error) {
        console.error('Error cargando historial:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Registrar vista de noticia (solo para usuario autenticado)
    async trackNewsView(newsId, newsTitle, newsCategory) {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) {
        //console.log('👤 Usuario no autenticado, no se registra vista')
        return
      }

      try {
        //console.log(`👁️ Registrando vista para usuario ${authStore.user.uid}: ${newsTitle}`)
        
        // Verificar si ya existe una vista previa para esta noticia
        const existingQuery = query(
          collection(db, 'newsHistory'),
          where('userId', '==', authStore.user.uid),
          where('newsId', '==', newsId)
        )
        
        const existingSnapshot = await getDocs(existingQuery)
        
        // Si ya existe, actualizar la fecha en lugar de crear nuevo registro
        if (!existingSnapshot.empty) {
          const existingDoc = existingSnapshot.docs[0]
          const docRef = doc(db, 'newsHistory', existingDoc.id)
          
          // Usar writeBatch para actualizar
          const batch = writeBatch(db)
          batch.update(docRef, {
            viewedAt: Timestamp.now()
          })
          await batch.commit()
          
          // Actualizar estado local
          const index = this.viewedNews.findIndex(item => item.id === existingDoc.id)
          if (index !== -1) {
            this.viewedNews[index].viewedAt = new Date()
          } else {
            // Si no está en el estado local, recargar historial
            await this.loadUserHistory()
          }
          
          //console.log(`🔄 Vista actualizada para noticia existente: ${newsTitle}`)
          return
        }
        
        // Si no existe, crear nuevo registro
        const docRef = await addDoc(collection(db, 'newsHistory'), {
          userId: authStore.user.uid,
          newsId,
          newsTitle,
          newsCategory,
          viewedAt: Timestamp.now()
        })

        // Actualizar estado local
        const newView = {
          id: docRef.id,
          userId: authStore.user.uid,
          newsId,
          newsTitle,
          newsCategory,
          viewedAt: new Date()
        }
        
        this.viewedNews.unshift(newView)
        
        // Mantener solo últimas 50 en estado local
        if (this.viewedNews.length > 50) {
          this.viewedNews = this.viewedNews.slice(0, 50)
        }

        //console.log(`✅ Vista registrada correctamente para: ${newsTitle}`)
      } catch (error) {
        console.error('Error registrando vista:', error)
        this.error = error.message
      }
    },

    // Limpiar historial del usuario actual
    async clearUserHistory() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      this.loading = true
      try {
        //console.log(`🗑️ Limpiando historial para usuario: ${authStore.user.uid}`)
        
        const q = query(
          collection(db, 'newsHistory'),
          where('userId', '==', authStore.user.uid)
        )
        
        const querySnapshot = await getDocs(q)
        const batch = writeBatch(db)
        
        querySnapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
        
        await batch.commit()
        this.viewedNews = []
        
        //console.log('✅ Historial limpiado correctamente')
      } catch (error) {
        console.error('Error limpiando historial:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Eliminar una noticia específica del historial
    async removeFromHistory(historyId) {
      try {
        await deleteDoc(doc(db, 'newsHistory', historyId))
        
        // Actualizar estado local
        this.viewedNews = this.viewedNews.filter(item => item.id !== historyId)
        
        //console.log(`🗑️ Noticia eliminada del historial: ${historyId}`)
      } catch (error) {
        console.error('Error eliminando del historial:', error)
        this.error = error.message
      }
    },

    // Cargar historial cuando el usuario se autentica
    async onUserAuth() {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        await this.loadUserHistory()
      } else {
        this.viewedNews = []
      }
    }
  }
})