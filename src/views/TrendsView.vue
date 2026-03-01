<template>
    <header class="dashboard-header">
      <div>
        <h2>🔥 Tendencias del Mercado</h2>
        <span class="subtitle">
          Criptomonedas más buscadas actualmente
        </span>
      </div>
  
      <button class="btn-refresh" @click="cargarTendencias">
        🔄 Actualizar
      </button>
    </header>
  
    <Loader v-if="loading" />
  
    <table v-if="trending.length" class="market-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Activo</th>
          <th>Símbolo</th>
          <th>Ranking Market Cap</th>
          <th>Precio BTC</th>
        </tr>
      </thead>
  
      <tbody>
        <tr v-for="(coin, index) in trending" :key="coin.item.id">
          <td>{{ index + 1 }}</td>
  
          <td>
            <img
              :src="coin.item.small"
              width="25"
              style="margin-right:10px"
            />
            <strong>{{ coin.item.name }}</strong>
          </td>
  
          <td>{{ coin.item.symbol.toUpperCase() }}</td>
  
          <td>#{{ coin.item.market_cap_rank }}</td>
  
          <td>{{ coin.item.price_btc.toFixed(8) }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import Loader from '../components/Loader.vue'
  
  const trending = ref([])
  const loading = ref(false)
  
  const cargarTendencias = async () => {
  loading.value = true

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending'
    )

    const data = await response.json()

    trending.value = data.coins.sort(
      (a, b) =>
        a.item.market_cap_rank - b.item.market_cap_rank
    )

  } catch (error) {
    alert('Error cargando tendencias')
  }

  loading.value = false
}
  onMounted(cargarTendencias)
  </script>
  