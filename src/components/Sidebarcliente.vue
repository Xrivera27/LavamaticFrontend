<template>
    <div class="sidebar" :class="{ 'expanded': isExpanded }">
      <div class="menu-toggle" @click="toggleSidebar">
        <i class="fa-solid fa-bars"></i>
      </div>
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-item" :class="{ active: currentRoute === 'dashboard' }">
          <i class="fa-solid fa-house"></i>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <router-link to="/servicios" class="nav-item" :class="{ active: currentRoute === 'servicios' }">
          <i class="fa-solid fa-list-check"></i>
          <span class="nav-text">Servicios</span>
        </router-link>
        <router-link to="/historial" class="nav-item" :class="{ active: currentRoute === 'historial' }">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span class="nav-text">Historial</span>
        </router-link>
        <router-link to="/configuracion" class="nav-item" :class="{ active: currentRoute === 'configuracion' }">
          <i class="fa-solid fa-gear"></i>
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
    name: 'SidebarCliente',
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
        // Emitir evento para que los componentes padres sepan cuando el sidebar cambia
        this.$emit('sidebar-toggle', this.isExpanded);
      }
    }
  };
  </script>

  <style src="@/assets/css/SidebarClienteStyle.css" scoped>

</style>