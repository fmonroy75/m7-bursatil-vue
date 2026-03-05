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
import { useTradingStore } from '@/stores/trading'

const authStore = useAuthStore()
const newsHistoryStore = useNewsHistoryStore()
const tradingStore = useTradingStore()

// Cargar todos los datos del usuario al autenticarse
watch(
  () => authStore.user,
  async (user) => {
    if (user) {
      // Cargar historial de noticias
      await newsHistoryStore.loadUserHistory()
      
      // Cargar datos de trading (balance y transacciones)
      if (authStore.hasProfile) {
        await tradingStore.cargarDatosUsuario()
      }
    } else {
      // Limpiar datos al hacer logout
      newsHistoryStore.viewedNews = []
      tradingStore.limpiarDatos()
    }
  },
  { immediate: true }
)
</script>