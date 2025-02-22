<template>
    <div class="admin-layout">
      <SidebarAdmin />
      <div class="main-content">
        <div class="header">
          <h1>Bienvenido al Panel</h1>
          <div class="user-info">
            <span>Miguel Gutierrez</span>
            <span class="user-role">Administrador</span>
          </div>
        </div>
  
        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="card-info">
                <h3>Ventas</h3>
                <p class="card-value">L. 983.25</p>
              </div>
            </div>
            <a href="#" class="card-link">Ver más</a>
          </div>
  
          <div class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="card-info">
                <h3>Clientes</h3>
                <p class="card-value">20</p>
              </div>
            </div>
            <a href="#" class="card-link">Ver más</a>
          </div>
  
          <div class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <i class="fas fa-bell"></i>
              </div>
              <div class="card-info">
                <h3>Alertas Promoción</h3>
                <p class="card-value">0</p>
              </div>
            </div>
            <a href="#" class="card-link">Ver más</a>
          </div>
  
          <div class="summary-card">
            <div class="card-content">
              <div class="card-icon">
                <i class="fas fa-tag"></i>
              </div>
              <div class="card-info">
                <h3>Promociones Productos</h3>
                <p class="card-value">0</p>
              </div>
            </div>
            <a href="#" class="card-link">Ver más</a>
          </div>
        </div>
  
        <!-- Gráficos -->
        <div class="charts-container">
          <div class="chart-card">
            <div class="chart-header">
              <h3>Pedidos</h3>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-color pagados"></span>
                  <span>Pedidos Pagados</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color cancelados"></span>
                  <span>Pedidos Cancelados</span>
                </div>
              </div>
            </div>
            <div class="chart-body">
              <canvas id="ordersChart"></canvas>
            </div>
          </div>
  
          <div class="chart-card">
            <div class="chart-header">
              <h3>Repartidores y Servicios</h3>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-color productos"></span>
                  <span>Productos y Servicios</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color envios"></span>
                  <span>Envíos</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color repartos"></span>
                  <span>Repartos Fisica</span>
                </div>
              </div>
            </div>
            <div class="chart-body">
              <canvas id="repartidoresChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SidebarAdmin from './SidebarAdmin.vue';
  import Chart from 'chart.js/auto';
  
  export default {
    name: 'DashboardAdmin',
    components: {
      SidebarAdmin
    },
    data() {
      return {
        pedidosChart: null,
        repartidoresChart: null
      }
    },
    mounted() {
      this.initCharts();
    },
    beforeUnmount() {
      // Limpiar los gráficos para evitar memory leaks
      if (this.pedidosChart) {
        this.pedidosChart.destroy();
      }
      if (this.repartidoresChart) {
        this.repartidoresChart.destroy();
      }
    },
    methods: {
      initCharts() {
        this.initPedidosChart();
        this.initRepartidoresChart();
      },
      initPedidosChart() {
        const ctx = document.getElementById('ordersChart').getContext('2d');
        
        this.pedidosChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Pedidos Pagados',
                data: [50, 100, 250, 170, 120, 80],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: '#3498db',
                borderWidth: 2,
                tension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: '#3498db'
              },
              {
                label: 'Pedidos Cancelados',
                data: [30, 40, 20, 50, 30, 20],
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: '#e74c3c',
                borderWidth: 2,
                tension: 0.2,
                pointRadius: 4,
                pointBackgroundColor: '#e74c3c'
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
                intersect: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(200, 200, 200, 0.1)'
                },
                ticks: {
                  color: '#999'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#999'
                }
              }
            }
          }
        });
      },
      initRepartidoresChart() {
        const ctx = document.getElementById('repartidoresChart').getContext('2d');
        
        this.repartidoresChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Productos y Servicios', 'Envíos', 'Repartos Fisica'],
            datasets: [
              {
                data: [45, 30, 25],
                backgroundColor: [
                  '#f1c40f', // amarillo
                  '#e74c3c', // rojo
                  '#3498db'  // azul
                ],
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