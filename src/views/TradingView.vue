<!-- views/TradingView.vue -->
<template>
    <div class="trading-container">
      <header class="trading-header">
        <div>
          <h2>💹 Trading de Activos</h2>
          <span class="subtitle">Compra y vende acciones en tiempo real</span>
        </div>
      <!-- Balance Card -->
      <div v-if="canTrade" class="balance-wrapper">
        <BalanceCard :preciosActuales="preciosActuales" />
      </div>        
        <!-- Resumen de cartera si está autenticado y tiene perfil -->
        <div v-if="authStore.isAuthenticated && authStore.hasProfile" class="portfolio-summary">
          <div class="stats-card">
            <div class="stat">
              <span class="stat-label">Activos en cartera</span>
              <span class="stat-value">{{ activosEnCartera.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total transacciones</span>
              <span class="stat-value">{{ tradingStore.transacciones.length }}</span>
            </div>
          </div>
        </div>
      </header>
  
      <!-- Mensaje para usuarios sin perfil -->
      <div v-if="authStore.isAuthenticated && !authStore.hasProfile" class="profile-warning">
        <p>⚠️ Necesitas completar tu perfil para poder comprar y vender acciones</p>
        <router-link :to="{ name: 'createProfile' }" class="btn-profile">
          Completar Perfil
        </router-link>
      </div>
  
      <!-- Tabla de mercado con opciones de compra -->
      <div class="market-section">
  
        <FilterInput v-model="filtro" placeholder="Filtrar activos..." />
  
        <!-- Tabla de trading -->
        <div class="table-container">
          <table class="trading-table">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Precio (USD)</th>
                <th>Variación 24h</th>
                <th>Market Cap</th>
                <th v-if="canTrade">Mis acciones</th>
                <th v-if="canTrade">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="asset in datosFiltrados" :key="asset.id">
                <td class="asset-info">
                  <img :src="asset.image" :alt="asset.name" width="25" height="25">
                  <div class="asset-details">
                    <strong>{{ asset.name }}</strong>
                    <span class="asset-symbol">{{ asset.symbol.toUpperCase() }}</span>
                  </div>
                </td>
                <td class="price">{{ formatCurrency(asset.current_price) }}</td>
                <td :class="['change', asset.price_change_percentage_24h >= 0 ? 'positive' : 'negative']">
                  {{ asset.price_change_percentage_24h?.toFixed(2) }}%
                </td>
                <td class="market-cap">{{ formatCurrency(asset.market_cap) }}</td>
                
                <!-- Columna de acciones que posee -->
                <td v-if="canTrade" class="holdings">
                  <span v-if="cantidadActivo(asset.id) > 0" class="badge-holdings">
                    {{ cantidadActivo(asset.id) }} acc.
                  </span>
                  <span v-else class="no-holdings">-</span>
                </td>
                
                <!-- Botones de acción -->
                <td v-if="canTrade" class="actions">
                  <button 
                    class="btn-buy" 
                    @click="abrirModalCompra(asset)"
                    :disabled="tradingStore.loading"
                  >
                    Comprar
                  </button>
                  <button 
                    class="btn-sell" 
                    @click="abrirModalVenta(asset)"
                    :disabled="tradingStore.loading || cantidadActivo(asset.id) === 0"
                  >
                    Vender
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Modal de compra/venta -->
      <Transition name="modal">
        <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
          <div class="modal-content">
            <button class="modal-close" @click="cerrarModal">✕</button>
            
            <h3>{{ modalTitulo }} {{ assetSeleccionado?.name }}</h3>
            
            <div class="asset-price-info">
              <span class="label">Precio actual:</span>
              <span class="value">{{ formatCurrency(assetSeleccionado?.current_price) }}</span>
            </div>
  
            <div v-if="modalTipo === 'sell'" class="holdings-info">
              <span class="label">Acciones disponibles:</span>
              <span class="value">{{ accionesDisponibles }}</span>
            </div>
  
            <form @submit.prevent="ejecutarTransaccion" class="trade-form">
              <div class="form-group">
                <label for="cantidad">Cantidad de acciones:</label>
                <input 
                  type="number" 
                  id="cantidad"
                  v-model="cantidad"
                  min="0.01"
                  :max="maxCantidad"
                  step="0.01"
                  required
                  :disabled="tradingStore.loading"
                >
                <small v-if="modalTipo === 'sell'" class="hint">
                  Máximo disponible: {{ maxCantidad }} acciones
                </small>
              </div>
  
              <div class="total-info">
                <span class="label">Total de la operación:</span>
                <span class="value">{{ formatCurrency(calcularTotal) }}</span>
              </div>
  
              <div class="modal-actions">
                <button 
                  type="submit" 
                  class="btn-confirm"
                  :class="{ 'btn-buy-confirm': modalTipo === 'buy', 'btn-sell-confirm': modalTipo === 'sell' }"
                  :disabled="tradingStore.loading || !cantidadValida"
                >
                  {{ tradingStore.loading ? 'Procesando...' : `Confirmar ${modalTitulo}` }}
                </button>
                <button type="button" class="btn-cancel" @click="cerrarModal">
                  Cancelar
                </button>
              </div>
            </form>
  
            <transition name="fade">
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </transition>
          </div>
        </div>
      </Transition>
  
      <!-- Cartera actual (solo para usuarios con perfil) -->
      <div v-if="canTrade" class="portfolio-section mt-4">
      <PortfolioCard
        :activosEnCartera="activosEnCartera"
        :preciosActuales="preciosActuales"
        :historialTransacciones="tradingStore.transacciones"
        @refresh="actualizarPrecios"
        @buy="abrirModalCompra"
        @sell="abrirModalVenta"
        @history="verHistorialActivo"
      />
    </div>  
      <!-- Historial de transacciones (solo para usuarios con perfil) -->
      <div v-if="canTrade" class="history-section">
        <h3>📜 Historial de Transacciones</h3>
        <div class="history-table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Activo</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaccion in tradingStore.transacciones" :key="transaccion.id">
                <td>{{ formatFecha(transaccion.fecha) }}</td>
                <td>
                  <span :class="['badge', transaccion.tipo]">
                    {{ transaccion.tipo === 'buy' ? 'COMPRA' : 'VENTA' }}
                  </span>
                </td>
                <td>{{ transaccion.assetName }} ({{ transaccion.assetSymbol }})</td>
                <td>{{ transaccion.cantidad }}</td>
                <td>{{ formatCurrency(transaccion.precio) }}</td>
                <td>{{ formatCurrency(transaccion.total) }}</td>
              </tr>
              <tr v-if="!tradingStore.transacciones.length">
                <td colspan="6" class="empty-state">No hay transacciones aún</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>


import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTradingStore } from '@/stores/trading'
import Loader from '../components/Loader.vue'
import FilterInput from '../components/FilterInput.vue'
import BalanceCard from '@/components/BalanceCard.vue'
import PortfolioCard from '@/components/PortfolioCard.vue'

const authStore = useAuthStore()
const tradingStore = useTradingStore()

// Datos de mercado
const datos = ref([])
const loading = ref(false)
const filtro = ref('')
const ultimaActualizacion = ref('—')

// Mapa de precios actuales (NUEVO)
const preciosActuales = ref({})

// Modal
const modalVisible = ref(false)
const modalTipo = ref('buy')
const assetSeleccionado = ref(null)
const cantidad = ref(0.01)
const errorMessage = ref('')

// Computed
const canTrade = computed(() => {
  return authStore.isAuthenticated && authStore.hasProfile
})

const accionesDisponibles = computed(() => {
  if (!assetSeleccionado.value) return 0
  return tradingStore.cantidadActivo(assetSeleccionado.value.id)
})

const maxCantidad = computed(() => {
  if (modalTipo.value === 'buy') {
    return 1000000
  } else {
    return accionesDisponibles.value
  }
})

const cantidadValida = computed(() => {
  const cant = parseFloat(cantidad.value)
  return !isNaN(cant) && cant > 0 && cant <= maxCantidad.value
})

const calcularTotal = computed(() => {
  return (parseFloat(cantidad.value) || 0) * (assetSeleccionado.value?.current_price || 0)
})

const modalTitulo = computed(() => {
  return modalTipo.value === 'buy' ? 'Comprar' : 'Vender'
})

const activosEnCartera = computed(() => {
  return tradingStore.activosEnCartera
})

// Funciones
const cargarDatos = async () => {
  loading.value = true
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    )
    datos.value = await response.json()
    ultimaActualizacion.value = new Date().toLocaleString()
    
    // ACTUALIZAR MAPA DE PRECIOS
    actualizarMapaPrecios(datos.value)
    
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

// NUEVA FUNCIÓN: Actualizar mapa de precios
const actualizarMapaPrecios = (datos) => {
  const nuevoMapa = {}
  datos.forEach(item => {
    // Guardar por ID (ej: 'bitcoin')
    nuevoMapa[item.id] = item.current_price
    // Guardar por símbolo (ej: 'btc')
    nuevoMapa[item.symbol] = item.current_price
    // Guardar por símbolo en mayúsculas (ej: 'BTC')
    nuevoMapa[item.symbol.toUpperCase()] = item.current_price
    // Guardar por nombre (ej: 'Bitcoin')
    nuevoMapa[item.name] = item.current_price
  })
  preciosActuales.value = nuevoMapa
  //console.log('💰 Precios actualizados:', preciosActuales.value)
}

const datosFiltrados = computed(() =>
  datos.value.filter(c =>
    c.name.toLowerCase().includes(filtro.value.toLowerCase()) ||
    c.symbol.toLowerCase().includes(filtro.value.toLowerCase())
  )
)

const cantidadActivo = (assetId) => {
  return tradingStore.cantidadActivo(assetId)
}

const abrirModalCompra = (asset) => {
  modalTipo.value = 'buy'
  assetSeleccionado.value = asset
  cantidad.value = 0.01
  errorMessage.value = ''
  modalVisible.value = true
}

const abrirModalVenta = (asset) => {
  modalTipo.value = 'sell'
  assetSeleccionado.value = asset
  cantidad.value = 0.01
  errorMessage.value = ''
  modalVisible.value = true
}

const cerrarModal = () => {
  modalVisible.value = false
  assetSeleccionado.value = null
  cantidad.value = 0.01
  errorMessage.value = ''
}

const ejecutarTransaccion = async () => {
  if (!cantidadValida.value) {
    errorMessage.value = 'Cantidad no válida'
    return
  }

  const asset = assetSeleccionado.value
  let resultado

  if (modalTipo.value === 'buy') {
    resultado = await tradingStore.comprarActivo({
      assetId: asset.id,
      assetName: asset.name,
      assetSymbol: asset.symbol,
      cantidad: parseFloat(cantidad.value),
      precio: asset.current_price
    })
  } else {
    resultado = await tradingStore.venderActivo({
      assetId: asset.id,
      assetName: asset.name,
      assetSymbol: asset.symbol,
      cantidad: parseFloat(cantidad.value),
      precio: asset.current_price
    })
  }

  if (resultado.success) {
    cerrarModal()
  } else {
    errorMessage.value = resultado.error
  }
}

// Función para refresh manual
const actualizarPrecios = () => {
  cargarDatos()
}

const verHistorialActivo = (activo) => {
  const historialActivo = tradingStore.transacciones.filter(
    t => t.assetId === activo.id
  )
  //console.log('Historial del activo:', historialActivo)
  // Aquí podrías mostrar un modal con el historial
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatFecha = (fecha) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watchers
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated && authStore.hasProfile) {
      await tradingStore.cargarDatosUsuario()
    } else {
      tradingStore.limpiarDatos()
    }
  },
  { immediate: true }
)

