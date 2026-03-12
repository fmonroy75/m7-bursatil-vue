<!-- src/components/NewsCard.vue -->
<template>
  <div class="card bg-dark text-white mb-4 news-card">
    <div class="row g-0">
      <div class="col-md-4">
        <img
          :src="imageSrc"
          class="img-fluid rounded-start h-100"
          :alt="news.title"
          style="object-fit: cover;"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge" :class="getCategoryBadge(news.category)">
              {{ news.category }}
            </span>
            <small class="text-white-50">
              <i class="bi bi-eye"></i> {{ news.views || 0 }}
            </small>
          </div>
          
          <h5 class="card-title">
            <router-link :to="`/news/${news.id}`" class="text-white text-decoration-none">
              {{ news.title }}
            </router-link>
          </h5>
          
          <p class="card-text text-white-50">{{ news.summary }}</p>
          
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-white-50">
              <i class="bi bi-clock"></i> {{ formatDate(news.publishedAt) }}
            </small>
            <small class="text-white-50">
              <i class="bi bi-person-circle"></i> {{ news.author || 'Anónimo' }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  news: {
    type: Object,
    required: true
  }
})

// Proxy de imágenes (evita tracking prevention)
const IMAGE_PROXY = 'https://images.weserv.nl/?url='

// Placeholder SVG local
const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%232d3748\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%239ca3af\' font-size=\'24\' font-family=\'Arial\'%3ESin imagen%3C/text%3E%3C/svg%3E'

const imageError = ref(false)

// URL con proxy
const imageSrc = computed(() => {
  if (imageError.value || !props.news.imageUrl) {
    return placeholderImage
  }
  const encodedUrl = encodeURIComponent(props.news.imageUrl)
  return `${IMAGE_PROXY}${encodedUrl}&w=400&h=300&fit=cover`
})

const handleImageError = () => {
  imageError.value = true
  console.log('🖼️ Imagen falló, usando placeholder')
}

const formatDate = (date) => {
  if (!date) return 'Fecha desconocida'
  try {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return 'Fecha inválida'
  }
}

const getCategoryBadge = (category) => {
  const badges = {
    Mercados: 'bg-success',
    Tecnología: 'bg-primary',
    Economía: 'bg-warning text-dark',
    Política: 'bg-danger',
    Empresas: 'bg-info text-dark',
    General: 'bg-secondary',
    Ciencia: 'bg-info',
    Salud: 'bg-success',
    Entretenimiento: 'bg-purple',
    Deportes: 'bg-orange',
    Internacional: 'bg-secondary'
  }
  return badges[category] || 'bg-secondary'
}
</script>

<style scoped>
.news-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #404040;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  border-color: var(--bs-primary);
}

.card-body {
  padding: 1.5rem;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

img {
  min-height: 200px;
  background-color: #2d3748;
}
</style>