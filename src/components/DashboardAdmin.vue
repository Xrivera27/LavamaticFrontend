<template>
  <div class="app-container">
    <!-- Modal de carga -->
    <div v-if="cargando" class="loading-modal">
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    </div>

    <!-- Sidebar -->
    <SidebarDinamico />
    
    <!-- Dashboard Content -->
    <div class="dashboard-wrapper">
      <div class="dashboard-content">
        
        <!-- Status Cards -->
        <div class="status-cards">
          <div 
            v-for="(estado, index) in estadosPedidos" 
            :key="estado.id" 
            class="status-card"
            :class="getStatusClass(index)"
          >
            <div class="card-icon">
              <span v-if="index === 0">⏰</span>
              <span v-else-if="index === 1">🚚</span>
              <span v-else-if="index === 2">✅</span>
              <span v-else-if="index === 3">📦</span>
            </div>
            <div class="card-content">
              <h3>{{ estado.nombre }}</h3>
              <div class="card-number">{{ estado.total }}</div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-container">
          
          <!-- Chart 1 -->
          <div class="chart-box">
            <div class="chart-header">
              <h3>Pedidos asignados por Repartidor</h3>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="dot blue"></span>
                  <span>Repartidores</span>
                </div>
              </div>
            </div>
            <div class="chart-canvas">
              <canvas id="repartidoresChart"></canvas>
            </div>
          </div>

          <!-- Chart 2 -->
          <div class="chart-box">
            <div class="chart-header">
              <h3>Distribución de Servicios</h3>
              <div class="chart-legend">
                <div 
                  v-for="(item, index) in serviciosLegend" 
                  :key="index" 
                  class="legend-item"
                >
                  <span 
                    class="dot" 
                    :style="{ backgroundColor: item.color }"
                  ></span>
                  <span>{{ item.nombre }}</span>
                </div>
              </div>
            </div>
            <div class="chart-canvas">
              <canvas id="serviciosChart"></canvas>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import SidebarDinamico from './SidebarDinamico.vue';
import Chart from 'chart.js/auto';
import api from '@/services/apiService';

export default {
  name: 'DashboardAdmin',
  components: {
    SidebarDinamico
  },
  data() {
    return {
      estadosPedidos: [],
      serviciosLegend: [],
      datosRepartidores: [],
      datosServicios: [],
      repartidoresChart: null,
      serviciosChart: null,
      cargando: true,
      error: null,
      // COLORES FIJOS PARA TODOS LOS SERVICIOS
      coloresServicios: {
        'Básica': '#06d6a0',     // Verde (como en tu imagen)
        'Premium': '#f72585',    // Rosa
        'Secado': '#7209b7',     // Morado
        'Lavado': '#4361ee',     // Azul
        // Colores adicionales por si aparecen otros servicios
        'Express': '#ff6b35',    // Naranja
        'Deluxe': '#ffd23f',     // Amarillo
        'Económico': '#06ffa5',  // Verde claro
        'VIP': '#b7094c'         // Rojo oscuro
      },
      // COLORES DE RESPALDO FIJOS (sin random)
      coloresRespaldo: [
        '#06d6a0', '#f72585', '#7209b7', '#4361ee', 
        '#ff6b35', '#ffd23f', '#06ffa5', '#b7094c',
        '#264653', '#2a9d8f', '#e9c46a', '#f4a261'
      ]
    }
  },
  mounted() {
    this.cargarDatosDashboard();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    if (this.repartidoresChart) {
      this.repartidoresChart.destroy();
    }
    if (this.serviciosChart) {
      this.serviciosChart.destroy();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async cargarDatosDashboard() {
      try {
        this.cargando = true;
        this.error = null;
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await api.dashboard.getData();
        const data = response.data;
        
        this.estadosPedidos = data.estadoCards || [];
        
        //  ASIGNACIÓN DE COLORES FIJA (sin random)
        this.datosServicios = (data.datosServicios || []).map((item, index) => {
          // Primero intentar usar colores específicos
          if (this.coloresServicios[item.name]) {
            item.color = this.coloresServicios[item.name];
          } else {
            // Si no existe, usar colores de respaldo en orden secuencial
            item.color = this.coloresRespaldo[index % this.coloresRespaldo.length];
          }
          return item;
        });
        
        this.serviciosLegend = this.datosServicios.map(item => ({
          nombre: item.name,
          color: item.color
        }));
        
        this.datosRepartidores = data.datosRepartidores || [];
        
        this.$nextTick(() => {
          this.initCharts();
        });
        
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = 'No se pudieron cargar los datos del dashboard.';
      } finally {
        this.cargando = false;
      }
    },
    
    getStatusClass(index) {
      const classes = ['waiting', 'shipping', 'ready', 'delivered'];
      return classes[index % classes.length];
    },
    
    initCharts() {
      this.initRepartidoresChart();
      this.initServiciosChart();
    },
    
    initRepartidoresChart() {
      const ctx = document.getElementById('repartidoresChart');
      if (!ctx || !this.datosRepartidores.length) return;
      
      if (this.repartidoresChart) {
        this.repartidoresChart.destroy();
      }
      
      const labels = this.datosRepartidores.map(item => {
        if (item.name === 'Sin asignar') return 'Sin asignar';
        const nombres = item.name.split(' ');
        if (nombres.length >= 2) {
          return `${nombres[0]} ${nombres[1].charAt(0)}.`;
        }
        return item.name;
      });
      
      const datos = this.datosRepartidores.map(item => item.pedidos);
      const nombresCompletos = this.datosRepartidores.map(item => item.name);
      
      this.repartidoresChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Pedidos Asignados',
            data: datos,
            backgroundColor: '#3498db',
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  const index = tooltipItems[0].dataIndex;
                  return nombresCompletos[index];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(200, 200, 200, 0.1)' },
              ticks: { color: '#999', precision: 0 }
            },
            x: {
              grid: { display: false },
              ticks: {
                color: '#999',
                maxRotation: 45,
                minRotation: 45,
                font: { size: 11 }
              }
            }
          }
        }
      });
    },
    
    initServiciosChart() {
      const ctx = document.getElementById('serviciosChart');
      if (!ctx || !this.datosServicios.length) return;
      
      if (this.serviciosChart) {
        this.serviciosChart.destroy();
      }
      
      const labels = this.datosServicios.map(item => item.name);
      const datos = this.datosServicios.map(item => item.value);
      const colores = this.datosServicios.map(item => item.color);
      
      this.serviciosChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: datos,
            backgroundColor: colores,
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        }
      });
    },
    
    handleResize() {
      setTimeout(() => {
        if (this.repartidoresChart) {
          this.repartidoresChart.resize();
        }
        if (this.serviciosChart) {
          this.serviciosChart.resize();
        }
      }, 300);
    }
  }
};
</script>


 <style src="@/assets/css/DashboardAdmin.css" scoped></style>