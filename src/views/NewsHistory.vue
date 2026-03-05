<!-- views/NewsHistory.vue -->
<template>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="text-white">
              <i class="bi bi-clock-history"></i> Historial de Noticias
            </h2>
            
            <button 
              v-if="authStore.isAuthenticated && newsHistoryStore.viewedNews.length"
              class="btn btn-outline-danger btn-sm"
              @click="clearHistory"
              :disabled="clearing"
            >
              <span v-if="clearing" class="spinner-border spinner-border-sm me-2"></span>
              Limpiar Historial
            </button>
          </div>
  
          <NewsHistory 
            title="Todas las noticias vistas"
            :showLimit="false"
          />
  
          <div class="text-center mt-4">
            <router-link to="/news" class="btn btn-primary">
              <i class="bi bi-newspaper"></i> Ver Noticias Recientes
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useNewsHistoryStore } from '@/stores/newsHistory'
  import NewsHistory from '@/components/NewsHistory.vue'
  
  const authStore = useAuthStore()
  const newsHistoryStore = useNewsHistoryStore()
  const clearing = ref(false)
  
  const clearHistory = async () => {
    clearing.value = true
    await newsHistoryStore.clearHistory()
    clearing.value = false
  }
  </script>