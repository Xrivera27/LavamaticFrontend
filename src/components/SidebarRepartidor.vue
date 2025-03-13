<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="menu-toggle" @click="toggleSidebar" :title="isExpanded ? null : 'Menú'">
      <i class="fas" :class="isExpanded ? 'fa-chevron-left' : 'fa-bars'"></i>
      <span class="nav-text">Menú</span>
    </div>
    <div class="nav-links">
      <router-link to="/repartidor/pedidos" class="nav-item" 
                   :class="{ active: currentRoute === 'repartidorPedidos' }"
                   :title="isExpanded ? null : 'Pedidos Asignados'">
        <i class="fas fa-inbox"></i>
        <span class="nav-text">Pedidos</span>
      </router-link>
      <router-link to="/repartidor/configuracion" class="nav-item" 
                   :class="{ active: currentRoute === 'repartidorConfiguracion' }"
                   :title="isExpanded ? null : 'Configuración'">
        <i class="fas fa-cog"></i>
        <span class="nav-text">Configuración</span>
      </router-link>
    </div>
    <div class="sidebar-footer">
      <router-link to="/login" class="nav-item logout" 
                   @click="logout"
                   :title="isExpanded ? null : 'Cerrar Sesión'">
        <i class="fas fa-sign-out-alt"></i>
        <span class="nav-text">Cerrar Sesión</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarRepartidor',
  data() {
    return {
      isExpanded: localStorage.getItem('sidebarExpanded') === 'true' || true
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
      // Emitir evento para que los componentes padres sepan cuando el sidebar cambia
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

<style src="@/assets/css/SidebarRepartidor.css" scoped></style>