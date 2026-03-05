<!-- src/views/NewsPage.vue -->
<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-8">
        <h2 class="text-white mb-4"><i class="bi bi-newspaper"></i> Noticias del Mercado</h2>

        <!-- Category Filter -->
        <div class="category-filters mb-4">
          <h6 class="text-white-50 mb-2">Filtrar por categoría:</h6>
          <div class="btn-group flex-wrap" role="group">
            <button
              class="btn btn-outline-light mb-1"
              :class="{ active: selectedCategory === null }"
              @click="selectedCategory = null"
            >
              Todas ({{ allNews.length }})
            </button>
            <button
              v-for="cat in categories"
              :key="cat"
              class="btn btn-outline-light mb-1"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              {{ cat }} ({{ getCategoryCount(cat) }})
            </button>
          </div>
        </div>

        <!-- News List -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-light" style="width: 3rem; height: 3rem"></div>
          <p class="text-white-50 mt-3">Cargando noticias...</p>
        </div>

        <div v-else-if="filteredNews.length === 0" class="alert alert-info">
          No hay noticias disponibles en esta categoría.
        </div>

        <div v-else>
          <NewsCard 
            v-for="item in filteredNews" 
            :key="item.id" 
            :news="item" 
          />
        </div>
      </div>

      <div class="col-lg-4">
        <!-- Recently Viewed (desde Firebase) -->
        <div class="card bg-dark text-white mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0"><i class="bi bi-clock-history"></i> Vistos Recientemente</h5>
            <span v-if="authStore.isAuthenticated" class="badge bg-info">
              {{ recentViewsCount }}
            </span>
          </div>
          <div class="card-body">
            <div v-if="!authStore.isAuthenticated" class="text-white-50 text-center py-2">
              <i class="bi bi-person-lock"></i>
              <p class="small mt-1">Inicia sesión para ver tu historial</p>
              <router-link to="/login" class="btn btn-primary btn-sm">
                Iniciar Sesión
              </router-link>
            </div>
            
            <div v-else-if="newsHistoryStore.loading" class="text-center py-2">
              <div class="spinner-border spinner-border-sm text-light"></div>
              <p class="text-white-50 small mt-1">Cargando historial...</p>
            </div>
            
            <div v-else-if="recentViews.length === 0" class="text-white-50 text-center py-2">
              <i class="bi bi-bookmark"></i>
              <p class="small mt-1">No has visto noticias recientemente</p>
            </div>
            
            <ul v-else class="list-unstyled">
              <li v-for="item in recentViews" :key="item.id" class="mb-2">
                <router-link
                  :to="`/news/${item.newsId}`"
                  class="text-white-50 text-decoration-none d-block"
                >
                  <small class="d-block text-white-50">
                    <i class="bi bi-clock"></i> {{ formatRelativeTime(item.viewedAt) }}
                  </small>
                  <span class="text-white">{{ truncateTitle(item.newsTitle) }}</span>
                </router-link>
              </li>
            </ul>
            
            <div v-if="recentViews.length > 0" class="text-center mt-2">
              <router-link to="/news-history" class="btn btn-outline-light btn-sm">
                Ver historial completo
              </router-link>
            </div>
          </div>
        </div>

        <!-- Market Summary -->
        <div class="card bg-dark text-white">
          <div class="card-header">
            <h5 class="mb-0"><i class="bi bi-graph-up"></i> Resumen de Mercado</h5>
          </div>
          <div class="card-body">
            <div v-if="marketLoading" class="text-white-50 text-center py-2">
              <div class="spinner-border spinner-border-sm me-2"></div>
              Cargando datos...
            </div>
            <div v-else-if="marketError" class="text-danger small text-center py-2">
              {{ marketError }}
            </div>
            <div v-else-if="marketData.length === 0" class="text-white-50 text-center py-2">
              Datos no disponibles
            </div>
            <ul v-else class="list-group list-group-flush bg-transparent">
              <li
                v-for="item in marketData"
                :key="item.simbolo"
                class="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center"
              >
                <span>{{ item.simbolo }}</span>
                <div class="text-end">
                  <div>${{ formatPrice(item.precio) }}</div>
                  <small :class="item.variacion >= 0 ? 'text-success' : 'text-danger'">
                    {{ item.variacion >= 0 ? '+' : '' }}{{ item.variacion.toFixed(2) }}%
                  </small>
                </div>
              </li>
            </ul>
            <small class="text-white-50 d-block text-center mt-2">
              Fuente: Alpha Vantage | Próxima actualización en {{ nextUpdateMinutes }} min
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNewsHistoryStore } from '@/stores/newsHistory'
import { fetchNews, getNewsByCategory } from '@/services/newsApi'
import { fetchMarketData } from '@/services/alphaVantageApi'
import NewsCard from '@/components/NewsCard.vue'
import { NEWS_CATEGORIES } from '@/config/constants'

