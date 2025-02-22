<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <div class="menu-toggle" @click="toggleSidebar">
      <i class="fas fa-bars"></i>
    </div>
    <div class="nav-links">
      <router-link to="/admin/dashboard" class="nav-item" :class="{ active: currentRoute === 'adminDashboard' }">
        <i class="fas fa-tachometer-alt"></i>
        <span class="nav-text">Dashboard</span>
      </router-link>
      <router-link to="/admin/repartidores/crear" class="nav-item" :class="{ active: currentRoute === 'adminCrearRepartidor' }">
        <i class="fas fa-user-plus"></i>
        <span class="nav-text">Crear Repartidor</span>
      </router-link>
      <router-link to="/admin/clientes" class="nav-item" :class="{ active: currentRoute === 'adminClientes' }">
        <i class="fas fa-users"></i>
        <span class="nav-text">Clientes</span>
      </router-link>
      <router-link to="/admin/inventario" class="nav-item" :class="{ active: currentRoute === 'adminInventario' }">
        <i class="fas fa-boxes"></i>
        <span class="nav-text">Inventario</span>
      </router-link>
      <router-link to="/admin/servicios" class="nav-item" :class="{ active: currentRoute === 'adminServicios' }">
        <i class="fas fa-concierge-bell"></i>
        <span class="nav-text">Servicios</span>
      </router-link>
      <router-link to="/admin/mantenimiento" class="nav-item" :class="{ active: currentRoute === 'adminMantenimiento' }">
        <i class="fas fa-tools"></i>
        <span class="nav-text">Mantenimiento</span>
      </router-link>
      <router-link to="/admin/pedidos" class="nav-item" :class="{ active: currentRoute === 'adminPedidos' }">
        <i class="fas fa-clipboard-list"></i>
        <span class="nav-text">Pedidos</span>
      </router-link>
      <router-link to="/admin/configuracion" class="nav-item" :class="{ active: currentRoute === 'adminConfiguracion' }">
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
  name: 'SidebarAdmin',
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
      // Aquí iría la lógica para cerrar sesión
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      // Redirección ya manejada por el router-link
    }
  }
};
</script>

<style src="@/assets/css/SidebarAdmin.css" scoped></style>