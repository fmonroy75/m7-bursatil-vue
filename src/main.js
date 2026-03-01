/*import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'

createApp(App).use(router).mount('#app')
*/
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Importar Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/style.css'

// Importar DOMPurify para sanitización
import DOMPurify from 'dompurify'

// Importar la configuración de Firebase
import './services/firebase'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Crear una directiva personalizada para sanitizar
app.directive('sanitize', {
  mounted(el, binding) {
    if (binding.value) {
      el.innerHTML = DOMPurify.sanitize(binding.value)
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.innerHTML = DOMPurify.sanitize(binding.value)
    }
  },
})

// Método global para sanitizar
app.config.globalProperties.$sanitize = (text) => {
  return DOMPurify.sanitize(text)
}

// Inicializar el listener de autenticación
const authStore = useAuthStore(pinia)
authStore.initAuthListener()

app.mount('#app')