// Stores
const authStore = useAuthStore()
const newsHistoryStore = useNewsHistoryStore()

// Estado
const loading = ref(true)
const allNews = ref([])
const marketData = ref([])
const marketLoading = ref(false)
const marketError = ref('')
const selectedCategory = ref(null)
const lastMarketUpdate = ref(null)

// Categorías
const categories = NEWS_CATEGORIES

// Noticias filtradas por categoría
const filteredNews = computed(() => {
  if (!selectedCategory.value) return allNews.value
  return allNews.value.filter((item) => item.category === selectedCategory.value)
})

// Vistas recientes (últimas 5 desde Firebase)
const recentViews = computed(() => {
  return newsHistoryStore.getRecentNews.slice(0, 5)
})

const recentViewsCount = computed(() => {
  return newsHistoryStore.viewedNews.length
})

// Contar noticias por categoría
const getCategoryCount = (category) => {
  return allNews.value.filter(item => item.category === category).length
}

// Formatear tiempo relativo
const formatRelativeTime = (date) => {
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
    return d.toLocaleDateString('es-CL')
  }
}

// Truncar título largo
const truncateTitle = (title) => {
  if (!title) return ''
  return title.length > 40 ? title.substring(0, 40) + '...' : title
}

// Formatear precio
const formatPrice = (price) => {
  if (!price && price !== 0) return '0.00'
  if (price > 1000) {
    return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return price.toFixed(2)
}

// Tiempo hasta próxima actualización de mercado
const nextUpdateMinutes = computed(() => {
  if (!lastMarketUpdate.value) return 5
  const nextUpdate = new Date(lastMarketUpdate.value.getTime() + 60 * 60 * 1000)
  const diff = nextUpdate - new Date()
  return Math.max(0, Math.ceil(diff / 60000))
})

// Cargar noticias
const loadNews = async () => {
  loading.value = true
  try {
    const newsData = await fetchNews()
    allNews.value = newsData
    console.log('✅ Noticias cargadas:', newsData.length)
  } catch (error) {
    console.error('❌ Error cargando noticias:', error)
  } finally {
    loading.value = false
  }
}

// Cargar datos de mercado
const loadMarketData = async (forceRefresh = false) => {
  // No cargar si ya hay datos recientes (menos de 1 hora)
  if (!forceRefresh && lastMarketUpdate.value) {
    const timeSinceUpdate = new Date() - lastMarketUpdate.value
    if (timeSinceUpdate < 60 * 60 * 1000) {
      console.log('📊 Usando datos de mercado existentes')
      return
    }
  }

  marketLoading.value = true
  marketError.value = ''
  
  try {
    const data = await fetchMarketData()
    marketData.value = data
    lastMarketUpdate.value = new Date()
    console.log('📈 Datos de mercado actualizados:', data.length, 'activos')
  } catch (error) {
    console.error('Error loading market data:', error)
    marketError.value = 'Error cargando datos de mercado'
  } finally {
    marketLoading.value = false
  }
}

// Cargar historial cuando el usuario se autentica
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await newsHistoryStore.loadUserHistory()
    }
  },
  { immediate: true }
)

// Inicialización
onMounted(() => {
  loadNews()
  loadMarketData()
  
  // Actualizar datos de mercado cada hora
  const marketInterval = setInterval(() => loadMarketData(), 60 * 60 * 1000)
  
  onUnmounted(() => {
    clearInterval(marketInterval)
  })
})
</script>

<style scoped>
.category-filters .btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.btn-group .btn {
  border-radius: 20px !important;
  margin: 2px;
}

.btn-outline-light {
  border-color: #404040;
  color: #fff;
  background: transparent;
  transition: all 0.3s;
}

.btn-outline-light:hover {
  background-color: #404040;
  border-color: #404040;
}

.btn-outline-light.active {
  background-color: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
  color: white !important;
}

.list-group-item {
  background: transparent;
  border-color: #404040;
  transition: background 0.3s;
}

.list-group-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1e2b38;
}

::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>