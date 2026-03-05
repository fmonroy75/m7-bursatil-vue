<!-- src/components/PortfolioCard.vue -->
<template>
  <div class="portfolio-simple">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="text-white mb-0">
        <i class="bi bi-briefcase-fill me-2"></i>
        Mi Cartera
      </h5>
      <div class="d-flex align-items-center">
        <span class="badge bg-info me-2">{{ activosEnCartera.length }} Activos</span>
        <span class="text-white">
          <small class="text-white-50">Total:</small>
          <strong class="ms-1">${{ formatNumber(totalValor) }}</strong>
        </span>
      </div>
    </div>

    <!-- Lista de activos -->
    <div v-if="activosEnCartera.length === 0" class="text-center py-4 text-white-50">
      <i class="bi bi-briefcase fs-2"></i>
      <p class="mt-2">No tienes acciones en tu cartera</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-dark table-hover">
        <thead>
          <tr>
            <th>Activo</th>
            <th class="text-end">Cantidad</th>
            <th class="text-end">Precio Compra</th>
            <th class="text-end">Precio Actual</th>
            <th class="text-end">Inversión</th>
            <th class="text-end">Valor Actual</th>
            <th class="text-end">Ganancia</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activo in activosEnCartera" :key="activo.id">
            <!-- Activo -->
            <td>
              <div>
                <div class="fw-bold">{{ activo.nombre }}</div>
                <small class="text-white-50">{{ activo.simbolo.toUpperCase() }}</small>
              </div>
            </td>
            
            <!-- Cantidad (cantidad de acciones compradas/vendidas) -->
            <td class="text-end align-middle">
              <span class="badge bg-secondary">{{ activo.cantidad }}</span>
            </td>
            
            <!-- Precio Compra (precio al momento de la transacción) -->
            <td class="text-end align-middle text-warning">
              ${{ formatNumber(getPrecioCompra(activo.id)) }}
            </td>
            
            <!-- Precio Actual -->
            <td class="text-end align-middle text-primary">
              ${{ formatNumber(getPrecioActual(activo)) }}
            </td>
            
            <!-- Inversión (precio compra * cantidad) -->
            <td class="text-end align-middle">
              ${{ formatNumber(getInversion(activo.id)) }}
            </td>
            
            <!-- Valor Actual (precio actual * cantidad) -->
            <td class="text-end align-middle">
              ${{ formatNumber(getValorActual(activo)) }}
            </td>
            
            <!-- Ganancia (diferencia entre inversion y valor actual) -->
            <td class="text-end align-middle" :class="getGananciaClass(activo)">
              <div>${{ formatNumber(getGanancia(activo)) }}</div>
              <small>({{ getGananciaPorcentaje(activo) }}%)</small>
            </td>
          </tr>
        </tbody>
        <tfoot class="table-secondary">
          <tr>
            <th colspan="4" class="text-end">Totales:</th>
            <th class="text-end">${{ formatNumber(totalInversion) }}</th>
            <th class="text-end">${{ formatNumber(totalValor) }}</th>
            <th class="text-end" :class="totalGanancia >= 0 ? 'text-success' : 'text-danger'">
              ${{ formatNumber(totalGanancia) }} ({{ totalGananciaPorcentaje }}%)
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activosEnCartera: {
    type: Array,
    required: true
  },
  preciosActuales: {
    type: Object,
    default: () => ({})
  },
  historialTransacciones: {
    type: Array,
    default: () => []
  }
})

// ========== FUNCIONES POR ACTIVO ==========

// Precio de compra (precio al momento de la transacción)
// NOTA: Como puede haber múltiples compras a diferentes precios,
// mostramos el precio promedio ponderado
const getPrecioCompra = (assetId) => {
  const compras = props.historialTransacciones.filter(
    t => t.assetId === assetId && t.tipo === 'buy'
  )
  
  if (compras.length === 0) return 0
  
  // Si solo hay una compra, mostrar ese precio
  if (compras.length === 1) {
    return compras[0].precio
  }
  
  // Si hay múltiples compras, calcular promedio ponderado
  const totalCantidad = compras.reduce((sum, t) => sum + t.cantidad, 0)
  const totalCosto = compras.reduce((sum, t) => sum + (t.cantidad * t.precio), 0)
  
  return totalCosto / totalCantidad
}

// Precio actual (desde el mapa de precios)
const getPrecioActual = (activo) => {
  return props.preciosActuales[activo.id] || 
         props.preciosActuales[activo.simbolo] ||
         props.preciosActuales[activo.simbolo.toUpperCase()] ||
         props.preciosActuales[activo.simbolo.toLowerCase()] ||
         0
}

// Inversión (precio compra * cantidad)
const getInversion = (assetId) => {
  const compras = props.historialTransacciones.filter(
    t => t.assetId === assetId && t.tipo === 'buy'
  )
  return compras.reduce((sum, t) => sum + (t.cantidad * t.precio), 0)
}

// Valor Actual (precio actual * cantidad)
const getValorActual = (activo) => {
  return activo.cantidad * getPrecioActual(activo)
}

// Ganancia (diferencia entre inversion y valor actual)
const getGanancia = (activo) => {
  return getValorActual(activo) - getInversion(activo.id)
}

const getGananciaPorcentaje = (activo) => {
  const inversion = getInversion(activo.id)
  if (inversion === 0) return '0.00'
  return ((getGanancia(activo) / inversion) * 100).toFixed(2)
}

const getGananciaClass = (activo) => {
  return getGanancia(activo) >= 0 ? 'text-success' : 'text-danger'
}

// ========== TOTALES GLOBALES ==========

const totalInversion = computed(() => {
  return props.activosEnCartera.reduce((sum, activo) => {
    return sum + getInversion(activo.id)
  }, 0)
})

const totalValor = computed(() => {
  return props.activosEnCartera.reduce((sum, activo) => {
    return sum + getValorActual(activo)
  }, 0)
})

const totalGanancia = computed(() => {
  return totalValor.value - totalInversion.value
})

const totalGananciaPorcentaje = computed(() => {
  if (totalInversion.value === 0) return '0.00'
  return ((totalGanancia.value / totalInversion.value) * 100).toFixed(2)
})

// ========== UTILIDADES ==========

const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
.portfolio-simple {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.table {
  margin-bottom: 0;
  font-size: 0.95rem;
}

.table th {
  border-bottom-color: #404040;
  color: #aaa;
  font-weight: 500;
  white-space: nowrap;
}

.table td {
  border-bottom-color: #404040;
  vertical-align: middle;
}

.table tfoot th {
  border-top: 2px solid #404040;
  color: white;
}

.badge {
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .table {
    font-size: 0.85rem;
  }
  
  .table th, 
  .table td {
    padding: 0.5rem;
  }
  
  .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.4rem;
  }
}
</style>