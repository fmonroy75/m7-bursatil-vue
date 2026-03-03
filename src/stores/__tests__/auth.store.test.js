// src/stores/__tests__/auth.store.test.js
import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth'
import { auth, db } from '@/services/firebase'
import { 
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword 
} from 'firebase/auth'
import { getDoc, setDoc, updateDoc } from 'firebase/firestore'

// Mock de las funciones de Firebase
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  getFirestore: vi.fn()
}))

describe('Auth Store', () => {
  let authStore

  beforeEach(() => {
    // Crear una nueva instancia de Pinia antes de cada prueba
    setActivePinia(createPinia())
    authStore = useAuthStore()
    
    // Limpiar todos los mocks
    vi.clearAllMocks()
    
    // Mock de sessionStorage
    sessionStorage.getItem.mockReset()
    sessionStorage.setItem.mockReset()
    sessionStorage.removeItem.mockReset()
  })

  describe('Estado inicial', () => {
    it('debe tener el estado inicial correcto', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.userProfile).toBeNull()
      expect(authStore.hasProfile).toBe(false)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
    })

    it('debe tener los getters correctos', () => {
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.userEmail).toBe('')
      expect(authStore.username).toBe('')
    })
  })

  describe('login', () => {
    it('debe realizar login exitoso', async () => {
      // Mock de usuario simulado
      const mockUser = {
        uid: '123',
        email: 'test@test.com'
      }
      
      // Mock de la respuesta de Firebase
      signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      })

      // Mock de getDoc para simular que no tiene perfil
      getDoc.mockResolvedValue({
        exists: () => false
      })

      const result = await authStore.login('test@test.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.hasProfile).toBe(false)
      expect(sessionStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@test.com')
    })

    it('debe manejar error de login', async () => {
      // Mock de error de Firebase
      signInWithEmailAndPassword.mockRejectedValue(new Error('Credenciales inválidas'))

      const result = await authStore.login('test@test.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Credenciales inválidas')
      expect(authStore.error).toBe('Credenciales inválidas')
      expect(authStore.user).toBeNull()
    })

    it('debe sanitizar el email antes de login', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' }
      
      signInWithEmailAndPassword.mockResolvedValue({ user: mockUser })
      getDoc.mockResolvedValue({ exists: () => false })

      await authStore.login('  test@test.com  ', 'password123')

      // Verificar que se llamó con el email sanitizado
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@test.com',
        'password123'
      )
    })
  })

  describe('logout', () => {
    it('debe realizar logout exitoso', async () => {
      // Simular usuario logueado
      authStore.user = { uid: '123', email: 'test@test.com' }
      authStore.userProfile = { username: 'testuser' }
      authStore.hasProfile = true
      sessionStorage.setItem('userEmail', 'test@test.com')

      signOut.mockResolvedValue()

      const result = await authStore.logout()

      expect(result.success).toBe(true)
      expect(authStore.user).toBeNull()
      expect(authStore.userProfile).toBeNull()
      expect(authStore.hasProfile).toBe(false)
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('userEmail')
    })

    it('debe manejar error de logout', async () => {
      signOut.mockRejectedValue(new Error('Error al cerrar sesión'))

      const result = await authStore.logout()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Error al cerrar sesión')
    })
  })

  describe('registro', () => {
    it('debe registrar nuevo usuario exitosamente', async () => {
      const mockUser = {
        uid: '123',
        email: 'nuevo@test.com'
      }

      createUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      })

      const result = await authStore.register('nuevo@test.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.hasProfile).toBe(false)
      expect(sessionStorage.setItem).toHaveBeenCalledWith('userEmail', 'nuevo@test.com')
    })

    it('debe validar longitud de contraseña', async () => {
      const result = await authStore.register('test@test.com', '123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres.')
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
    })
  })

  describe('perfil de usuario', () => {
    it('debe crear perfil de usuario', async () => {
      authStore.user = { uid: '123', email: 'test@test.com' }
      
      setDoc.mockResolvedValue()

      const profileData = {
        username: 'testuser',
        displayName: 'Test User'
      }

      const result = await authStore.createUserProfile(profileData)

      expect(result.success).toBe(true)
      expect(authStore.userProfile).toEqual({
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@test.com',
        uid: '123',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
      expect(authStore.hasProfile).toBe(true)
    })

    it('debe actualizar perfil de usuario', async () => {
      authStore.user = { uid: '123', email: 'test@test.com' }
      authStore.userProfile = {
        username: 'olduser',
        displayName: 'Old User'
      }

      updateDoc.mockResolvedValue()

      const profileData = {
        username: 'newuser',
        displayName: 'New User'
      }

      const result = await authStore.updateUserProfile(profileData)

      expect(result.success).toBe(true)
      expect(authStore.userProfile.username).toBe('newuser')
      expect(authStore.userProfile.displayName).toBe('New User')
    })
  })
})