<!-- src/views/NewsHistoryPage.vue -->
<template>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-white">
              <i class="bi bi-clock-history"></i> Mi Historial de Noticias
            </h2>
            
            <button 
              v-if="authStore.isAuthenticated && newsHistoryStore.viewedNews.length"
              class="btn btn-outline-danger"
              @click="clearHistory"
              :disabled="clearing"
            >
              <span v-if="clearing" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-trash"></i> Limpiar Historial
            </button>
          </div>
  
          <!-- Estadísticas -->
          <div v-if="authStore.isAuthenticated && newsHistoryStore.viewedNews.length" class="row mb-4">
            <div class="col-md-4">
              <div class="card bg-dark text-white">
                <div class="card-body text-center">
                  <h3 class="h1">{{ totalViews }}</h3>
                  <p class="text-white-50 mb-0">Noticias vistas</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-dark text-white">
                <div class="card-body text-center">
                  <h3 class="h1">{{ uniqueCategories }}</h3>
                  <p class="text-white-50 mb-0">Categorías</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-dark text-white">
                <div class="card-body text-center">
                  <h3 class="h1">{{ lastWeekViews }}</h3>
                  <p class="text-white-50 mb-0">Última semana</p>
                </div>
              </div>
            </div>
          </div>
  
          <NewsHistory 
            title="Todo mi historial"
            :limit="100"
            :showViewAll="false"
            :showRemoveButton="true"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useNewsHistoryStore } from '@/stores/newsHistory'
  import NewsHistory from '@/components/NewsHistory.vue'
  
  const authStore = useAuthStore()
  const newsHistoryStore = useNewsHistoryStore()
  const clearing = ref(false)
  
  // Estadísticas
  const totalViews = computed(() => newsHistoryStore.viewedNews.length)
  
  const uniqueCategories = computed(() => {
    const categories = new Set(newsHistoryStore.viewedNews.map(item => item.newsCategory))
    return categories.size
  })
  
  const lastWeekViews = computed(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return newsHistoryStore.viewedNews.filter(item => 
      new Date(item.viewedAt) > oneWeekAgo
    ).length
  })
  
  const clearHistory = async () => {
    if (confirm('¿Estás seguro de limpiar todo tu historial?')) {
      clearing.value = true
      await newsHistoryStore.clearUserHistory()
      clearing.value = false
    }
  }
  </script>