// Cargar datos iniciales
onMounted(() => {
  cargarDatos()
})
  </script>
  
  <style scoped>
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .btn-buy,
  .btn-sell {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-buy {
    background: #48bb78;
    color: white;
  }
  
  .btn-buy:hover:not(:disabled) {
    background: #38a169;
  }
  
  .btn-sell {
    background: #f56565;
    color: white;
  }
  
  .btn-sell:hover:not(:disabled) {
    background: #e53e3e;
  }
  
  .btn-buy:disabled,
  .btn-sell:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 30px;
    width: 90%;
    max-width: 450px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #718096;
  }
  
  .modal-content h3 {
    font-size: 1.5rem;
    color: #1e2b38;
    margin-bottom: 20px;
    padding-right: 30px;
  }
  
  .asset-price-info,
  .holdings-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e9ecef;
  }
  
  .label {
    color: #718096;
    font-size: 0.95rem;
  }
  
  .value {
    font-weight: 600;
    color: #1e2b38;
  }
  
  .trade-form {
    margin-top: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #495057;
    font-weight: 500;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    border: 2px solid #e9ecef;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  .form-group input:focus {
    outline: none;
    border-color: #4299e1;
  }
  
  .hint {
    display: block;
    margin-top: 5px;
    font-size: 0.8rem;
    color: #718096;
  }
  
  .total-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    margin: 15px 0;
    border-top: 2px dashed #e9ecef;
    border-bottom: 2px dashed #e9ecef;
    font-size: 1.1rem;
  }
  /**/
  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  .btn-confirm,
  .btn-cancel {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-buy-confirm {
    background: #48bb78;
    color: white;
  }
  
  .btn-sell-confirm {
    background: #f56565;
    color: white;
  }
  
  .btn-cancel {
    background: #e9ecef;
    color: #495057;
  }
  
  .btn-confirm:hover:not(:disabled) {
    filter: brightness(0.9);
  }
  
  .btn-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-cancel:hover {
    background: #dee2e6;
  }
  
  .error-message {
    margin-top: 15px;
    padding: 10px;
    background: #fee;
    color: #c53030;
    border-radius: 6px;
    text-align: center;
    font-size: 0.9rem;
  }
  
  
  /* Transiciones */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  @media (max-width: 768px) {
    .trading-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .stats-card {
      width: 100%;
      justify-content: space-around;
    }
    
    .profile-warning,
    .auth-warning {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .auth-buttons {
      width: 100%;
    }
    
    .btn-login,
    .btn-register {
      flex: 1;
      text-align: center;
    }
    
    .portfolio-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>