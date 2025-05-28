<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="menu-toggle" @click="toggleSidebar" :title="isExpanded ? 'Contraer menú' : 'Expandir menú'">
      <i class="fas" :class="isExpanded ? 'fa-chevron-left' : 'fa-bars'"></i>
      <span class="nav-text">Menú</span>
    </div>
    <div class="nav-links">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path" 
        class="nav-item" 
        :class="{ active: currentRoute === item.routeName }" 
        :title="isExpanded ? null : item.label">
        <i :class="item.icon"></i>
        <span class="nav-text">{{ item.label }}</span>
      </router-link>
    </div>
    <div class="sidebar-footer">
      <div class="nav-item logout" 
           @click="logout"
           :title="isExpanded ? null : 'Cerrar Sesión'">
        <i class="fas fa-sign-out-alt"></i>
        <span class="nav-text">Cerrar Sesión</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarDinamico',
  data() {
    return {
      isExpanded: true // Por defecto expandido
    }
  },
  computed: {
    currentRoute() {
      return this.$route.name;
    },
    userRole() {
      const role = parseInt(sessionStorage.getItem('userRole'));
      // Mapear los roles numéricos a strings
      if (role === 1) return 'admin';
      if (role === 2) return 'cliente'; 
      if (role === 3) return 'repartidor';
      return null;
    },
    menuItems() {
      const menus = {
        admin: [
          { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', routeName: 'adminDashboard' },
          { path: '/admin/repartidores/crear', label: 'Crear Repartidor', icon: 'fas fa-user-plus', routeName: 'adminCrearRepartidor' },
          { path: '/admin/clientes', label: 'Clientes', icon: 'fas fa-users', routeName: 'adminClientes' },
          { path: '/admin/inventario', label: 'Inventario', icon: 'fas fa-boxes', routeName: 'adminInventario' },
          { path: '/admin/servicios', label: 'Servicios', icon: 'fas fa-concierge-bell', routeName: 'adminServicios' },
          { path: '/admin/mantenimiento', label: 'Mantenimiento', icon: 'fas fa-tools', routeName: 'adminMantenimiento' },
          { path: '/admin/pedidos', label: 'Pedidos', icon: 'fas fa-clipboard-list', routeName: 'adminPedidos' },
          { path: '/admin/reportes', label: 'Reportes', icon: 'fas fa-chart-bar', routeName: 'adminReportes' },
          { path: '/admin/configuser', label: 'Configuración', icon: 'fas fa-cog', routeName: 'configuser' }
        ],
        cliente: [
          { path: '/dashboard', label: 'Home', icon: 'fa-solid fa-house', routeName: 'dashboard' },
          { path: '/servicios', label: 'Servicios', icon: 'fa-solid fa-list-check', routeName: 'servicios' },
          { path: '/historial', label: 'Historial', icon: 'fa-solid fa-clock-rotate-left', routeName: 'historial' },
          { path: '/configuracion', label: 'Configuración', icon: 'fa-solid fa-gear', routeName: 'configuracion' }
        ],
        repartidor: [
          { path: '/repartidor/pedidos', label: 'Pedidos', icon: 'fas fa-inbox', routeName: 'repartidorPedidos' },
          { path: '/repartidor/configuracion', label: 'Configuración', icon: 'fas fa-cog', routeName: 'repartidorConfiguracion' }
        ]
      };
      
      return menus[this.userRole] || [];
    }
  },
  mounted() {
    // Cargar estado del sidebar desde sessionStorage
    const savedState = sessionStorage.getItem('sidebarExpanded');
    if (savedState !== null) {
      this.isExpanded = savedState === 'true';
    }
    
    this.updateBodyPadding();
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    this.checkAuthentication();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    // Observar cambios en isExpanded para guardar en sessionStorage
    isExpanded(newValue) {
      sessionStorage.setItem('sidebarExpanded', newValue.toString());
      this.updateBodyPadding();
      this.$emit('sidebar-toggle', newValue);
    }
  },
  methods: {
    toggleSidebar() {
      // Permitir expandir/contraer en cualquier tamaño de pantalla
      this.isExpanded = !this.isExpanded;
    },
    updateBodyPadding() {
      if (window.innerWidth > 768) {
        // En escritorio usar el ancho según el estado actual
        document.body.style.paddingLeft = this.isExpanded ? 
          'var(--sidebar-width-expanded)' : 
          'var(--sidebar-width)';
      } else {
        // En móvil no usar padding cuando está contraído
        document.body.style.paddingLeft = this.isExpanded ? 
          'var(--sidebar-width-expanded)' : 
          '0';
      }
    },
    handleResize() {
      // En móvil, colapsar automáticamente si está expandido
      if (window.innerWidth <= 768 && this.isExpanded) {
        this.isExpanded = false;
      }
      // En escritorio, expandir si está colapsado (opcional)
      // if (window.innerWidth > 768 && !this.isExpanded) {
      //   this.isExpanded = true;
      // }
      
      this.updateBodyPadding();
    },
    logout() {
      // Limpiar sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('sidebarExpanded');
      
      // Redireccionar programáticamente y forzar recarga de la página
      this.$router.push('/login').then(() => {
        window.location.reload();
      });
    },
    checkAuthentication() {
      const token = sessionStorage.getItem('token');
      if (!token && this.$route.path !== '/login') {
        this.$router.push('/login');
      }
    }
  }
};
</script>

<style src="@/assets/css/SidebarDinamico.css" scoped></style>