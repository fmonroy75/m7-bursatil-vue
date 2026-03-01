<template>
    <h2>📜 Historial de Mercado</h2>
  
    <!-- Buscador -->
    <input
      class="input-filter"
      type="text"
      placeholder="🔍 Buscar moneda (ej: bitcoin)"
      v-model="moneda"
    />
  
    <!-- Selector de rango -->
    <div style="margin: 15px 0">
      <label>
        <input type="radio" value="3" v-model="dias" />
        3 días atrás
      </label>
  
      <label style="margin-left: 15px">
        <input type="radio" value="7" v-model="dias" />
        7 días atrás
      </label>
  
      <label style="margin-left: 15px">
        <input type="radio" value="30" v-model="dias" />
        1 mes
      </label>
    </div>
  
    <button class="btn-refresh" @click="buscarHistorial">
      📊 Buscar
    </button>
  
    <Loader v-if="loading" />
  
    <HistoryChart
      v-if="precios.length"
      :datos="precios"
      :labels="labels"
    />
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import HistoryChart from '../components/HistoryChart.vue'
  import Loader from '../components/Loader.vue'
  
  const moneda = ref('')
  const dias = ref('7')
  const precios = ref([])
  const labels = ref([])
  const loading = ref(false)
  
  const buscarHistorial = async () => {
    if (!moneda.value) return
  
    loading.value = true
  
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${moneda.value.toLowerCase()}/market_chart?vs_currency=usd&days=${dias.value}`
      )
  
      if (!response.ok) throw new Error('Moneda no encontrada')
  
      const data = await response.json()
  
      precios.value = data.prices.map(p => p[1])
      labels.value = data.prices.map(p =>
        new Date(p[0]).toLocaleDateString()
      )
  
    } catch (error) {
      alert('No se encontró la moneda. Ejemplo válido: bitcoin')
    }
  
    loading.value = false
  }
  </script>
  