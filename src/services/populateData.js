// src/services/populateData.js
import { db } from './firebase'
import { collection, addDoc } from 'firebase/firestore'

// Datos de ejemplo para activos financieros
const activosIniciales = [
  {
    nombre: 'Apple Inc.',
    simbolo: 'AAPL',
    precio: 175.5,
    variacion: 2.5,
    sector: 'Tecnología',
  },
  {
    nombre: 'Microsoft',
    simbolo: 'MSFT',
    precio: 420.3,
    variacion: 1.2,
    sector: 'Tecnología',
  },
  {
    nombre: 'Google',
    simbolo: 'GOOGL',
    precio: 145.8,
    variacion: -0.8,
    sector: 'Tecnología',
  },
  {
    nombre: 'Amazon',
    simbolo: 'AMZN',
    precio: 185.2,
    variacion: 3.1,
    sector: 'Consumo',
  },
  {
    nombre: 'Tesla',
    simbolo: 'TSLA',
    precio: 240.15,
    variacion: -1.5,
    sector: 'Automotriz',
  },
  {
    nombre: 'Meta',
    simbolo: 'META',
    precio: 480.75,
    variacion: 4.2,
    sector: 'Tecnología',
  },
  {
    nombre: 'NVIDIA',
    simbolo: 'NVDA',
    precio: 950.2,
    variacion: 5.3,
    sector: 'Tecnología',
  },
  {
    nombre: 'Coca-Cola',
    simbolo: 'KO',
    precio: 65.3,
    variacion: 0.5,
    sector: 'Consumo',
  },
  {
    nombre: 'Pfizer',
    simbolo: 'PFE',
    precio: 28.45,
    variacion: -0.2,
    sector: 'Salud',
  },
]

// Función para poblar la base de datos
export const poblarActivos = async () => {
  //console.log('🔄 Iniciando población de activos...')

  try {
    const coleccion = collection(db, 'activos')
    let contador = 0

    for (const activo of activosIniciales) {
      await addDoc(coleccion, activo)
      contador++
      //console.log(`✅ Agregado: ${activo.nombre} (${activo.simbolo})`)
    }

    //console.log(`🎉 ¡Éxito! Se agregaron ${contador} activos a Firestore`)
    return { success: true, count: contador }
  } catch (error) {
    console.error('❌ Error poblando datos:', error)
    return { success: false, error: error.message }
  }
}

// Para ejecutar desde la consola del navegador
if (import.meta.env.DEV) {
  window.poblarActivos = poblarActivos
  //console.log('📢 Para poblar la base de datos, escriba en la consola: await poblarActivos()')
}
