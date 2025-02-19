<template>
    <div class="dashboard-container">
      <div class="main-content">
        <!-- Header con logo y usuario -->
        <div class="header">
          <div class="logo">
            <i class="fa fa-tshirt"></i>
            <span>Lavamatic</span>
          </div>
          <div class="notifications">
            <i class="fa fa-bell"></i>
            <span class="notification-badge">3</span>
          </div>
          <div class="user-info">
            <span>Gerson Rivera</span>
            <span class="user-role">Cliente</span>
          </div>
        </div>
  
        <!-- Título principal -->
        <div class="welcome-title">
          <h1>Bienvenido, a continuación podrás ver los servicios que brindamos</h1>
        </div>
  
        <!-- Categorías de servicios -->
        <div class="services-categories">
          <div class="service-column">
            <h2>Servicios comunes</h2>
            
            <div class="service-group">
              <h3>Lavado y Secado:</h3>
              <p>Ropa de uso diario (camisetas, pantalones, ropa interior, etc.)</p>
              <p>Prendas delicadas (blusas, vestidos, trajes)</p>
              <p>Ropa de cama (sábanas, fundas, edredones)</p>
              <p>Toallas y manteles</p>
            </div>
  
            <div class="service-group">
              <h3>Planchado Profesional:</h3>
              <p>Planchado de camisas, pantalones y prendas delicadas</p>
              <p>Doblado profesional para que tu ropa llegue lista para guardar</p>
            </div>
  
            <div class="service-group">
              <h3>Lavado de Artículos Especiales:</h3>
              <p>Cortinas</p>
              <p>Cobijas y edredones grandes</p>
            </div>
          </div>
          
          <div class="vertical-divider"></div>
          
          <div class="service-column">
            <h2>Servicios express</h2>
            
            <div class="service-group">
              <h3>Lavado Express:</h3>
              <p>Entrega en 90 minutos</p>
              <p>Ideal para emergencias o eventos imprevistos</p>
            </div>
  
            <div class="service-group">
              <h3>Planchado Express:</h3>
              <p>Servicio rápido para prendas que necesitas de inmediato</p>
            </div>
  
            <div class="service-group">
              <h3>Recogida y Entrega Urgente:</h3>
              <p>Recogemos y entregamos tu ropa en un horario extendido</p>
              <p>Disponible bajo solicitud previa</p>
            </div>
          </div>
        </div>
  
        <!-- Selección de servicios -->
        <div class="service-selection">
          <h2 class="selection-title">SELECCIÓN DE SERVICIOS</h2>
          
          <div class="service-cards">
            <div class="service-card standard" @click="navigateToService('estandar')">
              <h3>SERVICIO ESTÁNDAR</h3>
              <div class="action-button">
                <span>HAGA CLICK AQUÍ</span>
                <i class="fa fa-eye"></i>
              </div>
            </div>
            
            <div class="service-card express" @click="navigateToService('express')">
              <h3>SERVICIO EXPRESS</h3>
              <div class="action-button">
                <span>HAGA CLICK AQUÍ</span>
                <i class="fa fa-eye"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DashboardPage',
    data() {
      return {
        userName: 'Gerson Rivera',
        userRole: 'Cliente',
        notificationCount: 3
      };
    },
    methods: {
      navigateToService(tipo) {
        this.$router.push({
          name: 'servicios',
          query: { tipo }
        });
      }
    }
  };
  </script>
  
  <style src="@/assets/css/dashboardClienteStyle.css" scoped></style>