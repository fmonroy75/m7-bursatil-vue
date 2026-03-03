<!-- components/SidebarMenu.vue -->
<template>
  <aside class="sidebar">
    <div class="logo">📈 Simulador Bursatil</div>
    
    <!-- Mostrar información del usuario si está logueado -->
    <div v-if="authStore.isAuthenticated" class="user-info">
      <span class="user-email">{{ displayEmail }}</span>
      <span v-if="authStore.username" class="user-name">
        @{{ authStore.username }}
      </span>
    </div>

    <nav>
      <ul>
        <!-- Opciones para usuarios no autenticados -->
        <template v-if="!authStore.isAuthenticated">
          <li>
            <router-link :to="{ name: 'login' }">
              🔑 Login
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'register' }">
              📝 Registrarse
            </router-link>
          </li>
        </template>

        <!-- Opciones para usuarios autenticados -->
        <template v-else>
          <li>
            <router-link :to="authStore.hasProfile ? { name: 'profile' } : { name: 'createProfile' }" >
              👤 Mi Perfil
            </router-link>
          </li>
          <li>
            <a href="#" @click.prevent="handleLogout" >
              🔓 Cerrar Sesión
            </a>
          </li>
          <li>
  <router-link to="/trading" class="nav-link">
    <span class="icon">💹</span>
    Trading
  </router-link>
</li>
        </template>

        <!-- Opciones comunes para todos -->
        <li>
          <router-link to="/">📊 Dashboard</router-link>
        </li>
        <li>
          <router-link to="/trends">📈 Tendencias</router-link>
        </li>
        <li>
          <router-link to="/history">📜 Historial</router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Mostrar email desde sessionStorage o del store
const displayEmail = computed(() => {
  return sessionStorage.getItem('userEmail') || authStore.userEmail
})

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push({ name: 'dashboard' })
  }
}
</script>
