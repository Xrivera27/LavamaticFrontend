import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import ServiciosPage from '../components/ServiciosPageCliente.vue'
import DashboardCliente from '../components/Dashboardcliente.vue'
import ConfiguracionUsuario from '../components/ConfiguracionUsuarioCliente.vue'
import HistorialPedidos from '../components/HistorialPedidoCliente.vue'
import DashboardAdmin from '../components/DashboardAdmin.vue'
import crearRepartidor from '../components/crearRepartidor.vue'
import crearCliente from '../components/crearCliente.vue'

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
  // Rutas de cliente
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
    path: '/historial',
    name: 'historial',
    component: HistorialPedidos
  },
  {
    path: '/configuracion',
    name: 'configuracion',
    component: ConfiguracionUsuario
  },
  // Rutas de administrador
  {
    path: '/admin/dashboard',
    name: 'adminDashboard',
    component: DashboardAdmin
  },
  {
    path: '/admin/repartidores/crear',
    name: 'adminCrearRepartidor',
    component: crearRepartidor
  },
  // Usar el mismo componente para ambas rutas
  {
    path: '/admin/clientes',
    name: 'adminClientes',
    component: crearCliente
  },
  {
    path: '/admin/clientes/crear',
    name: 'adminCrearCliente',
    component: crearCliente
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Middleware para protección de rutas
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const userRole = parseInt(localStorage.getItem('userRole'));

  // Si requiere autenticación y no está logueado
  if (authRequired && !localStorage.getItem('token')) {
    return next('/login');
  }

  // Proteger rutas de admin
  if (to.path.startsWith('/admin') && userRole !== 1) {
    return next('/dashboard');
  }

  // Proteger rutas de cliente
  if (!to.path.startsWith('/admin') && 
      !publicPages.includes(to.path) && 
      userRole === 1) {
    return next('/admin/dashboard');
  }

  next();
});

export default router