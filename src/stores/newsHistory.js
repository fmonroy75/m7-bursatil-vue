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
  limit
} from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useNewsHistoryStore = defineStore('newsHistory', {
  state: () => ({
    viewedNews: [],
    loading: false,
    error: null
  }),

  getters: {
    getRecentNews: (state) => {
      return state.viewedNews.slice(0, 10) // Últimas 10 noticias
    },
    
    getViewsCount: (state) => (newsId) => {
      return state.viewedNews.filter(item => item.newsId === newsId).length
    }
  },

  actions: {
    async loadUserHistory() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      this.loading = true
      try {
        const q = query(
          collection(db, 'newsHistory'),
          where('userId', '==', authStore.user.uid),
          orderBy('viewedAt', 'desc'),
          limit(50)
        )
        
        const querySnapshot = await getDocs(q)
        this.viewedNews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          viewedAt: doc.data().viewedAt?.toDate?.() || doc.data().viewedAt
        }))
        
        console.log(`📚 Historial cargado: ${this.viewedNews.length} noticias`)
      } catch (error) {
        console.error('Error cargando historial:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async trackNewsView(newsId, newsTitle, newsCategory) {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      try {
        // Verificar si ya existe una vista reciente (última hora)
        const oneHourAgo = new Date()
        oneHourAgo.setHours(oneHourAgo.getHours() - 1)

        const q = query(
          collection(db, 'newsHistory'),
          where('userId', '==', authStore.user.uid),
          where('newsId', '==', newsId),
          where('viewedAt', '>=', oneHourAgo)
        )

        const existing = await getDocs(q)
        
        if (existing.empty) {
          // Solo registrar si no hay vista en la última hora
          const docRef = await addDoc(collection(db, 'newsHistory'), {
            userId: authStore.user.uid,
            newsId,
            newsTitle,
            newsCategory,
            viewedAt: Timestamp.now()
          })

          // Actualizar estado local
          this.viewedNews.unshift({
            id: docRef.id,
            newsId,
            newsTitle,
            newsCategory,
            viewedAt: new Date()
          })

          console.log(`👁️ Vista registrada: ${newsTitle}`)
        } else {
          console.log(`⏭️ Vista reciente ya existe para: ${newsTitle}`)
        }
      } catch (error) {
        console.error('Error registrando vista:', error)
      }
    },

    async clearHistory() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      this.loading = true
      try {
        const q = query(
          collection(db, 'newsHistory'),
          where('userId', '==', authStore.user.uid)
        )
        
        const querySnapshot = await getDocs(q)
        const deletePromises = querySnapshot.docs.map(doc => 
          doc.ref.delete()
        )
        
        await Promise.all(deletePromises)
        this.viewedNews = []
        
        console.log('🗑️ Historial limpiado')
      } catch (error) {
        console.error('Error limpiando historial:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})