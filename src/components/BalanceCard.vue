<!-- src/components/BalanceCard.vue -->
<template>
    <div class="card bg-dark text-white">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="card-title mb-0">
            <i class="bi bi-wallet2"></i> Mi Balance
          </h5>
          <span class="badge" :class="balanceChangeClass">
            <i :class="balanceChangeIcon"></i> {{ balanceChange }}
          </span>
        </div>
  
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-light"></div>
          <p class="text-white-50 small mt-2">Cargando balance...</p>
        </div>
  
        <div v-else>
          <div class="display-4 mb-2">
            ${{ formatBalance }}
          </div>
          
          <div class="row text-center mt-4">
            <div class="col-6">
              <small class="text-white-50 d-block">En cartera</small>
              <span class="h5">{{ activosEnCartera.length }} activos</span>
            </div>
            <div class="col-6">
              <small class="text-white-50 d-block">Operaciones</small>
              <span class="h5">{{ totalTransacciones }}</span>
            </div>
          </div>
  
          <hr class="bg-secondary">
  
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-white-50">Patrimonio total</span>
            <span class="h5 mb-0">${{ formatPatrimonio }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useTradingStore } from '@/stores/trading'
  
  const props = defineProps({
    preciosActuales: {
      type: Object,
      default: () => ({})
    }
  })
  
  const tradingStore = useTradingStore()
  
  const formatBalance = computed(() => {
    return tradingStore.balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  })
  
  const formatPatrimonio = computed(() => {
    const total = tradingStore.patrimonioTotal(props.preciosActuales)
    return total.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  })
  
  const activosEnCartera = computed(() => tradingStore.activosEnCartera)
  const totalTransacciones = computed(() => tradingStore.transacciones.length)
  const loading = computed(() => tradingStore.loading)
  
  // Calcular cambio desde el inicio (opcional)
  const balanceChange = computed(() => {
    const inicial = 10000
    const actual = tradingStore.patrimonioTotal(props.preciosActuales)
    const cambio = ((actual - inicial) / inicial * 100).toFixed(2)
    return cambio >= 0 ? `+${cambio}%` : `${cambio}%`
  })
  
  const balanceChangeClass = computed(() => {
    const cambio = parseFloat(balanceChange.value)
    return cambio >= 0 ? 'bg-success' : 'bg-danger'
  })
  
  const balanceChangeIcon = computed(() => {
    return parseFloat(balanceChange.value) >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'
  })
  </script>