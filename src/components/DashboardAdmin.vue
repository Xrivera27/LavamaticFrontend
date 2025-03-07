<template>
  <div class="admin-layout">
    <SidebarAdmin />
    <div class="main-content">
      
      <!-- Estados de pedidos -->
      <div class="order-status-cards">
        <div v-for="(estado, index) in estadosPedidos" :key="estado.id" class="order-status-card" :class="estado.clase">
          <div class="status-icon emoji-icon">
            <!-- Usar emojis en lugar de Font Awesome -->
            <span v-if="index === 0">⏰</span>
            <span v-else-if="index === 1">🚚</span>
            <span v-else-if="index === 2">✅</span>
            <span v-else-if="index === 3">📦</span>
          </div>
          <div class="status-info">
            <h3>{{ estado.nombre }}</h3>
            <p class="status-count">{{ estado.total }}</p>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-container">
        <div class="chart-card">
          <div class="chart-header">
            <h3>Pedidos asignados por Repartidor</h3>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color repartidores"></span>
                <span>Repartidores</span>
              </div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="repartidoresLineChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>Distribución de Servicios </h3>
            <div class="chart-legend">
              <div class="legend-item" v-for="(item, index) in serviciosLegend" :key="index">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span>{{ item.nombre }}</span>
              </div>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="serviciosChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarAdmin from './SidebarAdmin.vue';
import Chart from 'chart.js/auto';
import api from '@/services/apiService';

