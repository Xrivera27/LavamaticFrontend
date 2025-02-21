<template>
    <div class="page-layout">
      <Sidebarcliente @sidebar-toggle="handleSidebarToggle" />
      <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
        <div class="header">
          <div class="logo">
            <i class="fa-solid fa-shirt"></i>
            <span>Lavamatic</span>
          </div>
          <div class="notifications">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </div>
          <div class="user-info">
            <span>Gerson Rivera</span>
            <span class="user-role">Cliente</span>
          </div>
        </div>
  
        <div class="historial-container">
          <h1 class="page-title">Historial de Pedidos</h1>
          
          <!-- Tabs de navegación -->
          <div class="tabs-container">
            <div 
              v-for="tab in tabs" 
              :key="tab.id" 
              class="tab" 
              :class="{ 'active': activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <i :class="tab.icon"></i>
              {{ tab.name }}
              <span class="tab-count">{{ filteredOrders.length }}</span>
            </div>
          </div>
  
          <!-- Contenido principal -->
          <div class="orders-container">
            <!-- Barra de búsqueda y filtros -->
            <div class="search-bar">
              <div class="search-input">
                <i class="fas fa-search"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Buscar por número o tipo de servicio..."
                />
              </div>
              <div class="date-filter">
                <label>Desde:</label>
                <input type="date" v-model="dateFilter.from" />
                <label>Hasta:</label>
                <input type="date" v-model="dateFilter.to" />
              </div>
            </div>
  
            <!-- Tabla de órdenes -->
            <div class="orders-table-container">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Orden #</th>
                    <th>Fecha</th>
                    <th>Servicios</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="paginatedOrders.length === 0">
                    <td colspan="6" class="no-orders">
                      No se encontraron órdenes para mostrar.
                    </td>
                  </tr>
                  <tr v-for="order in paginatedOrders" :key="order.id">
                    <td>{{ order.id }}</td>
                    <td>{{ formatDate(order.fecha) }}</td>
                    <td>
                      <div class="service-tags">
                        <span 
                          v-for="(servicio, index) in order.servicios" 
                          :key="index" 
                          class="service-tag"
                        >
                          {{ servicio }}
                        </span>
                      </div>
                    </td>
                    <td>L.{{ order.total.toFixed(2) }}</td>
                    <td>
                      <span 
                        class="status-badge" 
                        :class="`status-${order.estado.toLowerCase()}`"
                      >
                        {{ order.estado }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button @click="verDetalles(order)" class="btn-details">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button 
                          v-if="order.estado === 'Activa'" 
                          @click="cancelarOrden(order)" 
                          class="btn-cancel"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <!-- Paginación -->
            <div class="pagination">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1" 
                class="page-btn"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <template v-for="page in totalPages" :key="page">
                <button 
                  v-if="showPageButton(page)" 
                  @click="currentPage = page" 
                  class="page-btn" 
                  :class="{ 'active': currentPage === page }"
                >
                  {{ page }}
                </button>
                <span v-else-if="showEllipsis(page)" class="ellipsis">...</span>
              </template>
              
              <button 
                @click="currentPage++" 
                :disabled="currentPage === totalPages" 
                class="page-btn"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
  
        <!-- Modal para detalles de la orden -->
        <div class="order-details-modal" v-if="selectedOrder" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Detalles de la Orden #{{ selectedOrder.id }}</h3>
              <button class="close-btn" @click="closeModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="order-info">
                <div class="info-row">
                  <span class="info-label">Fecha:</span>
                  <span>{{ formatDate(selectedOrder.fecha) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Estado:</span>
                  <span 
                    class="status-badge" 
                    :class="`status-${selectedOrder.estado.toLowerCase()}`"
                  >
                    {{ selectedOrder.estado }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Entrega:</span>
                  <span>{{ selectedOrder.entrega }}</span>
                </div>
                <div class="info-row" v-if="selectedOrder.fechaEntrega">
                  <span class="info-label">Fecha estimada de entrega:</span>
                  <span>{{ formatDate(selectedOrder.fechaEntrega) }}</span>
                </div>
              </div>
  
              <h4>Servicios</h4>
              <div class="order-items">
                <div 
                  v-for="(item, index) in selectedOrder.items" 
                  :key="index" 
                  class="order-item"
                >
                  <div class="item-details">
                    <span class="item-name">{{ item.tipo }}</span>
                    <span class="item-quantity">{{ item.cantidad }}x</span>
                  </div>
                  <span class="item-price">L.{{ (item.precio * item.cantidad).toFixed(2) }}</span>
                </div>
              </div>
  
              <div class="order-summary">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>L.{{ selectedOrder.subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-row" v-if="selectedOrder.descuento">
                  <span>Descuento</span>
                  <span>-L.{{ selectedOrder.descuento.toFixed(2) }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>L.{{ selectedOrder.total.toFixed(2) }}</span>
                </div>
              </div>
  
              <div class="tracking-info" v-if="selectedOrder.tracking">
                <h4>Seguimiento de la Orden</h4>
                <div class="tracking-timeline">
                  <div 
                    v-for="(step, index) in selectedOrder.tracking" 
                    :key="index" 
                    class="tracking-step"
                    :class="{ 'completed': step.completado }"
                  >
                    <div class="step-indicator">
                      <div class="step-icon">
                        <i :class="step.icon"></i>
                      </div>
                      <div class="step-line" v-if="index < selectedOrder.tracking.length - 1"></div>
                    </div>
                    <div class="step-content">
                      <div class="step-title">{{ step.titulo }}</div>
                      <div class="step-datetime" v-if="step.completado">
                        {{ formatDate(step.fecha) }} - {{ step.hora }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer" v-if="selectedOrder.estado === 'Activa'">
              <button class="btn-cancel-order" @click="cancelarOrden(selectedOrder)">
                Cancelar Orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebarcliente from './Sidebarcliente.vue'
  
  export default {
    name: 'HistorialPedidos',
    components: {
      Sidebarcliente
    },
    data() {
      return {
        isSidebarExpanded: false,
        activeTab: 'todas',
        searchQuery: '',
        dateFilter: {
          from: '',
          to: ''
        },
        currentPage: 1,
        pageSize: 5,
        selectedOrder: null,
        tabs: [
          { id: 'todas', name: 'Todas', icon: 'fas fa-list' },
          { id: 'activa', name: 'Activas', icon: 'fas fa-spinner' },
          { id: 'en-camino', name: 'En Camino', icon: 'fas fa-truck' },
          { id: 'finalizada', name: 'Finalizadas', icon: 'fas fa-check-circle' }
        ],
        // Datos de prueba (simulando respuesta del backend)
        orders: [
          {
            id: 1001,
            fecha: new Date(2023, 1, 15),
            servicios: ['LAVADO NORMAL', 'PLANCHADO'],
            total: 125.00,
            estado: 'Activa',
            entrega: 'A domicilio',
            subtotal: 125.00,
            items: [
              { tipo: 'LAVADO NORMAL', cantidad: 2, precio: 50.00 },
              { tipo: 'PLANCHADO', cantidad: 1, precio: 25.00 }
            ],
            tracking: [
              { titulo: 'Orden Recibida', completado: true, fecha: new Date(2023, 1, 15), hora: '10:30 AM', icon: 'fas fa-clipboard-check' },
              { titulo: 'En Proceso', completado: true, fecha: new Date(2023, 1, 15), hora: '01:45 PM', icon: 'fas fa-soap' },
              { titulo: 'Listo para Entrega', completado: false, fecha: null, hora: null, icon: 'fas fa-box' },
              { titulo: 'En Camino', completado: false, fecha: null, hora: null, icon: 'fas fa-truck' },
              { titulo: 'Entregado', completado: false, fecha: null, hora: null, icon: 'fas fa-house-user' }
            ]
          },
          {
            id: 1002,
            fecha: new Date(2023, 1, 18),
            servicios: ['LAVADO ESPECIAL'],
            total: 75.00,
            estado: 'En Camino',
            entrega: 'A domicilio',
            fechaEntrega: new Date(2023, 1, 20),
            subtotal: 75.00,
            items: [
              { tipo: 'LAVADO ESPECIAL', cantidad: 1, precio: 75.00 }
            ],
            tracking: [
              { titulo: 'Orden Recibida', completado: true, fecha: new Date(2023, 1, 18), hora: '09:15 AM', icon: 'fas fa-clipboard-check' },
              { titulo: 'En Proceso', completado: true, fecha: new Date(2023, 1, 18), hora: '11:30 AM', icon: 'fas fa-soap' },
              { titulo: 'Listo para Entrega', completado: true, fecha: new Date(2023, 1, 19), hora: '04:20 PM', icon: 'fas fa-box' },
              { titulo: 'En Camino', completado: true, fecha: new Date(2023, 1, 20), hora: '10:00 AM', icon: 'fas fa-truck' },
              { titulo: 'Entregado', completado: false, fecha: null, hora: null, icon: 'fas fa-house-user' }
            ]
          },
          {
            id: 1003,
            fecha: new Date(2023, 1, 10),
            servicios: ['LAVADO NORMAL', 'LAVADO ETIQUETA'],
            total: 150.00,
            estado: 'Finalizada',
            entrega: 'Recogida en tienda',
            subtotal: 150.00,
            items: [
              { tipo: 'LAVADO NORMAL', cantidad: 1, precio: 50.00 },
              { tipo: 'LAVADO ETIQUETA', cantidad: 1, precio: 100.00 }
            ],
            tracking: [
              { titulo: 'Orden Recibida', completado: true, fecha: new Date(2023, 1, 10), hora: '11:00 AM', icon: 'fas fa-clipboard-check' },
              { titulo: 'En Proceso', completado: true, fecha: new Date(2023, 1, 10), hora: '02:30 PM', icon: 'fas fa-soap' },
              { titulo: 'Listo para Recogida', completado: true, fecha: new Date(2023, 1, 12), hora: '10:45 AM', icon: 'fas fa-box' },
              { titulo: 'Recogido', completado: true, fecha: new Date(2023, 1, 12), hora: '05:30 PM', icon: 'fas fa-check-circle' }
            ]
          },
          {
            id: 1004,
            fecha: new Date(2023, 2, 5),
            servicios: ['LAVADO ESPECIAL', 'PLANCHADO'],
            total: 100.00,
            estado: 'Finalizada',
            entrega: 'A domicilio',
            subtotal: 100.00,
            items: [
              { tipo: 'LAVADO ESPECIAL', cantidad: 1, precio: 75.00 },
              { tipo: 'PLANCHADO', cantidad: 1, precio: 25.00 }
            ]
          },
          {
            id: 1005,
            fecha: new Date(2023, 2, 8),
            servicios: ['LAVADO NORMAL'],
            total: 50.00,
            estado: 'Activa',
            entrega: 'Recogida en tienda',
            subtotal: 50.00,
            items: [
              { tipo: 'LAVADO NORMAL', cantidad: 1, precio: 50.00 }
            ]
          },
          {
            id: 1006,
            fecha: new Date(2023, 2, 12),
            servicios: ['LAVADO ETIQUETA'],
            total: 100.00,
            estado: 'En Camino',
            entrega: 'A domicilio',
            fechaEntrega: new Date(2023, 2, 14),
            subtotal: 100.00,
            items: [
              { tipo: 'LAVADO ETIQUETA', cantidad: 1, precio: 100.00 }
            ]
          },
          {
            id: 1007,
            fecha: new Date(2023, 2, 15),
            servicios: ['LAVADO NORMAL', 'LAVADO ESPECIAL'],
            total: 125.00,
            estado: 'Activa',
            entrega: 'A domicilio',
            subtotal: 125.00,
            items: [
              { tipo: 'LAVADO NORMAL', cantidad: 1, precio: 50.00 },
              { tipo: 'LAVADO ESPECIAL', cantidad: 1, precio: 75.00 }
            ]
          }
        ]
      }
    },
    computed: {
      filteredOrders() {
        let result = [...this.orders];
        
        // Filtrar por pestaña activa
        if (this.activeTab !== 'todas') {
          const statusMap = {
            'activa': 'Activa',
            'en-camino': 'En Camino',
            'finalizada': 'Finalizada'
          };
          
          result = result.filter(order => order.estado === statusMap[this.activeTab]);
        }
        
        // Filtrar por búsqueda
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase();
          result = result.filter(order => 
            order.id.toString().includes(query) || 
            order.servicios.some(servicio => servicio.toLowerCase().includes(query))
          );
        }
        
        // Filtrar por fechas
        if (this.dateFilter.from) {
          const fromDate = new Date(this.dateFilter.from);
          result = result.filter(order => new Date(order.fecha) >= fromDate);
        }
        
        if (this.dateFilter.to) {
          const toDate = new Date(this.dateFilter.to);
          toDate.setHours(23, 59, 59, 999); // Hasta el final del día
          result = result.filter(order => new Date(order.fecha) <= toDate);
        }
        
        return result;
      },
      
      totalPages() {
        return Math.ceil(this.filteredOrders.length / this.pageSize);
      },
      
      paginatedOrders() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredOrders.slice(start, end);
      }
    },
    watch: {
      activeTab() {
        this.currentPage = 1; // Resetear a la primera página al cambiar de pestaña
      },
      searchQuery() {
        this.currentPage = 1; // Resetear a la primera página al buscar
      },
      dateFilter: {
        deep: true,
        handler() {
          this.currentPage = 1; // Resetear a la primera página al filtrar por fecha
        }
      }
    },
    methods: {
      handleSidebarToggle(expanded) {
        this.isSidebarExpanded = expanded;
      },
      
      formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('es-HN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      },
      
      verDetalles(order) {
        this.selectedOrder = { ...order };
      },
      
      closeModal() {
        this.selectedOrder = null;
      },
      
      cancelarOrden(order) {
        if (confirm(`¿Estás seguro que deseas cancelar la orden #${order.id}?`)) {
          // Aquí iría la lógica para cancelar la orden en el backend
          alert(`Orden #${order.id} cancelada con éxito.`);
          // Actualiza el estado en el frontend para feedback inmediato
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index].estado = 'Cancelada';
          }
          this.closeModal();
        }
      },
      
      showPageButton(page) {
        // Mostrar siempre la primera y última página
        if (page === 1 || page === this.totalPages) return true;
        
        // Mostrar páginas cercanas a la actual
        if (Math.abs(page - this.currentPage) <= 1) return true;
        
        return false;
      },
      
      showEllipsis(page) {
        if (page === 1 || page === this.totalPages) return false;
        
        if (page === this.currentPage - 2 && this.currentPage > 3) return true;
        if (page === this.currentPage + 2 && this.currentPage < this.totalPages - 2) return true;
        
        return false;
      }
    }
  };
  </script>
  
  <style src="@/assets/css/HistorialPedidoCliente.css" scoped></style>