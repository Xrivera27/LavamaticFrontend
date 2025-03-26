<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="menu-toggle" @click="toggleSidebar" :title="isExpanded ? null : 'Menú'">
      <i class="fa-solid" :class="isExpanded ? 'fa-chevron-left' : 'fa-bars'"></i>
      <span class="nav-text">Menú</span>
    </div>
    <div class="nav-links">
      <router-link to="/dashboard" class="nav-item" 
                   :class="{ active: currentRoute === 'dashboard' }" 
                   :title="isExpanded ? null : 'Home'">
        <i class="fa-solid fa-house"></i>
        <span class="nav-text">Home</span>
      </router-link>
      <router-link to="/servicios" class="nav-item" 
                   :class="{ active: currentRoute === 'servicios' }" 
                   :title="isExpanded ? null : 'Servicios'">
        <i class="fa-solid fa-list-check"></i>
        <span class="nav-text">Servicios</span>
      </router-link>
      <router-link to="/historial" class="nav-item" 
                   :class="{ active: currentRoute === 'historial' }" 
                   :title="isExpanded ? null : 'Historial'">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <span class="nav-text">Historial</span>
      </router-link>
      <router-link to="/configuracion" class="nav-item" 
                   :class="{ active: currentRoute === 'configuracion' }" 
                   :title="isExpanded ? null : 'Configuración'">
        <i class="fa-solid fa-gear"></i>
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
  name: 'SidebarCliente',
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

<style src="@/assets/css/SidebarClienteStyle.css" scoped></style>