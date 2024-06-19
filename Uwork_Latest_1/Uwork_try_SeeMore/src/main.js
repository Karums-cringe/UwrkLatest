import './assets/main.css'
import { createWebHistory, createRouter } from 'vue-router'
import { createApp } from 'vue'
import App from './App.vue'

import Home from './pages/Home.vue'
import Favorites from './pages/Favorites.vue'
import JobDetail from './pages/JobDetail.vue'
import Profile from './pages/Profile.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/favorites', component: Favorites, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }, // Redirect to home if no such route
  { path: '/jobs/:id', component: JobDetail },
  { path: '/Profile', component: Profile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})

async function login() {
  try {
    const response = await fetch('http://localhost:5000/login', {})
    if (response.ok) {
      const token = response.headers.get('Set-Cookie').split(';')[0]
      localStorage.setItem('token', token)
    } else {
      console.error('Login failed')
    }
  } catch (error) {
    console.error('Error logging in:', error)
  }
}

function getToken() {
  return localStorage.getItem('token')
}
