// src/scripts/populateNewsAdvanced.js
// Script para agregar noticias avanzadas de ejemplo a Firebase
// Ejecutar con: node src/scripts/populateNewsAdvanced.js

import process from 'process'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

// Configuración de Firebase
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

// Noticias de ejemplo con temas de actualidad
const sampleNews = [
  {
    title: 'Conflicto en Medio Oriente: Impacto en los precios del petróleo y mercados globales',
    summary:
      'Las tensiones entre Israel y Hamas elevan el precio del crudo y generan incertidumbre en los mercados financieros internacionales.',
    content: `
      <p>El conflicto en Medio Oriente ha escalado significativamente en las últimas semanas, con enfrentamientos entre Israel y Hamas que han captado la atención mundial. Esta situación geopolítica tiene profundas implicaciones económicas que trascienden las fronteras de la región.</p>

      <h3>Impacto en el precio del petróleo</h3>
      <p>El precio del barril de petróleo ha experimentado un aumento del 12% desde el inicio de las hostilidades, superando los $95 dólares. Los analistas advierten que si el conflicto se extiende a países productores clave como Irán o Arabia Saudita, podríamos ver precios superiores a los $120 por barril.</p>

      <h3>Efecto en los mercados bursátiles</h3>
      <p>Los índices bursátiles globales han mostrado volatilidad, con el S&P 500 cayendo un 2.3% en la última semana. Los inversores buscan refugio en activos tradicionales como el oro y el dólar estadounidense.</p>

      <h3>Consecuencias para Chile</h3>
      <p>Chile, como importador neto de petróleo, enfrenta presiones inflacionarias adicionales. El precio de los combustibles podría aumentar hasta un 15% en las próximas semanas, afectando el transporte y el costo de vida.</p>

      <p>Expertos de la CEPAL sugieren que este conflicto podría reducir el crecimiento de América Latina en 0.5 puntos porcentuales durante 2025.</p>
    `,
    category: 'Política',
    imageUrl: 'https://images.unsplash.com/photo-1581291881321-56dee1d7d4e1?q=80',
    author: 'Christopher Espinoza',
    publishedAt: new Date().toISOString(),
    views: 0,
    region: 'Internacional',
    tags: ['petróleo', 'geopolítica', 'mercados', 'Israel', 'Hamas'],
  },
  {
    title: 'Cambio de mando en Chile: Nuevo presidente y sus desafíos económicos',
    summary:
      'La transición presidencial en Chile marca el inicio de una nueva era con desafíos en reforma tributaria, pensiones y el desarrollo de la industria del litio.',
    content: `
      <p>Chile vive un momento histórico con la ceremonia de cambio de mando presidencial en Valparaíso. El nuevo mandatario asume en un contexto de desafíos económicos y sociales que marcarán la agenda de los próximos años.</p>

      <h3>Reforma tributaria: el gran desafío</h3>
      <p>Una de las promesas centrales de campaña fue la reforma tributaria, que busca recaudar el 4.5% del PIB para financiar programas sociales. La propuesta incluye:</p>
      <ul>
        <li>Aumento del impuesto a las grandes empresas del 27% al 30%</li>
        <li>Royalty minero del 3% sobre las ventas de cobre y litio</li>
        <li>Impuesto a los patrimonios superiores a $5 millones de dólares</li>
        <li>Reducción de exenciones tributarias</li>
      </ul>

      <h3>Royalty minero y litio: la oportunidad chilena</h3>
      <p>Chile posee las mayores reservas de litio del mundo, un mineral crítico para la transición energética global. El nuevo gobierno propone:</p>
      <ul>
        <li>Creación de la Empresa Nacional del Litio</li>
        <li>Asociaciones público-privadas para agregar valor</li>
        <li>Producción de baterías e insumos para vehículos eléctricos</li>
      </ul>

      <h3>Tierras raras: el próximo desafío</h3>
      <p>Además del litio, Chile posee importantes reservas de tierras raras, elementos esenciales para la fabricación de imanes, turbinas eólicas y dispositivos electrónicos. El gobierno anunció un plan de exploración y explotación sostenible.</p>

      <p>El ministro de Hacienda declaró: "Este es el momento de Chile. Tenemos los recursos que el mundo necesita y la oportunidad de dar un salto al desarrollo".</p>
    `,
    category: 'Política',
    imageUrl: 'https://images.unsplash.com/photo-1640119840422-39e232dd4eb5?q=80',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
    views: 0,
    region: 'Chile',
    tags: ['Chile', 'presidencia', 'reforma tributaria', 'litio', 'tierras raras'],
  },
  {
    title: 'Tierras raras en Chile: El nuevo tesoro minero que busca explotar el gobierno',
    summary:
      'Chiel posee importantes reservas de tierras raras, esenciales para la tecnología verde y la defensa. El gobierno anuncia plan de exploración y explotación.',
    content: `
      <p>Las tierras raras son un grupo de 17 elementos químicos esenciales para la fabricación de tecnologías modernas, desde teléfonos móviles hasta motores de aviones y sistemas de defensa. Chile, conocido por su cobre y litio, también alberga importantes reservas de estos minerales estratégicos.</p>

      <h3>¿Qué son las tierras raras?</h3>
      <p>A pesar de su nombre, no son particularmente escasas, pero su extracción y procesamiento son complejos. Incluyen elementos como el neodimio (para imanes potentes), el disprosio (para láseres) y el terbio (para dispositivos electrónicos).</p>

      <h3>Reservas chilenas</h3>
      <p>Estudios preliminares del SERNAGEOMIN indican la presencia de tierras raras en las regiones de Atacama y Coquimbo, con un potencial económico estimado en $50 mil millones de dólares. Los principales yacimientos se encuentran en:</p>
      <ul>
        <li>Depósito de Penco (Región del Biobío): uno de los más grandes de Sudamérica</li>
        <li>Yacimientos en la Cordillera de la Costa</li>
        <li>Depósitos asociados a faenas mineras existentes</li>
      </ul>

      <h3>Plan de explotación</h3>
      <p>El gobierno anunció un plan en tres etapas:</p>
      <ol>
        <li><strong>Exploración (2025-2026):</strong> Mapeo detallado y estudios de factibilidad</li>
        <li><strong>Desarrollo tecnológico (2026-2027):</strong> Creación de capacidades de procesamiento</li>
        <li><strong>Explotación comercial (2028 en adelante):</strong> Producción a gran escala</li>
      </ol>

      <h3>Impacto económico</h3>
      <p>La explotación de tierras raras podría agregar hasta un 1.5% al PIB chileno y generar miles de empleos altamente calificados. Además, reduciría la dependencia de China, que actualmente controla el 80% de la producción mundial.</p>

      <p>"Es una oportunidad histórica para diversificar nuestra matriz productiva", señaló el ministro de Minería.</p>
    `,
    category: 'Economía',
    imageUrl: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // Anteayer
    views: 0,
    region: 'Chile',
    tags: ['tierras raras', 'minería', 'tecnología', 'inversión', 'Chile'],
  },
  {
    title: 'Guerra comercial: China y Estados Unidos se disputan el control del litio chileno',
    summary:
      'La puja entre las dos superpotencias por asegurar suministros de litio pone a Chile en el centro de la geopolítica global de la transición energética.',
    content: `
      <p>La transición energética global ha desatado una guerra comercial silenciosa por el control de los minerales críticos. Chile, dueño de las mayores reservas de litio del mundo, se encuentra en el centro de esta disputa entre China y Estados Unidos.</p>

      <h3>El litio: el nuevo petróleo</h3>
      <p>El litio es esencial para la fabricación de baterías de vehículos eléctricos y sistemas de almacenamiento de energía. Se estima que la demanda mundial se multiplicará por 10 para 2030, alcanzando los 2 millones de toneladas anuales.</p>

      <h3>China: dominio actual</h3>
      <p>Actualmente, China controla el 60% del procesamiento global de litio y el 70% de la producción de baterías. Empresas como Tianqi Lithium y Ganfeng Lithium han invertido miles de millones en Chile, adquiriendo participaciones en SQM, la segunda productora más grande del país.</p>

      <h3>Estados Unidos: contraofensiva</h3>
      <p>La administración Biden ha lanzado la "Ley de Reducción de la Inflación" (IRA), que ofrece subsidios masivos para vehículos eléctricos ensamblados en Norteamérica con baterías fabricadas con minerales de países con tratados de libre comercio. Esto beneficia a Chile, que tiene TLC con EE.UU.</p>

      <h3>La estrategia chilena</h3>
      <p>El gobierno chileno busca equilibrar ambas potencias mediante:</p>
      <ul>
        <li>La creación de la Empresa Nacional del Litio, con control estatal</li>
        <li>Asociaciones público-privadas que diversifiquen los socios</li>
        <li>Inversión en agregación de valor (producción de baterías)</li>
        <li>Negociación de acuerdos comerciales con la Unión Europea y otros bloques</li>
      </ul>

      <p>"No queremos ser meros proveedores de materia prima. Aspiramos a industrializar nuestro litio y convertirnos en un hub tecnológico", declaró el vicepresidente de CORFO.</p>
    `,
    category: 'Economía',
    imageUrl: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
    views: 0,
    region: 'Chile',
    tags: ['litio', 'China', 'EEUU', 'guerra comercial', 'baterías'],
  },
  {
    title: 'Inflación en Chile: Banco Central mantiene tasa de interés en 5.25%',
    summary:
      'El instituto emisor decide mantener la tasa por tercera vez consecutiva, mientras la inflación muestra signos de moderación pero persisten riesgos externos.',
    content: `
      <p>El Banco Central de Chile anunció la decisión de mantener la tasa de interés de política monetaria en 5.25% anual, en línea con las expectativas del mercado. Esta es la tercera reunión consecutiva sin cambios, tras un agresivo ciclo de bajas que redujo la tasa desde el 11.25% en 2023.</p>

      <h3>Contexto inflacionario</h3>
      <p>La inflación interanual se ubicó en 3.8% en febrero, dentro del rango meta del Banco Central (3% +/- 1%). Sin embargo, la inflación subyacente (sin alimentos ni energía) se mantiene en 4.2%, mostrando ciertas rigideces.</p>

      <h3>Riesgos externos</h3>
      <p>El consejo del Banco Central identificó varios riesgos que podrían afectar la trayectoria inflacionaria:</p>
      <ul>
        <li>Conflicto en Medio Oriente y su impacto en el precio del petróleo</li>
        <li>Guerra comercial China-EE.UU. por minerales críticos</li>
        <li>Política monetaria de la Reserva Federal y su efecto en el tipo de cambio</li>
        <li>Precio del cobre y su impacto en los términos de intercambio</li>
      </ul>

      <h3>Proyecciones</h3>
      <p>El IPoM (Informe de Política Monetaria) proyecta que la inflación cerrará 2025 en 3.5% y 2026 en 3.0%. Se espera que el Banco Central reanude las bajas de tasa en el segundo semestre, llevándola a 4.5% a fin de año.</p>

      <p>El ministro de Hacienda valoró la decisión: "La estabilidad macroeconómica es fundamental para atraer inversiones en litio y tierras raras".</p>
    `,
    category: 'Economía',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 345600000).toISOString(), // Hace 4 días
    views: 0,
    region: 'Chile',
    tags: ['Banco Central', 'inflación', 'tasa de interés', 'IPoM'],
  },
  {
    title: 'EE.UU. aprueba ley de inversión en minerales críticos: Chile será socio estratégico',
    summary:
      'La nueva legislación estadounidense prioriza acuerdos con países como Chile para asegurar el suministro de litio, cobre y tierras raras.',
    content: `
      <p>El Congreso de Estados Unidos aprobó la "Ley de Minerales Críticos para la Transición Energética", que destina $50 mil millones de dólares para asegurar cadenas de suministro de minerales esenciales como litio, cobre, tierras raras y grafito.</p>

      <h3>Chile como socio prioritario</h3>
      <p>La ley establece una categoría especial para países con tratados de libre comercio y estándares ambientales, donde Chile destaca como el principal proveedor de cobre y litio. Se espera que esto se traduzca en:</p>
      <ul>
        <li>Inversiones estadounidenses en exploración y explotación</li>
        <li>Transferencia tecnológica para procesamiento</li>
        <li>Financiamiento para infraestructura minera</li>
        <li>Acuerdos de compra a largo plazo</li>
      </ul>

      <h3>Reacción del gobierno chileno</h3>
      <p>El canciller chileno calificó la ley como "una oportunidad histórica" y anunció que se conformará un equipo negociador para maximizar los beneficios. "Chile puede convertirse en el proveedor confiable que Estados Unidos necesita", señaló.</p>

      <h3>Implicancias para el litio</h3>
      <p>La ley exige que para 2027, al menos el 60% de los minerales utilizados en vehículos eléctricos provengan de países con acuerdos comerciales. Esto beneficiará directamente a la producción chilena de litio, que actualmente abastece el 30% del mercado global.</p>

      <p>Analistas proyectan que esta ley podría aumentar las inversiones en Chile en $15 mil millones durante los próximos 5 años.</p>
    `,
    category: 'Internacional',
    imageUrl: 'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800',
    author: 'Christopher Espinoza',
    publishedAt: new Date(Date.now() - 432000000).toISOString(), // Hace 5 días
    views: 0,
    region: 'Internacional',
    tags: ['EEUU', 'inversión', 'minerales críticos', 'litio', 'cobre'],
  },
]

// Función para poblar la base de datos
async function populateNews() {
  //console.log('📝 Agregando noticias avanzadas de ejemplo a Firebase...')

  const newsCollection = collection(db, 'news')
  let successCount = 0
  let errorCount = 0

  for (const news of sampleNews) {
    try {
      const docRef = await addDoc(newsCollection, news)
      //console.log(`✅ Noticia agregada: ${news.title.substring(0, 50)}... (ID: ${docRef.id})`)
      successCount++
    } catch (error) {
      console.error(`❌ Error agregando noticia: ${news.title.substring(0, 50)}...`, error.message)
      errorCount++
    }
  }

  //console.log(`\n🎉 Proceso completado! ${successCount} exitosas, ${errorCount} errores`)
  process.exit(0)
}

// Ejecutar
populateNews().catch((error) => {
  console.error('Error fatal:', error)
  process.exit(1)
})
