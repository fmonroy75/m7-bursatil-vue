<!-- views/ProfileView.vue -->
<template>
    <div class="profile-container">
      <div class="profile-header">
        <h2>👤 Mi Perfil</h2>
        <p class="subtitle">Gestiona tu información personal</p>
      </div>
      
      <form @submit.prevent="handleUpdateProfile" class="profile-form">
        <div class="form-group">
          <label for="username">
            <span class="label-icon">🏷️</span>
            Nombre de usuario:
          </label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username"
            :disabled="loading"
            placeholder="ej: juan_perez"
            required
          >
          <small class="hint">Este será tu nombre público en la plataforma</small>
        </div>
  
        <div class="form-group">
          <label for="displayName">
            <span class="label-icon">👤</span>
            Nombre real:
          </label>
          <input 
            type="text" 
            id="displayName" 
            v-model="formData.displayName"
            :disabled="loading"
            placeholder="ej: Juan Pérez"
            required
          >
        </div>
  
        <div class="form-group">
          <label>
            <span class="label-icon">📧</span>
            Email:
          </label>
          <input 
            type="email" 
            :value="authStore.user?.email" 
            disabled
            class="disabled-input"
          >
          <small class="hint">El email no puede ser modificado</small>
        </div>
  
        <div class="form-actions">
          <button 
            type="submit" 
            :disabled="loading || !hasChanges"
            :class="{ 'loading': loading }"
          >
            <span v-if="!loading">💾 Guardar cambios</span>
            <span v-else>Guardando...</span>
          </button>
          
          <button 
            type="button" 
            @click="cancelChanges" 
            class="cancel-btn"
            :disabled="loading"
            v-if="hasChanges"
          >
            Cancelar
          </button>
        </div>
  
        <transition name="fade">
          <div v-if="message" :class="['message', messageType]">
            {{ message }}
          </div>
        </transition>
      </form>
  
      <!-- Información adicional -->
      <div class="profile-info">
        <h3>Información de la cuenta</h3>
        <p><strong>Miembro desde:</strong> {{ formatDate(authStore.userProfile?.createdAt) }}</p>
        <p><strong>Última actualización:</strong> {{ formatDate(authStore.userProfile?.updatedAt) || 'Nunca' }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const loading = ref(false)
  const message = ref('')
  const messageType = ref('')
  const originalData = ref({})
  
  const formData = ref({
    username: '',
    displayName: ''
  })
  
  // Detectar si hay cambios sin guardar
  const hasChanges = computed(() => {
    return formData.value.username !== originalData.value.username ||
           formData.value.displayName !== originalData.value.displayName
  })
  
  // Cargar datos del perfil
  onMounted(() => {
    if (!authStore.isAuthenticated) {
      router.push({ name: 'login' })
      return
    }
  
    if (authStore.userProfile) {
      formData.value = {
        username: authStore.userProfile.username || '',
        displayName: authStore.userProfile.displayName || ''
      }
      // Guardar copia original para detectar cambios
      originalData.value = { ...formData.value }
    }
  })
  
  // Observar cambios en el perfil
  watch(() => authStore.userProfile, (newProfile) => {
    if (newProfile) {
      formData.value = {
        username: newProfile.username || '',
        displayName: newProfile.displayName || ''
      }
      originalData.value = { ...formData.value }
    }
  }, { deep: true })
  
  const handleUpdateProfile = async () => {
    loading.value = true
    message.value = ''
    
    const result = await authStore.updateUserProfile(formData.value)
    
    if (result.success) {
      message.value = '✅ Perfil actualizado correctamente'
      messageType.value = 'success'
      // Actualizar datos originales
      originalData.value = { ...formData.value }
    } else {
      message.value = '❌ Error: ' + result.error
      messageType.value = 'error'
    }
    
    loading.value = false
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      message.value = ''
    }, 3000)
  }
  
  const cancelChanges = () => {
    formData.value = { ...originalData.value }
    message.value = 'Cambios descartados'
    messageType.value = 'info'
    
    setTimeout(() => {
      message.value = ''
    }, 2000)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .profile-header {
    margin-bottom: 30px;
  }
  
  .profile-header h2 {
    color: #2c3e50;
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .subtitle {
    color: #7f8c8d;
    font-size: 1rem;
  }
  
  .profile-form {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .form-group {
    margin-bottom: 25px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #34495e;
    font-size: 0.95rem;
  }
  
  .label-icon {
    margin-right: 8px;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }
  
  input:focus {
    outline: none;
    border-color: #3498db;
  }
  
  input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
  
  .disabled-input {
    background: #f8f9fa;
    border-color: #dee2e6;
    color: #6c757d;
  }
  
  .hint {
    display: block;
    margin-top: 5px;
    font-size: 0.85rem;
    color: #95a5a6;
  }
  
  .form-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
  }
  
  button {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  button[type="submit"] {
    background: #3498db;
    color: white;
  }
  
  button[type="submit"]:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }
  
  button[type="submit"]:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .cancel-btn {
    background: #ecf0f1;
    color: #7f8c8d;
  }
  
  .cancel-btn:hover:not(:disabled) {
    background: #e0e6e8;
  }
  
  .loading {
    position: relative;
    pointer-events: none;
  }
  
  .message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
  }
  
  .success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  .error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  .info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
  
  .profile-info {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
  }
  
  .profile-info h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.2rem;
  }
  
  .profile-info p {
    color: #34495e;
    margin-bottom: 8px;
    font-size: 0.95rem;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>