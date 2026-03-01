<template>
    <canvas ref="canvas"></canvas>
  </template>
  
  <script setup>
  import { onMounted, watch, ref } from 'vue'
  import Chart from 'chart.js/auto'
  
  const props = defineProps(['datos', 'labels'])
  
  const canvas = ref(null)
  let chartInstance = null
  
  const crearGrafico = () => {
    if (chartInstance) {
      chartInstance.destroy()
    }
  
    chartInstance = new Chart(canvas.value, {
      type: 'line',
      data: {
        labels: props.labels,
        datasets: [
          {
            label: 'Precio USD',
            data: props.datos,
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true
      }
    })
  }
  
  onMounted(crearGrafico)
  
  watch(() => props.datos, () => {
    crearGrafico()
  })
  </script>
  