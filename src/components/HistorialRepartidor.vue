<template>
    <div class="repartidor-layout">
      <SidebarDinamico @sidebar-toggle="handleSidebarToggle" />
      <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
        <div class="historial-wrapper">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
          
          <div class="header-section">
            <h1 class="page-title">Historial de Entregas</h1>
          </div>
      
          <div class="opciones">
            <div class="search-bar">
              <input
                class="busqueda"
                type="text"
                v-model="searchQuery"
                placeholder="Buscar pedido por cliente, dirección o servicios..."
              />
            </div>
          </div>
      
          <div class="table-container">
            <div v-if="isLoading" class="loading-indicator">
              Cargando historial...
            </div>
      
            <div v-else-if="pedidosFiltrados.length === 0" class="no-data">
              No se encontraron pedidos en el historial.
            </div>
      
            <table v-else class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Servicios</th>
                  <th>Total</th>
                  <th>Fecha Entrega</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pedido, index) in paginatedPedidos" :key="pedido.id">
                  <td data-label="#">
                    {{ (currentPage - 1) * pageSize + index + 1 }}
                  </td>
                  <td data-label="Cliente">{{ pedido.cliente }}</td>
                  <td data-label="Dirección">
                    <div class="direccion-cell">{{ pedido.direccion }}</div>
                  </td>
                  <td data-label="Servicios">
                    <div class="servicios-lista">{{ pedido.servicios.join(', ') }}</div>
                  </td>
                  <td data-label="Total">${{ pedido.total.toFixed(2) }}</td>
                  <td data-label="Fecha Entrega">{{ formatDate(pedido.fecha_entrega) }}</td>
                  <td data-label="Acciones">
                    <button
                      class="btn btn-info"
                      @click="verDetalles(pedido)"
                      title="Ver detalles"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
  
            <div class="pagination-wrapper">
              <div class="pagination-info">
                Mostrando {{ paginatedPedidos.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
                {{ Math.min(currentPage * pageSize, pedidosFiltrados.length) }} de
                {{ pedidosFiltrados.length }} registros
              </div>
              <div class="pagination-container">
                <button style="margin-bottom: 1rem;"
                  class="pagination-button"
                  :disabled="currentPage === 1"
                  @click="previousPage"
                >
                  Anterior
                </button>
                <button
                  class="pagination-button"
                  :disabled="currentPage === totalPages"
                  @click="nextPage"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
  
          <!-- Modal de detalles -->
          <div class="modal" v-if="showDetailsModal">
            <div class="modal-detalle">
              <div class="modal-header">
                <h2>Detalles del Pedido</h2>
              </div>
              <div class="modal-body-detalle">
                <div v-if="pedidoDetalle" class="detalle-content">
                  <div class="detalle-row">
                    <strong>Cliente:</strong> 
                    <span>{{ pedidoDetalle.cliente }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Dirección de Entrega:</strong>
                    <span>{{ pedidoDetalle.direccion }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Teléfono:</strong>
                    <span>{{ pedidoDetalle.telefono }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Fecha de Asignación:</strong>
                    <span>{{ formatDate(pedidoDetalle.fecha_asignacion) }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Fecha de Entrega:</strong>
                    <span>{{ formatDate(pedidoDetalle.fecha_entrega) }}</span>
                  </div>
                  <div class="detalle-servicios">
                    <strong>Servicios:</strong>
                    <div class="servicios-list">
                      <div v-for="(servicio, index) in pedidoDetalle.serviciosDetalle" :key="index" class="servicio-item">
                        <span>{{ servicio.nombre }}</span>
                        <span>${{ servicio.precio.toFixed(2) }}</span>
                      </div>
                    </div>
                    <div class="total-row">
                      <strong>Total:</strong>
                      <span>${{ pedidoDetalle.total.toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="detalle-notas" v-if="pedidoDetalle.notas">
                    <strong>Notas:</strong>
                    <p>{{ pedidoDetalle.notas }}</p>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <div class="action-buttons">
                  <button class="btn btn-secondary" @click="cerrarDetalles">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SidebarDinamico from './SidebarDinamico.vue';
  
  export default {
    name: 'HistorialRepartidor',
    components: {
      SidebarDinamico
    },
    data() {
      return {
        isSidebarExpanded: false,
        isLoading: false,
        showDetailsModal: false,
        searchQuery: "",
        currentPage: 1,
        pageSize: 10,
        pedidoDetalle: null,
        pedidosHistorial: [
          {
            id: 1,
            cliente: 'Ana García',
            direccion: 'Colonia Humuya, Calle Principal #45',
            telefono: '+504 9988-7755',
            servicios: ['Lavado Express', 'Planchado'],
            serviciosDetalle: [
              { nombre: 'Lavado Express', precio: 12.99 },
              { nombre: 'Planchado', precio: 5.99 }
            ],
            total: 18.98,
            fecha_asignacion: new Date('2024-02-20 09:30'),
            fecha_entrega: new Date('2024-02-20 11:45'),
            notas: 'Entrega completada sin incidencias.'
          },
          {
            id: 2,
            cliente: 'Luis Mendoza',
            direccion: 'Residencial El Trapiche, Casa #23',
            telefono: '+504 9955-4422',
            servicios: ['Lavado y Planchado Premium'],
            serviciosDetalle: [
              { nombre: 'Lavado y Planchado Premium', precio: 24.99 }
            ],
            total: 24.99,
            fecha_asignacion: new Date('2024-02-21 14:15'),
            fecha_entrega: new Date('2024-02-21 16:30'),
            notas: 'Cliente muy satisfecho con el servicio.'
          },
          {
            id: 3,
            cliente: 'Carmen Flores',
            direccion: 'Col. Miraflores, Calle 3, Casa #12',
            telefono: '+504 8877-6644',
            servicios: ['Lavado Estándar', 'Limpieza en Seco'],
            serviciosDetalle: [
              { nombre: 'Lavado Estándar', precio: 7.99 },
              { nombre: 'Limpieza en Seco', precio: 19.99 }
            ],
            total: 27.98,
            fecha_asignacion: new Date('2024-02-22 08:00'),
            fecha_entrega: new Date('2024-02-22 10:15'),
            notas: ''
          }
        ]
      }
    },
    computed: {
      pedidosFiltrados() {
        if (!this.searchQuery) return this.pedidosHistorial;
  
        const searchTerm = this.searchQuery.toLowerCase();
        return this.pedidosHistorial.filter(pedido => 
          pedido.cliente.toLowerCase().includes(searchTerm) ||
          pedido.direccion.toLowerCase().includes(searchTerm) ||
          pedido.servicios.some(s => s.toLowerCase().includes(searchTerm))
        );
      },
      paginatedPedidos() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.pedidosFiltrados.slice(startIndex, endIndex);
      },
      totalPages() {
        return Math.ceil(this.pedidosFiltrados.length / this.pageSize) || 1;
      }
    },
    methods: {
      handleSidebarToggle(expanded) {
        this.isSidebarExpanded = expanded;
      },
      formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      verDetalles(pedido) {
        this.pedidoDetalle = {...pedido};
        this.showDetailsModal = true;
      },
      cerrarDetalles() {
        this.showDetailsModal = false;
        this.pedidoDetalle = null;
      },
      previousPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      }
    },
    mounted() {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }
  </script>
  
  <style src="@/assets/css/HistorialRepartidor.css" scoped></style>