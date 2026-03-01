<template>
    <table class="market-table">
      <thead>
        <tr>
          <th>Activo</th>
          <th>Precio (USD)</th>
          <th>Variación 24h</th>
          <th>Market Cap</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="asset in datos" :key="asset.id">
          <td>
            <img :src="asset.image" width="25" />
            <strong>{{ asset.name }}</strong>
          </td>
          <td>{{ format(asset.current_price) }}</td>
          <td
            :class="asset.price_change_percentage_24h >= 0 ? 'price-up' : 'price-down'"
          >
            {{ asset.price_change_percentage_24h.toFixed(2) }}%
          </td>
          <td>{{ format(asset.market_cap) }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  defineProps(['datos'])
  
  const format = val =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val)
  </script>
  