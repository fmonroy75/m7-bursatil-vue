// src/stores/trading.js
import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  Timestamp 
} from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useTradingStore = defineStore('trading', {
  state: () => ({
    transacciones: [],
    loading: false,
    error: null
  }),

  getters: {
    // Obtener todas las transacciones de compra de un activo
    comprasPorActivo: (state) => (assetId) => {
      return state.transacciones.filter(t => t.assetId === assetId && t.tipo === 'buy')
    },
    
    // Obtener todas las transacciones de venta de un activo
    ventasPorActivo: (state) => (assetId) => {
      return state.transacciones.filter(t => t.assetId === assetId && t.tipo === 'sell')
    },

    // Calcular cantidad neta de un activo (compras - ventas)
    cantidadActivo: (state) => (assetId) => {
      const compras = state.transacciones
        .filter(t => t.assetId === assetId && t.tipo === 'buy')
        .reduce((sum, t) => sum + t.cantidad, 0)
      
      const ventas = state.transacciones
        .filter(t => t.assetId === assetId && t.tipo === 'sell')
        .reduce((sum, t) => sum + t.cantidad, 0)
      
      return compras - ventas
    },

    // Total de activos en cartera (los que tienen cantidad > 0)
    activosEnCartera: (state) => {
      const activos = {}
      state.transacciones.forEach(t => {
        if (!activos[t.assetId]) {
          activos[t.assetId] = {
            id: t.assetId,
            nombre: t.assetName,
            simbolo: t.assetSymbol,
            cantidad: 0
          }
        }
        if (t.tipo === 'buy') {
          activos[t.assetId].cantidad += t.cantidad
        } else {
          activos[t.assetId].cantidad -= t.cantidad
        }
      })
      
      // Filtrar solo los que tienen cantidad > 0
      return Object.values(activos).filter(a => a.cantidad > 0)
    }
  },

  actions: {
    // Cargar transacciones del usuario
    async cargarTransacciones() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      this.loading = true
      try {
        const q = query(
          collection(db, 'transacciones'),
          where('userId', '==', authStore.user.uid),
          orderBy('fecha', 'desc')
        )
        
        const querySnapshot = await getDocs(q)
        this.transacciones = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha?.toDate?.() || doc.data().fecha
        }))
      } catch (error) {
        console.error('Error cargando transacciones:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Comprar activo (solo registro)
    async comprarActivo({ assetId, assetName, assetSymbol, cantidad, precio }) {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      if (cantidad <= 0) {
        return { success: false, error: 'La cantidad debe ser mayor a 0' }
      }

      this.loading = true
      try {
        const transaccion = {
          userId: authStore.user.uid,
          assetId,
          assetName,
          assetSymbol,
          tipo: 'buy',
          cantidad: parseFloat(cantidad),
          precio: parseFloat(precio),
          total: parseFloat(cantidad) * parseFloat(precio),
          fecha: Timestamp.now()
        }

        const docRef = await addDoc(collection(db, 'transacciones'), transaccion)

        // Actualizar estado local
        this.transacciones.unshift({
          id: docRef.id,
          ...transaccion,
          fecha: new Date()
        })

        return { success: true }
      } catch (error) {
        console.error('Error en compra:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Vender activo (solo registro)
    async venderActivo({ assetId, assetName, assetSymbol, cantidad, precio }) {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      // Verificar que tiene suficientes acciones
      const cantidadActual = this.cantidadActivo(assetId)
      if (cantidad > cantidadActual) {
        return { success: false, error: `Solo tienes ${cantidadActual} acciones disponibles` }
      }

      if (cantidad <= 0) {
        return { success: false, error: 'La cantidad debe ser mayor a 0' }
      }

      this.loading = true
      try {
        const transaccion = {
          userId: authStore.user.uid,
          assetId,
          assetName,
          assetSymbol,
          tipo: 'sell',
          cantidad: parseFloat(cantidad),
          precio: parseFloat(precio),
          total: parseFloat(cantidad) * parseFloat(precio),
          fecha: Timestamp.now()
        }

        const docRef = await addDoc(collection(db, 'transacciones'), transaccion)

        // Actualizar estado local
        this.transacciones.unshift({
          id: docRef.id,
          ...transaccion,
          fecha: new Date()
        })

        return { success: true }
      } catch (error) {
        console.error('Error en venta:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Limpiar transacciones (útil para logout)
    limpiarTransacciones() {
      this.transacciones = []
    }
  }
})