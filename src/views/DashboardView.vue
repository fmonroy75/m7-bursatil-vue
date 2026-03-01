<template>
    <header class="dashboard-header">
      <div>
        <h2>📊 Mercado en Vivo</h2>
        <span class="subtitle">Top activos por capitalización</span>
      </div>
      <button class="btn-refresh" @click="cargarDatos">
        🔄 Actualizar
      </button>
    </header>
  
    <p class="last-update">
      Última actualización: {{ ultimaActualizacion }}
    </p>
  
    <Loader v-if="loading" />
  
    <FilterInput v-model="filtro" />
  
    <MarketTable :datos="datosFiltrados" />
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import MarketTable from '../components/MarketTable.vue'
  import Loader from '../components/Loader.vue'
  import FilterInput from '../components/FilterInput.vue'
  
  const datos = ref([])
  const loading = ref(false)
  const filtro = ref('')
  const ultimaActualizacion = ref('—')
  
  const cargarDatos = async () => {
    loading.value = true
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    )
    datos.value = await response.json()
    ultimaActualizacion.value = new Date().toLocaleString()
    loading.value = false
  }
  
  const datosFiltrados = computed(() =>
    datos.value.filter(c =>
      c.name.toLowerCase().startsWith(filtro.value.toLowerCase()) ||
      c.symbol.toLowerCase().startsWith(filtro.value.toLowerCase())
    )
  )
  
  onMounted(cargarDatos)
  </script>
  