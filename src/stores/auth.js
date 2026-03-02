// src/stores/auth.js
/*import { defineStore } from 'pinia'
import { auth, db } from '@/services/firebase' // Asegúrate de importar db también
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore'

// Nuestro helper de sanitización
import { sanitizeInput } from '@/utils/sanitize'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null, // Nuevo: para almacenar el perfil de Firestore
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email || '',
    userDisplayName: (state) => state.userProfile?.displayName || state.user?.displayName || '',
    username: (state) => state.userProfile?.username || '',
  },
  
  actions: {
    // Inicializar listener de autenticación
    initAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user
        if (user) {
          // Si hay usuario, guardar email en sessionStorage
          sessionStorage.setItem('userEmail', user.email)
          // Cargar perfil de Firestore
          await this.loadUserProfile(user.uid)
        } else {
          // Si no hay usuario, limpiar sessionStorage
          sessionStorage.removeItem('userEmail')
          this.userProfile = null
        }
        this.loading = false
      })
    },

    // Nuevo: Cargar perfil de Firestore
    async loadUserProfile(uid) {
      try {
        const docRef = doc(db, 'userProfiles', uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          this.userProfile = docSnap.data()
        } else {
          // Crear perfil básico si no existe
          const basicProfile = {
            username: this.user.email.split('@')[0],
            displayName: this.user.displayName || '',
            email: this.user.email,
            uid: uid,
            createdAt: new Date().toISOString()
          }
          await setDoc(docRef, basicProfile)
          this.userProfile = basicProfile
        }
      } catch (error) {
        console.error('Error cargando perfil:', error)
      }
    },

    // Nuevo: Actualizar perfil
    async updateUserProfile(profileData) {
      if (!this.user) return { success: false, error: 'No hay usuario autenticado' }

      this.loading = true
      this.error = null

      try {
        const userRef = doc(db, 'userProfiles', this.user.uid)
        
        // Sanitizar datos antes de guardar
        const sanitizedData = {
          username: sanitizeInput(profileData.username),
          displayName: sanitizeInput(profileData.displayName),
          updatedAt: new Date().toISOString()
        }

        // Actualizar en Firestore
        await updateDoc(userRef, sanitizedData)
        
        // Actualizar displayName en Firebase Auth si cambió
        if (sanitizedData.displayName !== this.user.displayName) {
          await updateProfile(this.user, {
            displayName: sanitizedData.displayName
          })
        }
        
        // Actualizar estado local
        this.userProfile = { ...this.userProfile, ...sanitizedData }
        
        return { success: true }
      } catch (err) {
        this.error = err.message
        console.error('Error actualizando perfil:', err)
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    // Modificar: Registro de nuevo usuario
    async register(email, password, displayName = '') {
      this.loading = true
      this.error = null
      try {
        const sanitizedEmail = sanitizeInput(email)
        const sanitizedName = sanitizeInput(displayName)

        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.')
        }

        const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password)
        this.user = userCredential.user

        // Actualizar displayName en Firebase Auth
        if (sanitizedName) {
          await updateProfile(this.user, {
            displayName: sanitizedName
          })
        }

        // Guardar email en sessionStorage
        sessionStorage.setItem('userEmail', this.user.email)

        // Crear perfil en Firestore
        const userProfile = {
          username: sanitizedName || this.user.email.split('@')[0],
          displayName: sanitizedName || '',
          email: this.user.email,
          uid: this.user.uid,
          createdAt: new Date().toISOString()
        }
        
        await setDoc(doc(db, 'userProfiles', this.user.uid), userProfile)
        this.userProfile = userProfile

        return {
          success: true,
          user: userCredential.user,
        }
      } catch (err) {
        this.error = err.message
        console.error('Error en registro:', err)
        return {
          success: false,
          error: err.message,
        }
      } finally {
        this.loading = false
      }
    },

    // Modificar: Inicio de sesión
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const sanitizedEmail = sanitizeInput(email)

        const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password)
        this.user = userCredential.user
        
        // Guardar email en sessionStorage
        sessionStorage.setItem('userEmail', this.user.email)
        
        // Cargar perfil de Firestore
        await this.loadUserProfile(this.user.uid)

        return {
          success: true,
          user: userCredential.user,
        }
      } catch (err) {
        this.error = err.message
        console.error('Error en login:', err)
        return {
          success: false,
          error: err.message,
        }
      } finally {
        this.loading = false
      }
    },

    // Modificar: Cerrar sesión
    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.userProfile = null
        sessionStorage.removeItem('userEmail')
        return { success: true }
      } catch (err) {
        console.error('Error al cerrar sesión:', err)
        return { success: false, error: err.message }
      }
    },

    // Escuchar cambios en la autenticación
    listenToAuthChanges() {
      this.initAuthListener()
    },
  },
})*/

