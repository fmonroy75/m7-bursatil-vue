<!-- views/CreateProfile.vue -->
<template>
    <div class="profile-container">
      <div class="profile-card">
        <div class="header">
          <h1>👤 Completa tu perfil</h1>
          <p class="subtitle">Antes de continuar, necesitamos algunos datos adicionales</p>
        </div>
  
        <form @submit.prevent="handleCreateProfile" class="profile-form">
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
              placeholder="ej: inversor2024"
              required
              minlength="3"
              maxlength="20"
            >
            <small class="hint">Mínimo 3 caracteres, solo letras, números, . _ y -</small>
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
              minlength="3"
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
              :disabled="loading || !isFormValid"
              :class="{ 'loading': loading }"
            >
              <span v-if="!loading">✅ Crear perfil</span>
              <span v-else>Creando perfil...</span>
            </button>
            
            <button 
              type="button" 
              @click="handleLogout" 
              class="logout-btn"
              :disabled="loading"
            >
              🔓 Cerrar sesión
            </button>
          </div>
  
          <transition name="fade">
            <div v-if="message" :class="['message', messageType]">
              {{ message }}
            </div>
          </transition>
        </form>
  
        <div class="info-box">
          <p>📌 Estos datos serán visibles para otros usuarios en la plataforma.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const loading = ref(false)
  const message = ref('')
  const messageType = ref('')
  
  const formData = ref({
    username: '',
    displayName: ''
  })
  
  // Validar formulario
  const isFormValid = computed(() => {
    return formData.value.username.length >= 3 && 
           formData.value.displayName.length >= 3
  })
  
  const handleCreateProfile = async () => {
    loading.value = true
    message.value = ''
    
    const result = await authStore.createUserProfile(formData.value)
    
    if (result.success) {
      message.value = '✅ Perfil creado correctamente'
      messageType.value = 'success'
      
      // Redirigir al dashboard después de 1 segundo
      setTimeout(() => {
        router.push({ name: 'dashboard' })
      }, 1000)
    } else {
      message.value = '❌ Error: ' + result.error
      messageType.value = 'error'
    }
    
    loading.value = false
  }
  
  const handleLogout = async () => {
    await authStore.logout()
    router.push({ name: 'login' })
  }
  </script>
  
  <style scoped>
  .profile-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }
  
  .profile-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
  
  .header {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .header h1 {
    font-size: 2rem;
    color: #1e2b38;
    margin-bottom: 10px;
  }
  
  .subtitle {
    color: #718096;
    font-size: 1rem;
  }
  
  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group label {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.95rem;
  }
  
  .label-icon {
    margin-right: 8px;
  }
  
  .form-group input {
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #4299e1;
  }
  
  .form-group input:disabled {
    background: #f7fafc;
    cursor: not-allowed;
  }
  
  .disabled-input {
    background: #f7fafc;
    border-color: #e2e8f0;
    color: #718096;
  }
  
  .hint {
    font-size: 0.8rem;
    color: #a0aec0;
  }
  
  .form-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
  
  button {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  button[type="submit"] {
    background: #48bb78;
    color: white;
  }
  
  button[type="submit"]:hover:not(:disabled) {
    background: #38a169;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(72, 187, 120, 0.3);
  }
  
  button[type="submit"]:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
  
  .logout-btn {
    background: #f56565;
    color: white;
  }
  
  .logout-btn:hover:not(:disabled) {
    background: #e53e3e;
    transform: translateY(-2px);
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
  
  .info-box {
    margin-top: 30px;
    padding: 15px;
    background: #ebf8ff;
    border-radius: 8px;
    border-left: 4px solid #4299e1;
  }
  
  .info-box p {
    color: #2c5282;
    font-size: 0.9rem;
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