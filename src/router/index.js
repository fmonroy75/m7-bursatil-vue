import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TrendsView from '../views/TrendsView.vue'
import HistoryView from '../views/HistoryView.vue'

const routes = [
  { path: '/', component: DashboardView },
  { path: '/trends', component: TrendsView },
  { path: '/history', component: HistoryView },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
    // Meta: solo para no autenticados (si ya está logueado, que no vea el login)
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    // *** RUTA PROTEGIDA ***
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    // *** RUTA PROTEGIDA ***
    meta: { requiresAuth: true },
  },  
  {
    path: '/create-profile',
    name: 'createProfile',
    component: () => import('@/views/CreateProfile.vue'),
    meta: { requiresAuth: true, requiresProfile: false }
  },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
