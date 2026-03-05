<!-- src/views/NewsDetail.vue -->
<template>
  <div class="container" v-if="news">
    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="card bg-dark text-white">
          <img
            :src="news.imageUrl || 'https://via.placeholder.com/1200x400'"
            class="card-img-top"
            :alt="news.title"
          />

          <div class="card-body">
            <!-- Mostrar indicador de noticia ya vista -->
            <div v-if="authStore.isAuthenticated && wasViewed" class="alert alert-info mb-3">
              <i class="bi bi-check-circle"></i> 
              Ya habías visto esta noticia antes ({{ formatLastView }})
            </div>

            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge" :class="getCategoryBadge(news.category)">{{
                news.category
              }}</span>
              <small class="text-white-50">{{ formatDate(news.publishedAt) }}</small>
            </div>

            <h2 class="card-title mb-4">{{ news.title }}</h2>

            <div class="mb-4">
              <p class="lead">{{ news.summary }}</p>
            </div>

            <div class="content mb-4" v-html="sanitizeContent(news.content)"></div>

            <div class="border-top border-secondary pt-3 mb-4">
              <p class="text-white-50">
                <i class="bi bi-person-circle"></i> Por {{ news.author || 'Autor Desconocido' }}
              </p>
              <p class="text-white-50">
                <i class="bi bi-eye"></i> {{ news.views || 0 }} visualizaciones totales
              </p>
            </div>

            <!-- Comments Section -->
            <div class="border-top border-secondary pt-4">
              <h5 class="mb-3">
                <i class="bi bi-chat-dots"></i> Comentarios ({{ comments.length }})
              </h5>

              <!-- Comment Form (only if logged in) -->
              <div v-if="authStore.isAuthenticated" class="mb-4">
                <form @submit.prevent="submitComment">
                  <div class="mb-3">
                    <label class="form-label text-white-50">Agregar Comentario</label>
                    <textarea
                      class="form-control bg-dark text-white border-secondary"
                      rows="3"
                      v-model="newComment"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary" :disabled="submitting">
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                    Publicar Comentario
                  </button>
                </form>
              </div>
              <div v-else class="alert alert-info">
                <router-link to="/login">Inicia sesión</router-link> para comentar.
              </div>

              <!-- Comments List -->
              <div v-if="comments.length === 0" class="text-white-50 text-center py-3">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </div>

              <div v-else class="list-group list-group-flush">
                <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="list-group-item bg-transparent text-white border-secondary"
                >
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <strong>{{ comment.author }}</strong>
                    <small class="text-white-50">{{ formatDate(comment.createdAt) }}</small>
                  </div>
                  <p class="mb-1">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <div class="spinner-border text-light"></div>
    <p class="text-white-50 mt-3">Cargando noticia...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNewsHistoryStore } from '@/stores/newsHistory'
import { fetchNewsById, fetchComments, addComment } from '@/services/newsApi'
import { sanitizeInput } from '@/utils/sanitize'
import DOMPurify from 'dompurify'

const route = useRoute()
const authStore = useAuthStore()
const newsHistoryStore = useNewsHistoryStore()

const news = ref(null)
const comments = ref([])
const newComment = ref('')
const submitting = ref(false)

// Verificar si la noticia ya fue vista por este usuario
const wasViewed = computed(() => {
  return newsHistoryStore.wasNewsViewed(route.params.id)
})

// Formatear última vista
const formatLastView = computed(() => {
  const lastView = newsHistoryStore.getLastViewDate(route.params.id)
  if (lastView) {
    return formatDate(lastView)
  }
  return ''
})

const loadNews = async () => {
  const data = await fetchNewsById(route.params.id)
  if (data) {
    news.value = data

    // Registrar vista SOLO si el usuario está autenticado
    if (authStore.isAuthenticated) {
      await newsHistoryStore.trackNewsView(data.id, data.title, data.category)
    }

    // Load comments
    loadComments()
  }
}

const loadComments = async () => {
  comments.value = await fetchComments(route.params.id)
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  submitting.value = true

  const result = await addComment(route.params.id, {
    author: authStore.userEmail,
    content: sanitizeInput(newComment.value),
    userId: authStore.user.uid,
  })

  if (result.success) {
    newComment.value = ''
    loadComments()
  }

  submitting.value = false
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

const sanitizeContent = (content) => {
  return DOMPurify.sanitize(content)
}

// Cargar historial cuando el usuario se autentica
onMounted(() => {
  loadNews()
  
  // Si el usuario está autenticado, aseguramos que el historial esté cargado
  if (authStore.isAuthenticated && newsHistoryStore.viewedNews.length === 0) {
    newsHistoryStore.loadUserHistory()
  }
})
</script>