export default {
  name: 'DashboardAdmin',
  components: {
    SidebarAdmin
  },
  data() {
    return {
      estadosPedidos: [],
      serviciosLegend: [],
      datosRepartidores: [],
      datosServicios: [],
      repartidoresLineChart: null,
      serviciosChart: null,
      cargando: true,
      error: null,
      // Colores predefinidos para los servicios (independientes de la API)
      coloresServicios: {
        'Básica': '#4361ee',  // Azul
        'Premium': '#f72585', // Rosa
        'Secado': '#7209b7'   // Morado
      }
    }
  },
  mounted() {
    this.cargarDatosDashboard();
  },
  beforeUnmount() {
    // Limpiar los gráficos para evitar memory leaks
    if (this.repartidoresLineChart) {
      this.repartidoresLineChart.destroy();
    }
    if (this.serviciosChart) {
      this.serviciosChart.destroy();
    }
  },
  methods: {
    async cargarDatosDashboard() {
      try {
        this.cargando = true;
        this.error = null;
        
        // Llamada a la API para obtener los datos del dashboard
        const response = await api.dashboard.getData();
        const data = response.data;
        
        // Asignar datos para los estados de pedidos y asegurar que tengan las clases correctas
        this.estadosPedidos = data.estadoCards.map((estado, index) => {
          // Asegurar que cada tarjeta tenga la clase correcta según su índice
          if (!estado.clase) {
            const clases = ['status-waiting', 'status-shipping', 'status-ready', 'status-delivered'];
            estado.clase = clases[index % clases.length];
          }
          return estado;
        });
        
        // Procesar los datos de servicios para asegurar que usen los colores correctos
        this.datosServicios = data.datosServicios.map(item => {
          // Forzar el color según el nombre del servicio
          if (this.coloresServicios[item.name]) {
            item.color = this.coloresServicios[item.name];
          } else {
            // Color aleatorio para servicios sin color predefinido
            item.color = '#' + Math.floor(Math.random()*16777215).toString(16);
          }
          return item;
        });
        
        // Crear la leyenda basada en los datos de servicios actualizados
        this.serviciosLegend = this.datosServicios.map(item => {
          return {
            nombre: item.name,
            color: item.color
          };
        });
        
        // Asignar datos para los gráficos de repartidores
        this.datosRepartidores = data.datosRepartidores;
        
        // Inicializar los gráficos con los datos
        this.$nextTick(() => {
          this.initCharts();
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = 'No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.';
      } finally {
        this.cargando = false;
      }
    },
    
    initCharts() {
      this.initRepartidoresLineChart();
      this.initServiciosChart();
    },
    
    initRepartidoresLineChart() {
  const ctx = document.getElementById('repartidoresLineChart');
  if (!ctx) {
    console.error('No se encontró el elemento canvas para el gráfico de repartidores');
    return;
  }
  
  const context = ctx.getContext('2d');
  
  // Destruir el gráfico anterior si existe
  if (this.repartidoresLineChart) {
    this.repartidoresLineChart.destroy();
  }
  
  // Verificar si hay datos para mostrar
  if (!this.datosRepartidores || this.datosRepartidores.length === 0) {
    console.warn('No hay datos de repartidores para mostrar');
    return;
  }
  
  // Preparar los datos para el gráfico de barras
  const labels = this.datosRepartidores.map(item => {
    // Crear etiquetas más cortas para el gráfico
    if (item.name === 'Sin asignar') return 'Sin asignar';
    
    // Obtener solo el primer nombre para mostrar en el gráfico
    const nombres = item.name.split(' ');
    if (nombres.length >= 2) {
      return `${nombres[0]} ${nombres[1].charAt(0)}.`; // Primer nombre + inicial de apellido
    }
    return item.name;
  });
  
  const datos = this.datosRepartidores.map(item => item.pedidos);
  
  // Guardar los nombres completos para usar en tooltips
  const nombresCompletos = this.datosRepartidores.map(item => item.name);
  
  this.repartidoresLineChart = new Chart(context, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pedidos Asignados',
          data: datos,
          backgroundColor: '#3498db',
          borderWidth: 0,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function(tooltipItems) {
              // Mostrar el nombre completo en el tooltip
              const index = tooltipItems[0].dataIndex;
              return nombresCompletos[index];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(200, 200, 200, 0.1)'
          },
          ticks: {
            color: '#999',
            precision: 0 // Solo números enteros
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#999',
            maxRotation: 45,
            minRotation: 45,
            autoSkip: false,
            font: {
              size: 11
            }
          }
        }
      },
      layout: {
        padding: {
          bottom: 20
        }
      }
    }
  });
},
    
    initServiciosChart() {
      const ctx = document.getElementById('serviciosChart');
      if (!ctx) {
        console.error('No se encontró el elemento canvas para el gráfico de servicios');
        return;
      }
      
      const context = ctx.getContext('2d');
      
      // Destruir el gráfico anterior si existe
      if (this.serviciosChart) {
        this.serviciosChart.destroy();
      }
      
      // Verificar si hay datos para mostrar
      if (!this.datosServicios || this.datosServicios.length === 0) {
        console.warn('No hay datos de servicios para mostrar');
        return;
      }
      
      // Preparar los datos para el gráfico de pie
      const labels = this.datosServicios.map(item => item.name);
      const datos = this.datosServicios.map(item => item.value);
      
      // Usar DIRECTAMENTE los colores forzados sin depender de item.color
      const colores = this.datosServicios.map(item => {
        if (item.name === 'Básica') return '#4361ee';
        if (item.name === 'Premium') return '#f72585';
        if (item.name === 'Secado') return '#7209b7';
        return '#' + Math.floor(Math.random()*16777215).toString(16);
      });
      
      // Forzar colores específicos según el índice si los nombres no coinciden
      if (colores.length >= 3) {
        if (labels[0]) colores[0] = '#4361ee'; // Azul para el primer elemento
        if (labels[1]) colores[1] = '#f72585'; // Rosa para el segundo elemento
        if (labels[2]) colores[2] = '#7209b7'; // Morado para el tercer elemento
      }
      
      console.log('Colores para el gráfico:', colores);
      console.log('Nombres de los servicios:', labels);
      
      this.serviciosChart = new Chart(context, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [
            {
              data: datos,
              backgroundColor: colores,
              borderColor: 'white',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
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
    }
  }
};
</script>



<style src="@/assets/css/DashboardAdmin.css" scoped></style>