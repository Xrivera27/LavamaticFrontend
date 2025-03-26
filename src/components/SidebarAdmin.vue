<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="nav-links">
      <div class="menu-toggle" @click="toggleSidebar" :title="isExpanded ? null : 'Menú'">
        <i class="fas" :class="isExpanded ? 'fa-chevron-left' : 'fa-bars'"></i>
        <span class="nav-text">Menú</span>
      </div>
      <router-link to="/admin/dashboard" class="nav-item" 
                   :class="{ active: currentRoute === 'adminDashboard' }" 
                   :title="isExpanded ? null : 'Dashboard'">
        <i class="fas fa-tachometer-alt"></i>
        <span class="nav-text">Dashboard</span>
      </router-link>
      <router-link to="/admin/repartidores/crear" class="nav-item" 
                   :class="{ active: currentRoute === 'adminCrearRepartidor' }"
                   :title="isExpanded ? null : 'Repartidores'">
        <i class="fas fa-user-plus"></i>
        <span class="nav-text">Crear Repartidor</span>
      </router-link>
      <router-link to="/admin/clientes" class="nav-item" 
                   :class="{ active: currentRoute === 'adminClientes' }"
                   :title="isExpanded ? null : 'Clientes'">
        <i class="fas fa-users"></i>
        <span class="nav-text">Clientes</span>
      </router-link>
      <router-link to="/admin/inventario" class="nav-item" 
                   :class="{ active: currentRoute === 'adminInventario' }"
                   :title="isExpanded ? null : 'Inventario'">
        <i class="fas fa-boxes"></i>
        <span class="nav-text">Inventario</span>
      </router-link>
      <router-link to="/admin/servicios" class="nav-item" 
                   :class="{ active: currentRoute === 'adminServicios' }"
                   :title="isExpanded ? null : 'Servicios'">
        <i class="fas fa-concierge-bell"></i>
        <span class="nav-text">Servicios</span>
      </router-link>
      <router-link to="/admin/mantenimiento" class="nav-item" 
                   :class="{ active: currentRoute === 'adminMantenimiento' }"
                   :title="isExpanded ? null : 'Mantenimiento'">
        <i class="fas fa-tools"></i>
        <span class="nav-text">Mantenimiento</span>
      </router-link>
      <router-link to="/admin/pedidos" class="nav-item" 
                   :class="{ active: currentRoute === 'adminPedidos' }"
                   :title="isExpanded ? null : 'Pedidos'">
        <i class="fas fa-clipboard-list"></i>
        <span class="nav-text">Pedidos</span>
      </router-link>
      <!-- Nuevo enlace a Reportes -->
      <router-link to="/admin/reportes" class="nav-item" 
                   :class="{ active: currentRoute === 'adminReportes' }"
                   :title="isExpanded ? null : 'Reportes'">
        <i class="fas fa-chart-bar"></i>
        <span class="nav-text">Reportes</span>
      </router-link>
      <router-link to="/admin/configuser" class="nav-item" 
                   :class="{ active: currentRoute === 'adminConfiguraciones' }"
                   :title="isExpanded ? null : 'Configuración'">
        <i class="fas fa-cog"></i>
        <span class="nav-text">Configuración</span>
      </router-link>
    </div>
    <div class="sidebar-footer">
      <!-- Cambiado de router-link a div para manejar el logout con función -->
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
  name: 'SidebarAdmin',
  data() {
    return {
      isExpanded: sessionStorage.getItem('sidebarExpanded') === 'true' || true
    }
  },
  computed: {
    currentRoute() {
      return this.$route.name;
    }
  },
  mounted() {
    this.updateBodyPadding();
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    
    // Añadir verificación de token al cargar
    this.checkAuthentication();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
      sessionStorage.setItem('sidebarExpanded', this.isExpanded);
      this.updateBodyPadding();
      this.$emit('sidebar-toggle', this.isExpanded);
    },
    updateBodyPadding() {
      if (window.innerWidth > 768) {
        const sidebarWidth = this.isExpanded 
          ? 'var(--sidebar-width-expanded)' 
          : 'var(--sidebar-width)';
        document.body.style.paddingLeft = sidebarWidth;
      } else {
        document.body.style.paddingLeft = '0';
      }
    },
    handleResize() {
      if (window.innerWidth <= 768) {
        this.isExpanded = false;
        sessionStorage.setItem('sidebarExpanded', 'false');
      }
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
        // Recargar la página para asegurar un estado limpio
        window.location.reload();
      });
    },
    checkAuthentication() {
      // Verificar si el token existe
      const token = sessionStorage.getItem('token');
      if (!token && this.$route.path !== '/login') {
        // Si no hay token y no estamos en login, redireccionar
        this.$router.push('/login');
      }
    }
  }
};
</script>

<style src="@/assets/css/SidebarAdmin.css" scoped></style>