// src/stores/auth.js
import { defineStore } from 'pinia'
import { auth, db } from '@/services/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore'

// Nuestro helper de sanitización
import { sanitizeInput } from '@/utils/sanitize'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    hasProfile: false, // Nuevo: indica si el usuario ya tiene perfil
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email || '',
    userDisplayName: (state) => state.userProfile?.displayName || '',
    username: (state) => state.userProfile?.username || '',
  },
  
  actions: {
    // Inicializar listener de autenticación
    initAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user
        if (user) {
          sessionStorage.setItem('userEmail', user.email)
          // Verificar si existe perfil, pero no cargarlo automáticamente
          await this.checkUserProfile(user.uid)
        } else {
          sessionStorage.removeItem('userEmail')
          this.userProfile = null
          this.hasProfile = false
        }
        this.loading = false
      })
    },

    // Nuevo: Solo verificar si existe perfil, sin cargarlo
    async checkUserProfile(uid) {
      try {
        const docRef = doc(db, 'userProfiles', uid)
        const docSnap = await getDoc(docRef)
        
        this.hasProfile = docSnap.exists()
        if (this.hasProfile) {
          // Solo cargamos el perfil si existe
          this.userProfile = docSnap.data()
        } else {
          this.userProfile = null
        }
      } catch (error) {
        console.error('Error verificando perfil:', error)
        this.hasProfile = false
      }
    },

    // Nuevo: Crear perfil por primera vez
    async createUserProfile(profileData) {
      if (!this.user) return { success: false, error: 'No hay usuario autenticado' }

      this.loading = true
      this.error = null

      try {
        const userRef = doc(db, 'userProfiles', this.user.uid)
        
        // Sanitizar datos
        const newProfile = {
          username: sanitizeInput(profileData.username),
          displayName: sanitizeInput(profileData.displayName),
          email: this.user.email,
          uid: this.user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Crear perfil en Firestore
        await setDoc(userRef, newProfile)
        
        // Actualizar estado
        this.userProfile = newProfile
        this.hasProfile = true
        
        return { success: true }
      } catch (err) {
        this.error = err.message
        console.error('Error creando perfil:', err)
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    // Modificar: Actualizar perfil existente
    async updateUserProfile(profileData) {
      if (!this.user) return { success: false, error: 'No hay usuario autenticado' }

      this.loading = true
      this.error = null

      try {
        const userRef = doc(db, 'userProfiles', this.user.uid)
        
        const updatedData = {
          username: sanitizeInput(profileData.username),
          displayName: sanitizeInput(profileData.displayName),
          updatedAt: new Date().toISOString()
        }

        await updateDoc(userRef, updatedData)
        
        this.userProfile = { ...this.userProfile, ...updatedData }
        
        return { success: true }
      } catch (err) {
        this.error = err.message
        console.error('Error actualizando perfil:', err)
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    // Modificar: Registro (solo crea en Auth, no en Firestore)
    async register(email, password) {
      this.loading = true
      this.error = null
      try {
        const sanitizedEmail = sanitizeInput(email)

        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.')
        }

        const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password)
        this.user = userCredential.user

        // Guardar email en sessionStorage
        sessionStorage.setItem('userEmail', this.user.email)
        
        // No crear perfil automáticamente
        this.hasProfile = false
        this.userProfile = null

        return {
          success: true,
          user: userCredential.user,
        }
      } catch (err) {
        this.error = err.message
        console.error('Error en registro:', err)
        return {
          success: false,
          error: err.message,
        }
      } finally {
        this.loading = false
      }
    },

    // Modificar: Login (verifica perfil pero no lo crea)
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const sanitizedEmail = sanitizeInput(email)

        const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password)
        this.user = userCredential.user
        
        sessionStorage.setItem('userEmail', this.user.email)
        
        // Verificar si tiene perfil
        await this.checkUserProfile(this.user.uid)

        return {
          success: true,
          user: userCredential.user,
          hasProfile: this.hasProfile
        }
      } catch (err) {
        this.error = err.message
        console.error('Error en login:', err)
        return {
          success: false,
          error: err.message,
        }
      } finally {
        this.loading = false
      }
    },

    // Logout
    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.userProfile = null
        this.hasProfile = false
        sessionStorage.removeItem('userEmail')
        return { success: true }
      } catch (err) {
        console.error('Error al cerrar sesión:', err)
        return { success: false, error: err.message }
      }
    },

    listenToAuthChanges() {
      this.initAuthListener()
    },
  },
})