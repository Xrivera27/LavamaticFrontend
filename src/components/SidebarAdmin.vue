<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="nav-links">
      <div class="menu-toggle" @click="toggleSidebar">
        <i class="fas" :class="isExpanded ? 'fa-chevron-left' : 'fa-bars'"></i>
        <span class="nav-text">Menú</span>
      </div>
      <router-link to="/admin/dashboard" class="nav-item tooltip" :class="{ active: currentRoute === 'adminDashboard' }" data-tooltip="Dashboard">
        <i class="fas fa-tachometer-alt"></i>
        <span class="nav-text">Dashboard</span>
      </router-link>
      <router-link to="/admin/repartidores/crear" class="nav-item tooltip" :class="{ active: currentRoute === 'adminCrearRepartidor' }" data-tooltip="Crear Repartidor">
        <i class="fas fa-user-plus"></i>
        <span class="nav-text">Crear Repartidor</span>
      </router-link>
      <router-link to="/admin/clientes" class="nav-item tooltip" :class="{ active: currentRoute === 'adminClientes' }" data-tooltip="Clientes">
        <i class="fas fa-users"></i>
        <span class="nav-text">Clientes</span>
      </router-link>
      <router-link to="/admin/inventario" class="nav-item tooltip" :class="{ active: currentRoute === 'adminInventario' }" data-tooltip="Inventario">
        <i class="fas fa-boxes"></i>
        <span class="nav-text">Inventario</span>
      </router-link>
      <router-link to="/admin/servicios" class="nav-item tooltip" :class="{ active: currentRoute === 'adminServicios' }" data-tooltip="Servicios">
        <i class="fas fa-concierge-bell"></i>
        <span class="nav-text">Servicios</span>
      </router-link>
      <router-link to="/admin/mantenimiento" class="nav-item tooltip" :class="{ active: currentRoute === 'adminMantenimiento' }" data-tooltip="Mantenimiento">
        <i class="fas fa-tools"></i>
        <span class="nav-text">Mantenimiento</span>
      </router-link>
      <router-link to="/admin/pedidos" class="nav-item tooltip" :class="{ active: currentRoute === 'adminPedidos' }" data-tooltip="Pedidos">
        <i class="fas fa-clipboard-list"></i>
        <span class="nav-text">Pedidos</span>
      </router-link>
      <router-link to="/admin/configuser" class="nav-item tooltip" :class="{ active: currentRoute === 'adminConfiguraciones' }" data-tooltip="Configuración">
        <i class="fas fa-cog"></i>
        <span class="nav-text">Configuración</span>
      </router-link>
    </div>
    <div class="sidebar-footer">
      <router-link to="/login" class="nav-item logout tooltip" @click="logout" data-tooltip="Cerrar Sesión">
        <i class="fas fa-sign-out-alt"></i>
        <span class="nav-text">Cerrar Sesión</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarAdmin',
  data() {
    return {
      isExpanded: localStorage.getItem('sidebarExpanded') === 'true' || false
    }
  },
  computed: {
    currentRoute() {
      return this.$route.name;
    }
  },
  mounted() {
    // Add padding to body based on sidebar state
    this.updateBodyPadding();
    
    // Add event listener for window resize
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    // Remove event listener
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
      // Save state to localStorage
      localStorage.setItem('sidebarExpanded', this.isExpanded);
      this.updateBodyPadding();
      this.$emit('sidebar-toggle', this.isExpanded);
    },
    updateBodyPadding() {
      // Add padding to main content to prevent sidebar overlap
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
        // Auto collapse on small screens
        this.isExpanded = false;
        localStorage.setItem('sidebarExpanded', 'false');
      }
      this.updateBodyPadding();
    },
    logout() {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('sidebarExpanded');
      // Redirection handled by router-link
    }
  }
};
</script>

<style src="@/assets/css/SidebarAdmin.css" scoped></style>