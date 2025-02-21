import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import ServiciosPage from '../components/ServiciosPage.vue'
import DashboardCliente from '../components/Dashboardcliente.vue'
import ConfiguracionUsuarioCliente from '../components/ConfiguracionUsuarioCliente.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginForm
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterForm
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardCliente
  },
  {
    path: '/servicios',
    name: 'servicios',
    component: ServiciosPage
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    component: ConfiguracionUsuarioCliente
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router