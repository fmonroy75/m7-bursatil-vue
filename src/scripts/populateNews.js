// src/scripts/populateNews.js
// Script para agregar noticias de ejemplo a Firebase
// Ejecutar con: node src/scripts/populateNews.js

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import process from 'process'

// Configuración de Firebase (usa la misma que en tu .env)
const firebaseConfig = {
  apiKey: 'AIzaSyA6bp8UuD06YRz_-n2CMHfIn-A-mrxnZ9o',
  authDomain: 'simulador-bursatil-clase.firebaseapp.com',
  projectId: 'simulador-bursatil-clase',
  storageBucket: 'simulador-bursatil-clase.firebasestorage.app',
  messagingSenderId: '952540075302',
  appId: '1:952540075302:web:b8af70a28c40ba0e895de7',
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Noticias de ejemplo
const sampleNews = [
  {
    title: 'Apple anuncia el iPhone 16 con inteligencia artificial revolucionaria',
    summary:
      'La compañía de Cupertino presentó su nuevo dispositivo con capacidades de IA sin precedentes.',
    content: `
      <p>Apple ha presentado hoy el iPhone 16, el dispositivo más avanzado de su historia. Con un nuevo chip A18 Pro y capacidades de inteligencia artificial integradas directamente en el hardware, el nuevo iPhone promete revolucionar la forma en que interactuamos con nuestros dispositivos.</p>
      <p>Las acciones de Apple subieron un 3% tras el anuncio, alcanzando un nuevo máximo histórico.</p>
      <h3>Características principales:</h3>
      <ul>
        <li>Chip A18 Pro con Neural Engine de 32 núcleos</li>
        <li>Cámara de 48MP con zoom óptico de 5x</li>
        <li>Batería con 30% más de duración</li>
        <li>iOS 18 con integración de ChatGPT</li>
      </ul>
    `,
    category: 'Tecnología',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date().toISOString(),
    views: 0,
  },
  {
    title: 'Fed recorta tasas de interés por primera vez en 4 años',
    summary:
      'La Reserva Federal anunció un recorte de 25 puntos básicos, buscando estimular la economía.',
    content: `
      <p>La Reserva Federal de Estados Unidos anunció hoy un recorte de 25 puntos básicos en las tasas de interés, la primera reducción en cuatro años. La decisión fue unánime y responde a señales de desaceleración económica.</p>
      <p>El presidente de la Fed, Jerome Powell, indicó que "la inflación ha mostrado signos de moderación, permitiéndonos ajustar la política monetaria para apoyar el crecimiento".</p>
      <p>Los mercados reaccionaron positivamente, con el S&P 500 subiendo un 1.5% y el Nasdaq avanzando un 2%.</p>
    `,
    category: 'Economía',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    views: 0,
  },
  {
    title: 'Tesla revoluciona el mercado con batería de 1 millón de millas',
    summary:
      'La nueva tecnología de batería de Tesla promete durar toda la vida útil del vehículo.',
    content: `
      <p>Tesla ha presentado una nueva batería que promete durar 1 millón de millas (1.6 millones de kilómetros), prácticamente la vida útil completa de un vehículo.</p>
      <p>Esta innovación reduce drásticamente el costo total de propiedad de los vehículos eléctricos y podría acelerar la transición hacia el transporte sostenible.</p>
      <p>Elon Musk, CEO de Tesla, declaró: "Esta es la batería que cambiará el mundo. Los coches eléctricos serán más baratos y durarán más que los de combustión".</p>
    `,
    category: 'Empresas',
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    views: 0,
  },
  {
    title: 'NVIDIA supera los 3 billones de dólares en capitalización',
    summary: 'El fabricante de chips se convierte en la tercera empresa más valiosa del mundo.',
    content: `
      <p>NVIDIA ha alcanzado una capitalización de mercado de 3 billones de dólares, impulsada por la demanda sin precedentes de sus chips para inteligencia artificial.</p>
      <p>La compañía ahora solo es superada por Microsoft y Apple en el ranking de empresas más valiosas del mundo.</p>
      <p>Los analistas proyectan que el mercado de chips de IA seguirá creciendo a tasas del 40% anual durante los próximos años.</p>
    `,
    category: 'Tecnología',
    imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    views: 0,
  },
  {
    title: 'Bitcoin alcanza nuevo récord sobre los $100,000',
    summary: 'La criptomoneda líder supera la barrera psicológica de los seis dígitos.',
    content: `
      <p>Bitcoin ha superado los $100,000 por primera vez en su historia, alcanzando un nuevo récord de $102,000. La criptomoneda ha subido un 150% en lo que va del año.</p>
      <p>Los analistas atribuyen este rally a la aprobación de ETFs de Bitcoin en Estados Unidos y al creciente interés institucional.</p>
      <p>Ethereum y otras criptomonedas también han registrado fuertes ganancias.</p>
    `,
    category: 'Mercados',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    views: 0,
  },
]

// Función para poblar la base de datos
async function populateNews() {
  console.log('📝 Agregando noticias de ejemplo a Firebase...')

  const newsCollection = collection(db, 'news')

  for (const news of sampleNews) {
    try {
      const docRef = await addDoc(newsCollection, news)
      console.log(`✅ Noticia agregada: ${news.title} (ID: ${docRef.id})`)
    } catch (error) {
      console.error(`❌ Error agregando noticia: ${news.title}`, error.message)
    }
  }

  console.log('🎉 Proceso completado!')
  process.exit(0)
}

// Ejecutar
populateNews().catch((error) => {
  console.error('Error fatal:', error)
  process.exit(1)
})
