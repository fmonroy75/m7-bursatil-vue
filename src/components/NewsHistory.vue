<!-- src/components/NewsHistory.vue -->
<template>
    <div class="card bg-dark text-white mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="bi bi-clock-history"></i>
          {{ title }}
        </h5>
        <span class="badge bg-info">{{ uniqueHistory.length }} noticias</span>
      </div>
      
      <div class="card-body">
        <div v-if="!authStore.isAuthenticated" class="text-center text-white-50 py-3">
          <i class="bi bi-person-lock fs-1"></i>
          <p class="mt-2">Inicia sesión para ver tu historial personal</p>
          <router-link to="/login" class="btn btn-primary btn-sm">
            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
          </router-link>
        </div>
  
        <div v-else-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-light"></div>
          <p class="text-white-50 mt-2">Cargando tu historial...</p>
        </div>
  
        <div v-else-if="uniqueHistory.length === 0" class="text-center text-white-50 py-3">
          <i class="bi bi-bookmark fs-1"></i>
          <p class="mt-2">No has visto ninguna noticia aún</p>
          <router-link to="/news" class="btn btn-primary btn-sm">
            <i class="bi bi-newspaper"></i> Ver Noticias
          </router-link>
        </div>
  
        <ul v-else class="list-unstyled">
          <li
            v-for="item in uniqueHistory"
            :key="item.id"
            class="mb-3 pb-2 border-bottom border-secondary"
          >
            <div class="d-flex justify-content-between align-items-start">
              <router-link :to="`/news/${item.newsId}`" class="text-decoration-none flex-grow-1">
                <small class="text-white-50 d-block mb-1">
                  <i class="bi bi-clock"></i> {{ formatDate(item.viewedAt) }}
                </small>
                <span class="text-white">{{ item.newsTitle }}</span>
                <div class="mt-1">
                  <span class="badge" :class="getCategoryBadge(item.newsCategory)">
                    {{ item.newsCategory }}
                  </span>
                </div>
              </router-link>
              
              <!-- Botón para eliminar del historial (opcional) -->
              <button 
                v-if="showRemoveButton"
                class="btn btn-sm btn-outline-danger ms-2"
                @click="removeFromHistory(item.id)"
                title="Eliminar del historial"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </li>
        </ul>
        
        <!-- Ver historial completo -->
        <div v-if="uniqueHistory.length > 0 && showViewAll" class="text-center mt-3">
          <router-link to="/news-history" class="btn btn-outline-light btn-sm">
            Ver historial completo
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useNewsHistoryStore } from '@/stores/newsHistory'
  
  const props = defineProps({
    title: {
      type: String,
      default: 'Historial de Noticias',
    },
    limit: {
      type: Number,
      default: 5 // Mostrar últimas 5 por defecto
    },
    showViewAll: {
      type: Boolean,
      default: true
    },
    showRemoveButton: {
      type: Boolean,
      default: false
    }
  })
  
  const authStore = useAuthStore()
  const newsHistoryStore = useNewsHistoryStore()
  
  // Eliminar duplicados por newsId (mostrar la vista más reciente)
  const uniqueHistory = computed(() => {
    const items = newsHistoryStore.viewedNews || []
    const unique = {}
    
    // Ordenar por fecha descendente
    const sorted = [...items].sort((a, b) => 
      new Date(b.viewedAt) - new Date(a.viewedAt)
    )
    
    // Tomar solo la vista más reciente por noticia
    sorted.forEach((item) => {
      if (!unique[item.newsId]) {
        unique[item.newsId] = item
      }
    })
    
    // Devolver limitadas por el prop
    return Object.values(unique).slice(0, props.limit)
  })
  
  const loading = computed(() => newsHistoryStore.loading)
  
  const formatDate = (date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
  
    if (minutes < 60) {
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
    } else if (hours < 24) {
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
    } else if (days < 7) {
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`
    } else {
      return d.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
  
  const getCategoryBadge = (category) => {
    const badges = {
      Mercados: 'bg-success',
      Tecnología: 'bg-primary',
      Economía: 'bg-warning text-dark',
      Política: 'bg-danger',
      Empresas: 'bg-info text-dark',
      Ciencia: 'bg-secondary',
      Salud: 'bg-success',
      Entretenimiento: 'bg-purple',
      Deportes: 'bg-orange',
      General: 'bg-secondary',
    }
    return badges[category] || 'bg-secondary'
  }
  
  const removeFromHistory = async (historyId) => {
    if (confirm('¿Eliminar esta noticia de tu historial?')) {
      await newsHistoryStore.removeFromHistory(historyId)
    }
  }
  
  // Cargar historial cuando el componente se monta y el usuario está autenticado
  onMounted(() => {
    if (authStore.isAuthenticated && newsHistoryStore.viewedNews.length === 0) {
      newsHistoryStore.loadUserHistory()
    }
  })
  </script>