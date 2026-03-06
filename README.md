# 📈 Simulador Bursátil - Vue 3

![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)
![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

------------------------------------------------------------------------

## 📋 Descripción

Simulador bursátil desarrollado con **Vue 3** que permite a los usuarios
practicar inversiones en el mercado de valores **sin riesgo
financiero**.

La aplicación permite:

-   Comprar y vender activos
-   Consultar noticias financieras en tiempo real
-   Gestionar una cartera de inversiones
-   Registrar historial de transacciones
-   Visualizar datos del mercado

Este proyecto fue desarrollado con **Vue 3 + Vite + Firebase**
utilizando una arquitectura moderna basada en **Composition API y
Pinia**.
Proyecto optimizado para rendimiento: limpieza de logs y manejo de estados de carga para mejorar la experiencia del usuario

------------------------------------------------------------------------

# 🎯 Características Principales

### 🔐 Autenticación de Usuarios

Registro e inicio de sesión utilizando **Firebase Authentication**.

### 📊 Trading en Tiempo Real

Compra y venta de activos con precios obtenidos desde **CoinGecko API**.

### 📰 Portal de Noticias

Noticias financieras actualizadas mediante **NewsAPI**.

### 💰 Cartera de Inversiones

Seguimiento de inversiones, balance total y cálculo de
ganancias/pérdidas.

### 📜 Historial de Transacciones

Registro completo de operaciones de compra y venta.

### 📈 Datos de Mercado

Información de mercado obtenida desde **Alpha Vantage API**.

------------------------------------------------------------------------

# 🚀 Tecnologías Utilizadas

## Frontend

-   Vue 3 (Composition API)
-   Vite

## State Management

-   Pinia

## Routing

-   Vue Router

## Backend / Base de Datos

-   Firebase Authentication
-   Firebase Firestore

## Estilos

-   CSS3
-   Bootstrap Icons

## APIs Externas

  API             Uso
  --------------- --------------------------
  CoinGecko       Precios de criptomonedas
  NewsAPI         Noticias financieras
  Alpha Vantage   Datos de mercado

------------------------------------------------------------------------

# 📦 Instalación

## Prerrequisitos

-   Node.js **v18 o superior**
-   npm o yarn
-   Cuenta en **Firebase**
-   API Keys de servicios externos

------------------------------------------------------------------------

# ⚙️ Pasos de Instalación

## 1️⃣ Clonar el repositorio

``` bash
git clone https://github.com/fmonroy75/m7-bursatil-vue.git
cd simulador-bursatil
```

## 2️⃣ Instalar dependencias

``` bash
npm install
```

## 3️⃣ Configurar variables de entorno

Crear un archivo **.env** en la raíz del proyecto:

``` env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# News API
VITE_NEWS_API_KEY=tu_news_api_key
VITE_NEWS_API_URL=https://newsapi.org/v2

# Alpha Vantage API
VITE_ALPHA_VANTAGE_KEY=tu_alpha_vantage_key
VITE_ALPHA_VANTAGE_URL=https://www.alphavantage.co/query
```

------------------------------------------------------------------------

# 🔥 Configuración de Firebase

1.  Crear un proyecto en **Firebase Console**
2.  Activar **Authentication → Email/Password**
3.  Crear las siguientes colecciones en **Firestore**:

-   users
-   transacciones
-   news
-   comments
-   newsHistory
-   balances

------------------------------------------------------------------------

# ▶️ Ejecutar Proyecto

``` bash
npm run dev
```

------------------------------------------------------------------------

# 🏗️ Estructura del Proyecto

    src/
    ├── assets/
    ├── components/
    │   ├── BalanceCard.vue
    │   ├── FilterInput.vue
    │   ├── Loader.vue
    │   ├── MarketTable.vue
    │   ├── NewsCard.vue
    │   ├── NewsHistory.vue
    │   ├── PortfolioCard.vue
    │   └── SidebarMenu.vue
    │
    ├── config/
    │   └── constants.js
    │
    ├── router/
    │   └── index.js
    │
    ├── services/
    │   ├── alphaVantageApi.js
    │   ├── firebase.js
    │   └── newsApi.js
    │
    ├── stores/
    │   ├── auth.js
    │   ├── newsHistory.js
    │   └── trading.js
    │
    ├── utils/
    │   └── sanitize.js
    │
    ├── views/
    │   ├── DashboardView.vue
    │   ├── LoginView.vue
    │   ├── RegisterView.vue
    │   ├── ProfileView.vue
    │   ├── TradingView.vue
    │   ├── NewsPage.vue
    │   ├── NewsDetail.vue
    │   └── NewsHistoryPage.vue
    │
    ├── App.vue
    └── main.js

------------------------------------------------------------------------

# 🎮 Uso de la Aplicación

## 1. Registro e Inicio de Sesión

-   Crear cuenta con email y contraseña
-   Completar perfil de usuario
-   Recibir saldo inicial de **\$10,000** para operar

------------------------------------------------------------------------

## 2. Dashboard

Muestra:

-   Resumen del mercado
-   Datos de criptomonedas
-   Balance total del usuario

------------------------------------------------------------------------

## 3. Trading

-   Compra y venta de activos
-   Precios en tiempo real desde **CoinGecko**
-   Validación automática de saldo

------------------------------------------------------------------------

## 4. Noticias Financieras

-   Noticias por categoría
-   Historial de noticias vistas
-   Sistema de comentarios

------------------------------------------------------------------------

## 5. Cartera

-   Seguimiento de inversiones
-   Ganancias / pérdidas
-   Historial de transacciones

------------------------------------------------------------------------

# 🔧 Scripts Disponibles

``` bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Deploy a GitHub Pages
npm run deploy
```

------------------------------------------------------------------------

# 🌐 APIs Utilizadas

## CoinGecko

-   Precios de criptomonedas en tiempo real
-   Límite gratuito: **50 requests/minuto**

## NewsAPI

-   Noticias financieras
-   Límite gratuito: **100 requests/día**

## Alpha Vantage

-   Datos de mercado
-   Límite gratuito:
    -   5 requests/minuto
    -   500 requests/día

------------------------------------------------------------------------

# 🗄️ Estructura de Firestore

## balances

``` javascript
{
  userId: string,
  amount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## transacciones

``` javascript
{
  userId: string,
  assetId: string,
  assetName: string,
  assetSymbol: string,
  tipo: 'buy' | 'sell',
  cantidad: number,
  precio: number,
  total: number,
  fecha: timestamp
}
```

## newsHistory

``` javascript
{
  userId: string,
  newsId: string,
  newsTitle: string,
  newsCategory: string,
  viewedAt: timestamp
}
```

## comments

``` javascript
{
  newsId: string,
  author: string,
  content: string,
  userId: string,
  createdAt: timestamp
}
```

------------------------------------------------------------------------

# 🚀 Despliegue en GitHub Pages

Instalar **gh-pages**

``` bash
npm install --save-dev gh-pages
```

Agregar script en **package.json**

``` json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

Configurar **vite.config.js**

``` javascript
export default defineConfig({
  plugins: [vue()],
  base: '/nombre-de-tu-repo/',
})
```

Desplegar

``` bash
npm run build
npm run deploy
```

------------------------------------------------------------------------

# 🤝 Contribuciones

Las contribuciones son bienvenidas.

1.  Fork del proyecto
2.  Crear rama

``` bash
git checkout -b feature/AmazingFeature
```

3.  Commit

``` bash
git commit -m "Add AmazingFeature"
```

4.  Push

``` bash
git push origin feature/AmazingFeature
```

5.  Crear Pull Request

------------------------------------------------------------------------

# 📄 Licencia

Este proyecto está bajo la **Licencia MIT**.

------------------------------------------------------------------------

# 🙌 Agradecimientos

-   Vue.js
-   Firebase
-   CoinGecko
-   NewsAPI
-   Alpha Vantage

------------------------------------------------------------------------

# 📞 Contacto

**Autor:** Francisco Monroy
**GitHub:** https://github.com/fmonroy75/m7-bursatil-vue

------------------------------------------------------------------------

⭐ Si este proyecto te fue útil, ¡no olvides darle una estrella en
GitHub!