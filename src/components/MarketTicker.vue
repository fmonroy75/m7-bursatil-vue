<!-- src/components/MarketTicker.vue -->
<template>
    <div class="market-ticker">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="text-white mb-0">
          <i class="bi bi-graph-up"></i> Mercados
        </h6>
        <button 
          v-if="showRefresh" 
          class="btn btn-sm btn-outline-light" 
          @click="$emit('refresh')"
          :disabled="loading"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': loading }"></i>
        </button>
      </div>
      
      <div v-if="loading" class="text-center py-2">
        <div class="spinner-border spinner-border-sm text-light"></div>
      </div>
      
      <div v-else-if="error" class="text-danger small text-center">
        {{ error }}
      </div>
      
      <div v-else class="market-items">
        <div 
          v-for="item in data" 
          :key="item.simbolo"
          class="market-item d-flex justify-content-between align-items-center py-1"
        >
          <span class="text-white-50 small">{{ item.simbolo }}</span>
          <div class="text-end">
            <span class="text-white small">${{ formatPrice(item.precio) }}</span>
            <span 
              class="ms-2 small"
              :class="item.variacion >= 0 ? 'text-success' : 'text-danger'"
            >
              {{ item.variacion >= 0 ? '+' : '' }}{{ item.variacion.toFixed(2) }}%
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="lastUpdate" class="text-white-50 small text-end mt-2">
        <i class="bi bi-clock"></i> {{ formatTime(lastUpdate) }}
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    data: {
      type: Array,
      default: () => []
    },
    loading: Boolean,
    error: String,
    lastUpdate: Date,
    showRefresh: {
      type: Boolean,
      default: true
    }
  })
  
  defineEmits(['refresh'])
  
  const formatPrice = (price) => {
    if (!price) return '0.00'
    if (price > 1000) {
      return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    }
    return price.toFixed(2)
  }
  
  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  </script>
  
  <style scoped>
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .market-item {
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  
  .market-item:last-child {
    border-bottom: none;
  }
  </style>