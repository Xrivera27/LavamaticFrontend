<template>
    <div class="admin-layout">
      <SidebarAdmin @sidebar-toggle="handleSidebarToggle" />
      <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
        <div class="pedidos-wrapper">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
          
          <div class="header-section">
            <h1 class="page-title">Gestión de Pedidos</h1>
          </div>
  
          <!-- Pestañas de estados -->
          <div class="tabs-container">
            <button 
              class="tab-button" 
              :class="{ active: estadoActual === 'espera' }"
              @click="cambiarEstado('espera')"
            >
              En Espera
              <span class="badge" v-if="pedidosEnEspera.length">{{ pedidosEnEspera.length }}</span>
            </button>
            <button 
              class="tab-button" 
              :class="{ active: estadoActual === 'asignados' }"
              @click="cambiarEstado('asignados')"
            >
              Asignados
              <span class="badge" v-if="pedidosAsignados.length">{{ pedidosAsignados.length }}</span>
            </button>
            <button 
              class="tab-button" 
              :class="{ active: estadoActual === 'finalizados' }"
              @click="cambiarEstado('finalizados')"
            >
              Finalizados
            </button>
          </div>
      
          <div class="opciones">
            <div class="search-bar">
              <input
                class="busqueda"
                type="text"
                v-model="searchQuery"
                :placeholder="'Buscar pedido ' + placeholderBusqueda"
              />
            </div>
          </div>
      
          <div class="table-container">
            <div v-if="isLoading" class="loading-indicator">
              Cargando pedidos...
            </div>
      
            <div v-else-if="pedidosFiltrados.length === 0" class="no-data">
              No se encontraron pedidos para mostrar.
            </div>
      
            <table v-else class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Servicios</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th v-if="estadoActual === 'asignados'">Repartidor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pedido, index) in paginatedPedidos" :key="index">
                  <td data-label="#">
                    {{ (currentPage - 1) * pageSize + index + 1 }}
                  </td>
                  <td data-label="Cliente">{{ pedido.cliente }}</td>
                  <td data-label="Servicios">
                    <div class="servicios-lista">
                      {{ pedido.servicios.join(', ') }}
                    </div>
                  </td>
                  <td data-label="Total">${{ pedido.total.toFixed(2) }}</td>
                  <td data-label="Fecha">{{ formatDate(pedido.fecha) }}</td>
                  <td v-if="estadoActual === 'asignados'" data-label="Repartidor">
                    {{ pedido.repartidor }}
                  </td>
                  <td data-label="Estado">
                    <span :class="'badge ' + getEstadoClass(pedido.estado)">
                      {{ pedido.estado }}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      class="btn btn-info"
                      @click="verDetalles(pedido)"
                      title="Ver detalles"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    
                    <!-- Botón para asignar repartidor (solo en estado 'en espera') -->
                    <button
                      v-if="estadoActual === 'espera'"
                      class="btn btn-primary"
                      @click="asignarRepartidor(pedido)"
                      title="Asignar repartidor"
                    >
                      <i class="fa-solid fa-user-plus"></i>
                    </button>
  
                    <!-- Botón para volver a poner en espera (solo en estado 'asignados') -->
                    <button
                      v-if="estadoActual === 'asignados'"
                      class="btn btn-warning"
                      @click="volverAEspera(pedido)"
                      title="Volver a espera"
                    >
                      <i class="fa-solid fa-rotate-left"></i>
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
                <button
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
                    <strong>Fecha:</strong>
                    <span>{{ formatDate(pedidoDetalle.fecha) }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Estado:</strong>
                    <span :class="'badge ' + getEstadoClass(pedidoDetalle.estado)">
                      {{ pedidoDetalle.estado }}
                    </span>
                  </div>
                  <div class="detalle-row" v-if="pedidoDetalle.repartidor">
                    <strong>Repartidor:</strong>
                    <span>{{ pedidoDetalle.repartidor }}</span>
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
                  <div class="detalle-row">
                    <strong>Dirección de Entrega:</strong>
                    <span>{{ pedidoDetalle.direccion }}</span>
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
  
          <!-- Modal para asignar repartidor -->
          <div class="modal" v-if="showAsignarModal">
            <div class="modal-asignar">
              <div class="modal-header">
                <h2>Asignar Repartidor</h2>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>Seleccionar Repartidor:</label>
                  <select v-model="repartidorSeleccionado" required>
                    <option value="">Seleccione un repartidor</option>
                    <option v-for="repartidor in repartidoresDisponibles" :key="repartidor.id" :value="repartidor">
                      {{ repartidor.nombre }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <div class="action-buttons">
                  <button 
                    class="btn btn-primary"
                    @click="confirmarAsignacion"
                    :disabled="!repartidorSeleccionado"
                  >
                    Asignar
                  </button>
                  <button class="btn btn-secondary" @click="cancelarAsignacion">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Modal de confirmación para volver a espera -->
          <div class="modal" v-if="showConfirmModal">
            <div class="modal-confirm">
              <div class="modal-header">
                <h2>Confirmación</h2>
              </div>
              <div class="modal-body-confirm">
                <p>¿Estás seguro de que quieres volver este pedido a estado "En Espera"?</p>
                <p>El repartidor actual será desasignado.</p>
              </div>
              <div class="modal-footer">
                <div class="action-buttons">
                  <button class="btn btn-warning" @click="confirmarVolverAEspera">
                    Sí, volver a espera
                  </button>
                  <button class="btn btn-secondary" @click="cancelarVolverAEspera">
                    No, cancelar
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
  import SidebarAdmin from './SidebarAdmin.vue';
  
  export default {
    name: "gestionPedidos",
    components: {
      SidebarAdmin
    },
    data() {
      return {
        isSidebarExpanded: false,
        showDetailsModal: false,
        showAsignarModal: false,
        showConfirmModal: false,
        isLoading: false,
        searchQuery: "",
        currentPage: 1,
        pageSize: 10,
        estadoActual: 'espera', // 'espera', 'asignados', 'finalizados'
        pedidoDetalle: null,
        pedidoSeleccionado: null,
        repartidorSeleccionado: null,
        // Lista de repartidores disponibles (simulada)
        repartidoresDisponibles: [
          { id: 1, nombre: 'Juan Pérez' },
          { id: 2, nombre: 'María López' },
          { id: 3, nombre: 'Carlos Rodríguez' },
          { id: 4, nombre: 'Ana García' }
        ],
        // Lista de pedidos (simulada)
        pedidos: [
          {
            id: 1,
            cliente: 'Roberto Mendoza',
            servicios: ['Lavado Estándar', 'Planchado'],
            serviciosDetalle: [
              { nombre: 'Lavado Estándar', precio: 7.99 },
              { nombre: 'Planchado', precio: 5.99 }
            ],
            total: 13.98,
            fecha: new Date('2024-02-20'),
            estado: 'En Espera',
            direccion: 'Colonia Kennedy, Calle Principal #123',
            notas: 'Preferiblemente entregar por la tarde'
          },
          {
            id: 2,
            cliente: 'María Torres',
            servicios: ['Lavado Express', 'Limpieza en Seco'],
            serviciosDetalle: [
              { nombre: 'Lavado Express', precio: 12.99 },
              { nombre: 'Limpieza en Seco', precio: 19.99 }
            ],
            total: 32.98,
            fecha: new Date('2024-02-21'),
            estado: 'Asignado',
            repartidor: 'Juan Pérez',
            direccion: 'Residencial Las Uvas, Casa #45',
            notas: 'Llamar antes de entregar'
          },
          {
            id: 3,
            cliente: 'Carlos Ruiz',
            servicios: ['Lavado y Planchado'],
            serviciosDetalle: [
              { nombre: 'Lavado y Planchado', precio: 15.99 }
            ],
            total: 15.99,
            fecha: new Date('2024-02-19'),
            estado: 'Finalizado',
            repartidor: 'María López',
            direccion: 'Barrio El Centro, Avenida Principal #78',
            notas: ''
          }
        ]
      };
    },
    computed: {
      placeholderBusqueda() {
        switch(this.estadoActual) {
          case 'espera': return 'en espera...';
          case 'asignados': return 'asignados...';
          case 'finalizados': return 'finalizados...';
          default: return '...';
        }
      },
      pedidosEnEspera() {
        return this.pedidos.filter(p => p.estado === 'En Espera');
      },
      pedidosAsignados() {
        return this.pedidos.filter(p => p.estado === 'Asignado');
      },
      pedidosFiltrados() {
        let pedidosFiltrados = this.pedidos.filter(pedido => {
          // Filtrar por estado
          switch(this.estadoActual) {
            case 'espera':
              if (pedido.estado !== 'En Espera') return false;
              break
              case 'asignados':
            if (pedido.estado !== 'Asignado') return false;
            break;
          case 'finalizados':
            if (pedido.estado !== 'Finalizado') return false;
            break;
        }
        
        // Filtrar por término de búsqueda
        const searchTermLower = this.searchQuery.toLowerCase();
        
        return (
          pedido.cliente.toLowerCase().includes(searchTermLower) ||
          pedido.servicios.join(' ').toLowerCase().includes(searchTermLower) ||
          pedido.total.toString().includes(searchTermLower) ||
          (pedido.repartidor && pedido.repartidor.toLowerCase().includes(searchTermLower))
        );
      });

      return pedidosFiltrados;
    },
    paginatedPedidos() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.pedidosFiltrados.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.pedidosFiltrados.length / this.pageSize) || 1;
    },
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    cambiarEstado(estado) {
      this.estadoActual = estado;
      this.currentPage = 1;
      this.searchQuery = '';
    },
    formatDate(date) {
      if (!date) return '';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    },
    getEstadoClass(estado) {
      switch(estado) {
        case 'En Espera': return 'badge-warning';
        case 'Asignado': return 'badge-primary';
        case 'Finalizado': return 'badge-success';
        default: return 'badge-secondary';
      }
    },
    verDetalles(pedido) {
      this.pedidoDetalle = {...pedido};
      this.showDetailsModal = true;
    },
    cerrarDetalles() {
      this.showDetailsModal = false;
      this.pedidoDetalle = null;
    },
    asignarRepartidor(pedido) {
      this.pedidoSeleccionado = pedido;
      this.repartidorSeleccionado = null;
      this.showAsignarModal = true;
    },
    confirmarAsignacion() {
      if (!this.repartidorSeleccionado) return;
      
      this.isLoading = true;
      
      setTimeout(() => {
        const index = this.pedidos.findIndex(p => p.id === this.pedidoSeleccionado.id);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'Asignado',
            repartidor: this.repartidorSeleccionado.nombre
          };
        }
        
        alert("Repartidor asignado correctamente");
        this.isLoading = false;
        this.showAsignarModal = false;
        this.pedidoSeleccionado = null;
        this.repartidorSeleccionado = null;
      }, 1000);
    },
    cancelarAsignacion() {
      this.showAsignarModal = false;
      this.pedidoSeleccionado = null;
      this.repartidorSeleccionado = null;
    },
    volverAEspera(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showConfirmModal = true;
    },
    confirmarVolverAEspera() {
      this.isLoading = true;
      
      setTimeout(() => {
        const index = this.pedidos.findIndex(p => p.id === this.pedidoSeleccionado.id);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'En Espera',
            repartidor: null
          };
        }
        
        alert("Pedido vuelto a estado 'En Espera' correctamente");
        this.isLoading = false;
        this.showConfirmModal = false;
        this.pedidoSeleccionado = null;
      }, 1000);
    },
    cancelarVolverAEspera() {
      this.showConfirmModal = false;
      this.pedidoSeleccionado = null;
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
    // Simulación de carga de datos
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
};
</script>

<style src="@/assets/css/CrearPedidos.css" scoped>
</style>