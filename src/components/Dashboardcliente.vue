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
  
  <style scoped>
  .dashboard-container {
    font-family: 'Roboto', sans-serif;
    background-color: #ffffff;
    min-height: 100vh;
  }
  
  .main-content {
    max-width: 1024px;
    margin: 0 auto;
    padding: 16px 24px;
  }
  
  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }
  
  .logo i {
    font-size: 20px;
    color: #2563EB;
  }
  
  .notifications {
    position: relative;
    margin-left: auto;
    margin-right: 24px;
  }
  
  .notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #ef4444;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  
  .user-role {
    font-size: 12px;
    color: #6b7280;
  }
  
  /* Welcome title */
  .welcome-title {
    text-align: center;
    margin: 20px 0;
  }
  
  .welcome-title h1 {
    font-size: 18px;
    font-weight: 500;
    color: #1f2937;
  }
  
  /* Services categories */
  .services-categories {
    display: flex;
    background-color: #e0f2fe;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .service-column {
    flex: 1;
    padding: 0 16px;
  }
  
  .service-column h2 {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1e3a8a;
  }
  
  .vertical-divider {
    width: 1px;
    background-color: #94a3b8;
    margin: 0 8px;
  }
  
  .service-group {
    margin-bottom: 16px;
  }
  
  .service-group h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #1e3a8a;
  }
  
  .service-group p {
    margin-bottom: 4px;
    font-size: 13px;
    color: #334155;
    line-height: 1.3;
  }
  
  /* Service selection */
  .service-selection {
    margin-top: 24px;
  }
  
  .selection-title {
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #1f2937;
  }
  
  .service-cards {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
  
  .service-card {
    width: 240px;
    height: 120px;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    transition: transform 0.2s;
    position: relative;
  }
  
  .service-card:hover {
    transform: translateY(-4px);
  }
  
  .service-card.standard {
    background-color: #2563EB;
    color: white;
    position: relative;
  }
  
  .service-card.express {
    background-color: #e0f2fe;
    color: #1e3a8a;
    position: relative;
  }
  
  .service-card h3 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 30px;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    position: absolute;
    bottom: 16px;
    font-size: 14px;
  }
  
  .service-card.standard .action-button {
    color: white;
  }
  
  .service-card.express .action-button {
    color: #1e3a8a;
  }
  
  .fa-eye {
    margin-left: 8px;
  }
  </style>