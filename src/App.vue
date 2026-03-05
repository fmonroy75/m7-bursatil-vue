<template>
  <div class="app-wrapper">
    <Sidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'

import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNewsHistoryStore } from '@/stores/newsHistory'

const authStore = useAuthStore()
const newsHistoryStore = useNewsHistoryStore()

// Cargar historial cuando el usuario se autentica
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      newsHistoryStore.loadUserHistory()
    } else {
      newsHistoryStore.viewedNews = []
    }
  },
  { immediate: true }
)
</script>