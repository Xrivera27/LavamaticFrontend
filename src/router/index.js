// src/router/index.js
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
import gestionMantenimiento from '../components/Mantenimientoequipo.vue'
import gestionInventario from '../components/Inventarioequipo.vue'
import gestionServicios from '../components/Servicios.vue'
import ConfiguracionUsuarioAdmin from '../components/ConfiguracionUsuarioAdmin.vue'
import Pedidos from '../components/PedidosAdmin.vue'
import PedidosRepartidor from '../components/PedidosRepartidor.vue'
import ConfiguracionRepartidor from '../components/ConfiguracionUsuarioRepartidor.vue'
import HistorialRepartidor from '../components/HistorialRepartidor.vue'
import ReportesAdmin from '../components/ReportesAdmin.vue'

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
  // Nueva ruta para mantenimiento de equipos
  {
    path: '/admin/mantenimiento',
    name: 'adminMantenimiento',
    component: gestionMantenimiento
  },
  // Ruta para inventario de equipos
  {
    path: '/admin/inventario',
    name: 'adminInventario',
    component: gestionInventario
  },
  // Ruta para gestión de servicios
  {
    path: '/admin/servicios',
    name: 'adminServicios',
    component: gestionServicios
  },
  // Ruta para configuración de usuario admin
  {
    path: '/admin/configuser',
    name: 'configuser',
    component: ConfiguracionUsuarioAdmin
  },
  // Ruta para gestión de pedidos
  {
    path: '/admin/pedidos',
    name: 'adminPedidos',
    component: Pedidos
  },
  // Nueva ruta para reportes
  {
    path: '/admin/reportes',
    name: 'adminReportes',
    component: ReportesAdmin
  },
  // Rutas de repartidor
  {
    path: '/repartidor/pedidos',
    name: 'repartidorPedidos',
    component: PedidosRepartidor
  },
  {
    path: '/repartidor/configuracion',
    name: 'repartidorConfiguracion',
    component: ConfiguracionRepartidor
  },
  // Ruta para historial de repartidor
  {
    path: '/repartidor/historial',
    name: 'repartidorHistorial',
    component: HistorialRepartidor
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Middleware para protección de rutas - Actualizado para usar sessionStorage
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const userRole = parseInt(sessionStorage.getItem('userRole'));

  // Si requiere autenticación y no está logueado
  if (authRequired && !sessionStorage.getItem('token')) {
    return next('/login');
  }

  // Proteger rutas de admin
  if (to.path.startsWith('/admin') && userRole !== 1) {
    return next('/dashboard');
  }

  // Proteger rutas de repartidor
  if (to.path.startsWith('/repartidor') && userRole !== 3) {
    return next('/dashboard');
  }

  // Proteger rutas de cliente
  if (!to.path.startsWith('/admin') && 
      !to.path.startsWith('/repartidor') &&
      !publicPages.includes(to.path) && 
      userRole === 1) {
    return next('/admin/dashboard');
  }

  next();
});

export default router