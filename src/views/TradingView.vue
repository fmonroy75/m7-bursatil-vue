<!-- views/TradingView.vue -->
<template>
    <div class="trading-container">
      <header class="trading-header">
        <div>
          <h2>💹 Trading de Activos</h2>
          <span class="subtitle">Compra y vende acciones en tiempo real</span>
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
  
      <!-- Mensaje para usuarios no autenticados
      <div v-if="!authStore.isAuthenticated" class="auth-warning">
        <p>🔐 Inicia sesión para comenzar a operar</p>
        <div class="auth-buttons">
          <router-link :to="{ name: 'login' }" class="btn-login">Iniciar Sesión</router-link>
          <router-link :to="{ name: 'register' }" class="btn-register">Registrarse</router-link>
        </div>
      </div> -->
  
      <!-- Tabla de mercado con opciones de compra -->
      <div class="market-section">
        <!--<div class="market-header">
          <h3>📊 Mercado de Activos</h3>
          <button class="btn-refresh" @click="cargarDatos" :disabled="loading">
            🔄 Actualizar
          </button>
        </div>
  
        <p class="last-update" v-if="ultimaActualizacion">
          Última actualización: {{ ultimaActualizacion }}
        </p>
  
        <Loader v-if="loading" />-->
  
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
      <div v-if="canTrade && activosEnCartera.length > 0" class="portfolio-section">
        <h3>📁 Mi Cartera</h3>
        <div class="portfolio-grid">
          <div v-for="activo in activosEnCartera" :key="activo.id" class="portfolio-card">
            <div class="portfolio-header">
              <strong>{{ activo.nombre }}</strong>
              <span class="portfolio-symbol">{{ activo.simbolo.toUpperCase() }}</span>
            </div>
            <div class="portfolio-body">
              <div class="portfolio-detail">
                <span>Cantidad:</span>
                <span class="detail-value">{{ activo.cantidad }} acciones</span>
              </div>
            </div>
          </div>
        </div>
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
  
  const authStore = useAuthStore()
  const tradingStore = useTradingStore()
  
  // Datos de mercado
  const datos = ref([])
  const loading = ref(false)
  const filtro = ref('')
  const ultimaActualizacion = ref('—')
  
  // Modal
  const modalVisible = ref(false)
  const modalTipo = ref('buy') // 'buy' o 'sell'
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
      return 1000000 // Sin límite superior para compras
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
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      loading.value = false
    }
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
  
  // Cargar datos iniciales
  onMounted(() => {
    cargarDatos()
  })
  
  // Cargar transacciones cuando el usuario esté autenticado y tenga perfil
  watch(
    [() => authStore.isAuthenticated, () => authStore.hasProfile],
    ([isAuth, hasProfile]) => {
      if (isAuth && hasProfile) {
        tradingStore.cargarTransacciones()
      } else {
        tradingStore.limpiarTransacciones()
      }
    },
    { immediate: true }
  )
  </script>
  
  <style scoped>
  /*.trading-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .trading-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .trading-header h2 {
    font-size: 2rem;
    color: #1e2b38;
    margin-bottom: 5px;
  }
  
  .subtitle {
    color: #718096;
    font-size: 0.95rem;
  }
  
  .stats-card {
    background: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    display: flex;
    gap: 30px;
  }
  
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stat-label {
    font-size: 0.85rem;
    color: #718096;
    margin-bottom: 5px;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #4299e1;
  }
  
  .profile-warning,
  .auth-warning {
    background: #fff3cd;
    border: 1px solid #ffeeba;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .profile-warning p,
  .auth-warning p {
    color: #856404;
    margin: 0;
    font-weight: 500;
  }
  
  .auth-warning {
    background: #e2f0fd;
    border-color: #b8daff;
  }
  
  .auth-warning p {
    color: #004085;
  }
  
  .btn-profile,
  .btn-login,
  .btn-register {
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .btn-profile {
    background: #ffc107;
    color: #1e2b38;
  }
  
  .btn-login {
    background: #007bff;
    color: white;
    margin-right: 10px;
  }
  
  .btn-register {
    background: #28a745;
    color: white;
  }
  
  .auth-buttons {
    display: flex;
    gap: 10px;
  }
  
  .market-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-bottom: 30px;
  }
  
  .market-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .market-header h3 {
    font-size: 1.3rem;
    color: #1e2b38;
  }
  
  .btn-refresh {
    padding: 8px 16px;
    background: #f0f2f5;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .btn-refresh:hover:not(:disabled) {
    background: #e2e8f0;
  }
  
  .btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .last-update {
    color: #718096;
    font-size: 0.85rem;
    margin-bottom: 15px;
  }
  /*
  .table-container {
    overflow-x: auto;
    margin-top: 20px;
  }
  
  .trading-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }
  
  .trading-table th {
    text-align: left;
    padding: 15px 10px;
    background: #f8f9fa;
    color: #495057;
    font-weight: 600;
    font-size: 0.9rem;
    border-bottom: 2px solid #dee2e6;
  }
  
  .trading-table td {
    padding: 15px 10px;
    border-bottom: 1px solid #e9ecef;
  }
  * /
  .asset-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .asset-details {
    display: flex;
    flex-direction: column;
  }
  
  .asset-symbol {
    font-size: 0.8rem;
    color: #718096;
    text-transform: uppercase;
  }
  
  .price {
    font-weight: 600;
    color: #1e2b38;
  }
  
  .change {
    font-weight: 600;
  }
  
  .positive {
    color: #48bb78;
  }
  
  .negative {
    color: #f56565;
  }
  
  .holdings {
    text-align: center;
  }
  
  .badge-holdings {
    background: #ebf8ff;
    color: #2c5282;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }
  
  .no-holdings {
    color: #cbd5e0;
    font-size: 0.85rem;
  }*/
  
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
  
  /* Portfolio section */
  /*.portfolio-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-bottom: 30px;
  }
  
  .portfolio-section h3 {
    font-size: 1.3rem;
    color: #1e2b38;
    margin-bottom: 20px;
  }
  
  .portfolio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .portfolio-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border: 1px solid #e9ecef;
  }
  
  .portfolio-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
  }
  
  .portfolio-symbol {
    font-size: 0.8rem;
    color: #718096;
    text-transform: uppercase;
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  .portfolio-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .portfolio-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  * /
  .detail-value {
    font-weight: 600;
    color: #1e2b38;
  }
  
  /* Historial */
  /*.history-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .history-section h3 {
    font-size: 1.3rem;
    color: #1e2b38;
    margin-bottom: 20px;
  }
  
  .history-table-container {
    overflow-x: auto;
  }
  
  .history-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
  }
  
  .history-table th {
    text-align: left;
    padding: 12px 10px;
    background: #f8f9fa;
    color: #495057;
    font-weight: 600;
    font-size: 0.9rem;
    border-bottom: 2px solid #dee2e6;
  }
  
  .history-table td {
    padding: 12px 10px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  * /
  .badge.buy {
    background: #d4edda;
    color: #155724;
  }
  
  .badge.sell {
    background: #f8d7da;
    color: #721c24;
  }
  
  .empty-state {
    text-align: center;
    color: #718096;
    padding: 30px !important;
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