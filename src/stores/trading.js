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
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  Timestamp 
} from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useTradingStore = defineStore('trading', {
  state: () => ({
    transacciones: [],
    balance: 0,
    loading: false,
    error: null,
    balanceLoaded: false
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

    // Valor total del portfolio en USD
    valorTotalPortfolio: (state) => (preciosActuales) => {
      let total = 0
      const activos = state.activosEnCartera
      
      activos.forEach(activo => {
        const precio = preciosActuales[activo.id] || 0
        total += activo.cantidad * precio
      })
      
      return total
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
    },

    // Patrimonio total (balance + valor del portfolio)
    patrimonioTotal: (state) => (preciosActuales) => {
      return state.balance + state.valorTotalPortfolio(preciosActuales)
    }
  },

  actions: {
    // Cargar balance del usuario
    async cargarBalance() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      this.loading = true
      try {
        const balanceRef = doc(db, 'balances', authStore.user.uid)
        const balanceDoc = await getDoc(balanceRef)
        
        if (balanceDoc.exists()) {
          this.balance = balanceDoc.data().amount
          //console.log(`💰 Balance cargado: $${this.balance.toLocaleString()}`)
        } else {
          // Crear balance inicial para nuevo usuario
          await setDoc(balanceRef, {
            userId: authStore.user.uid,
            amount: 10000,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          })
          this.balance = 10000
          //console.log(`🎉 Balance inicial creado: $10,000`)
        }
        
        this.balanceLoaded = true
      } catch (error) {
        console.error('Error cargando balance:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

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
        
        //console.log(`📊 ${this.transacciones.length} transacciones cargadas`)
      } catch (error) {
        console.error('Error cargando transacciones:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Comprar activo (con validación de balance)
    async comprarActivo({ assetId, assetName, assetSymbol, cantidad, precio }) {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const total = parseFloat(cantidad) * parseFloat(precio)

      // Validar balance suficiente
      if (total > this.balance) {
        return { 
          success: false, 
          error: `Saldo insuficiente. Necesitas $${total.toFixed(2)} y tienes $${this.balance.toFixed(2)}` 
        }
      }

      if (cantidad <= 0) {
        return { success: false, error: 'La cantidad debe ser mayor a 0' }
      }

      this.loading = true
      
      // Usar transacción de Firestore para garantizar consistencia
      try {
        const result = await runTransaction(db, async (transaction) => {
          // 1. Verificar balance actual
          const balanceRef = doc(db, 'balances', authStore.user.uid)
          const balanceDoc = await transaction.get(balanceRef)
          
          if (!balanceDoc.exists()) {
            throw new Error('Balance no encontrado')
          }
          
          const currentBalance = balanceDoc.data().amount
          
          if (currentBalance < total) {
            throw new Error('Saldo insuficiente')
          }
          
          // 2. Actualizar balance
          transaction.update(balanceRef, {
            amount: currentBalance - total,
            updatedAt: Timestamp.now()
          })
          
          // 3. Registrar transacción
          const transaccion = {
            userId: authStore.user.uid,
            assetId,
            assetName,
            assetSymbol,
            tipo: 'buy',
            cantidad: parseFloat(cantidad),
            precio: parseFloat(precio),
            total,
            fecha: Timestamp.now()
          }
          
          const transaccionRef = doc(collection(db, 'transacciones'))
          transaction.set(transaccionRef, transaccion)
          
          return { transaccionId: transaccionRef.id, nuevoBalance: currentBalance - total }
        })

        // Actualizar estado local
        this.balance = result.nuevoBalance
        this.transacciones.unshift({
          id: result.transaccionId,
          userId: authStore.user.uid,
          assetId,
          assetName,
          assetSymbol,
          tipo: 'buy',
          cantidad: parseFloat(cantidad),
          precio: parseFloat(precio),
          total,
          fecha: new Date()
        })

        //console.log(`✅ Compra exitosa! Nuevo balance: $${this.balance.toFixed(2)}`)
        return { success: true }

      } catch (error) {
        console.error('Error en compra:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Vender activo (con actualización de balance)
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

      const total = parseFloat(cantidad) * parseFloat(precio)

      this.loading = true
      
      try {
        const result = await runTransaction(db, async (transaction) => {
          // 1. Actualizar balance
          const balanceRef = doc(db, 'balances', authStore.user.uid)
          const balanceDoc = await transaction.get(balanceRef)
          
          if (!balanceDoc.exists()) {
            throw new Error('Balance no encontrado')
          }
          
          const currentBalance = balanceDoc.data().amount
          
          transaction.update(balanceRef, {
            amount: currentBalance + total,
            updatedAt: Timestamp.now()
          })
          
          // 2. Registrar transacción
          const transaccion = {
            userId: authStore.user.uid,
            assetId,
            assetName,
            assetSymbol,
            tipo: 'sell',
            cantidad: parseFloat(cantidad),
            precio: parseFloat(precio),
            total,
            fecha: Timestamp.now()
          }
          
          const transaccionRef = doc(collection(db, 'transacciones'))
          transaction.set(transaccionRef, transaccion)
          
          return { transaccionId: transaccionRef.id, nuevoBalance: currentBalance + total }
        })

        // Actualizar estado local
        this.balance = result.nuevoBalance
        this.transacciones.unshift({
          id: result.transaccionId,
          userId: authStore.user.uid,
          assetId,
          assetName,
          assetSymbol,
          tipo: 'sell',
          cantidad: parseFloat(cantidad),
          precio: parseFloat(precio),
          total,
          fecha: new Date()
        })

        //console.log(`💰 Venta exitosa! Nuevo balance: $${this.balance.toFixed(2)}`)
        return { success: true }

      } catch (error) {
        console.error('Error en venta:', error)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // Cargar todos los datos del usuario (balance + transacciones)
    async cargarDatosUsuario() {
      const authStore = useAuthStore()
      if (!authStore.user?.uid) return

      this.loading = true
      try {
        await Promise.all([
          this.cargarBalance(),
          this.cargarTransacciones()
        ])
        //console.log('✅ Datos de trading cargados correctamente')
      } catch (error) {
        console.error('Error cargando datos de trading:', error)
      } finally {
        this.loading = false
      }
    },

    // Limpiar datos al hacer logout
    limpiarDatos() {
      this.transacciones = []
      this.balance = 0
      this.balanceLoaded = false
    }
  }
})