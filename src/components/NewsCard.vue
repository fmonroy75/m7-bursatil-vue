<!-- src/components/NewsCard.vue -->
<template>
    <div class="card bg-dark text-white mb-4 news-card">
      <div class="row g-0">
        <div class="col-md-4">
          <img
            :src="news.imageUrl || 'https://via.placeholder.com/300x200'"
            class="img-fluid rounded-start h-100"
            :alt="news.title"
            style="object-fit: cover;"
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
  const props = defineProps({
    news: {
      type: Object,
      required: true
    }
  })
  
  const formatDate = (date) => {
    if (!date) return 'Fecha desconocida'
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const getCategoryBadge = (category) => {
    const badges = {
      Mercados: 'bg-success',
      Tecnología: 'bg-primary',
      Economía: 'bg-warning text-dark',
      Política: 'bg-danger',
      Empresas: 'bg-info text-dark',
      General: 'bg-secondary'
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
  </style>