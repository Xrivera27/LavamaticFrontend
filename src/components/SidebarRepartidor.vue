<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="menu-toggle" @click="toggleSidebar">
      <i class="fas fa-bars"></i>
    </div>
    <div class="nav-links">
      <router-link to="/repartidor/pedidos" class="nav-item" :class="{ active: currentRoute === 'repartidorPedidos' }">
        <i class="fas fa-inbox"></i>
        <span class="nav-text">Pedidos</span>
      </router-link>
      <router-link to="/repartidor/configuracion" class="nav-item" :class="{ active: currentRoute === 'repartidorConfiguracion' }">
        <i class="fas fa-cog"></i>
        <span class="nav-text">Configuración</span>
      </router-link>
    </div>
    <div class="sidebar-footer">
      <router-link to="/login" class="nav-item logout" @click="logout">
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
      isExpanded: false
    }
  },
  computed: {
    currentRoute() {
      return this.$route.name;
    }
  },
  methods: {
    toggleSidebar() {
      this.isExpanded = !this.isExpanded;
      this.$emit('sidebar-toggle', this.isExpanded);
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
  }
};
</script>

<style src="@/assets/css/SidebarRepartidor.css" scoped></style>