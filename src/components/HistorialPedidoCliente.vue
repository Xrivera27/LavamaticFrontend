<template>
  <div class="page-layout">
    <SidebarDinamico @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="header">
      
      </div>

      <div class="historial-container">
        <h1 class="page-title">Historial de Pedidos</h1>
        
        <!-- Tabs de navegación con contadores corregidos -->
        <div class="tabs-container">
          <div 
            v-for="tab in tabs" 
            :key="tab.id" 
            class="tab" 
            :class="{ 'active': activeTab === tab.id }"
            @click="setActiveTab(tab.id)"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
            <span class="tab-count">{{ getOrderCountByTab(tab.id) }}</span>
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

          <!-- Loading indicator -->
          <div v-if="loading" class="loading-indicator">
            <i class="fas fa-spinner fa-spin"></i> Cargando pedidos...
          </div>

          <!-- Tabla de órdenes -->
          <div v-else class="orders-table-container">
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
                <tr v-for="order in paginatedOrders" :key="order.id_pedido">
                  <td>{{ order.id_pedido }}</td>
                  <td>{{ formatDate(order.fecha_creacion || order.fecha) }}</td>
                  <td>
                    <div class="service-tags">
                      <span 
                        v-for="(servicio, index) in getServiciosArray(order)" 
                        :key="index" 
                        class="service-tag"
                      >
                        {{ getServicioNombre(servicio) }}
                      </span>
                    </div>
                  </td>
                  <td>L.{{ typeof order.total === 'number' ? order.total.toFixed(2) : order.total }}</td>
                  <td>
                    <span 
                      class="status-badge" 
                      :class="`status-${formatStatusClass(order.id_estado)}`"
                    >
                      {{ getEstadoNombre(order.id_estado) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="verDetalles(order)" class="btn-details">
                        <i class="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div v-if="!loading && totalPages > 0" class="pagination">
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

     <!-- Modal para detalles de la orden con estructura consistente -->
<div class="order-details-modal" v-if="selectedOrder" @click="closeModal">
  <div class="modal-content" @click.stop>
    <div class="modal-header">
      <h3>Detalles de la Orden #{{ selectedOrder.id_pedido }}</h3>
      <button class="close-btn" @click="closeModal">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      <!-- Layout principal con estructura de dos columnas -->
      <div class="order-main-layout">
        <!-- Columna izquierda con total e info básica -->
        <div class="order-left-column">
          <!-- Total destacado -->
          <div class="order-total-highlight">
            <span>Total:</span>
            <span class="total-price">L.{{ typeof selectedOrder.total === 'number' ? selectedOrder.total.toFixed(2) : selectedOrder.total }}</span>
          </div>
          
          <!-- Info básica -->
          <div class="order-basic-info">
            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span>{{ formatDate(selectedOrder.fecha_creacion || selectedOrder.fecha) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <span 
                class="status-badge" 
                :class="`status-${formatStatusClass(selectedOrder.id_estado)}`"
              >
                {{ getEstadoNombre(selectedOrder.id_estado) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Entrega:</span>
              <span>{{ isRecogidaEnTienda(selectedOrder) ? 'En tienda' : 'A domicilio' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Columna derecha con servicios -->
        <div class="order-right-column">
          <h4>Servicios</h4>
          <div v-for="(item, index) in getServiciosDetallados(selectedOrder)" :key="index" class="service-item">
            <div class="service-name">{{ item.nombre }}</div>
            <div class="service-details">
              <span class="service-quantity">{{ item.cantidad }}x</span>
              <span class="service-price">L.{{ typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : item.subtotal }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sección de seguimiento horizontal -->
      <div class="tracking-section">
        <h4>Seguimiento de la Orden</h4>
        <div class="tracking-timeline-horizontal">
          <div 
            v-for="(step, index) in getTrackingSteps(selectedOrder)" 
            :key="index" 
            class="tracking-step"
            :class="{ 'completed': step.completado }"
          >
            <div class="step-icon">
              <i :class="step.icon"></i>
            </div>
            <div class="step-line" v-if="index < getTrackingSteps(selectedOrder).length - 1"></div>
            <div class="step-content">
              <div class="step-title">{{ step.titulo }}</div>
              <div class="step-datetime" v-if="step.completado">
                {{ formatDate(step.fecha) }}
              </div>
            </div>
          </div>
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
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: 'HistorialPedidos',
  components: {
    SidebarDinamico
  },
  setup() {
    const toast = useToast();
    return { toast };
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
      loading: true,
      orders: [],
      showCancelConfirmation: false,
      pedidoACancelar: null,
      tabs: [
        { id: 'todas', name: 'Todas', icon: 'fas fa-list' },
        { id: 'activa', name: 'En Espera', icon: 'fas fa-clock' },
        { id: 'en-camino', name: 'En Camino', icon: 'fas fa-truck' },
        { id: 'entregada', name: 'Entregadas', icon: 'fas fa-check-circle' }
      ],
      estados: [
        { id: 1, nombre: 'En Espera', descripcion: 'Pedidos que se han hecho y no tienen asignacion de repartidor' },
        { id: 2, nombre: 'En Camino', descripcion: 'Repartidor va en camino a recoger o entregar producto' },
        { id: 3, nombre: 'Entregada', descripcion: 'Entregadas tanto en lavamatic, como en casa del cliente' },
        { id: 4, nombre: 'Listo para recoger', descripcion: 'Son productos que estan listo para ser recogidos en tienda' }
      ]
    }
  },
  computed: {
    filteredOrders() {
      let result = [...this.orders];
      
      // Filtrar por pestaña activa
      if (this.activeTab !== 'todas') {
        const statusMap = {
          'activa': 1,         // En Espera
          'listo': 4,          // Listo para recoger
          'en-camino': 2,      // En camino
          'entregada': 3       // Entregada
        };
        
        result = result.filter(order => {
          // Convertir a número si viene como string
          const idEstado = typeof order.id_estado === 'string' 
            ? parseInt(order.id_estado, 10) 
            : order.id_estado;
          return idEstado === statusMap[this.activeTab];
        });
      }
      
      // Filtrar por búsqueda
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(order => {
          // Buscar en ID
          const idMatch = order.id_pedido && order.id_pedido.toString().includes(query);
          
          // Buscar en servicios (considerando diferentes estructuras posibles)
          let servicioMatch = false;
          const servicios = this.getServiciosArray(order);
          
          if (servicios && servicios.length > 0) {
            servicioMatch = servicios.some(servicio => {
              // Si el servicio tiene un objeto servicio anidado
              if (servicio.servicio && servicio.servicio.nombre) {
                return servicio.servicio.nombre.toLowerCase().includes(query);
              }
              // Si el servicio tiene directamente un nombre
              if (servicio.nombre) {
                return servicio.nombre.toLowerCase().includes(query);
              }
              return false;
            });
          }
          
          return idMatch || servicioMatch;
        });
      }
      
      // Filtrar por fechas
      if (this.dateFilter.from) {
        const fromDate = new Date(this.dateFilter.from);
        result = result.filter(order => {
          const orderDate = new Date(order.fecha_creacion || order.fecha);
          return orderDate >= fromDate;
        });
      }
      
      if (this.dateFilter.to) {
        const toDate = new Date(this.dateFilter.to);
        toDate.setHours(23, 59, 59, 999); // Hasta el final del día
        result = result.filter(order => {
          const orderDate = new Date(order.fecha_creacion || order.fecha);
          return orderDate <= toDate;
        });
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
    },
    
    // Contadores para cada tipo de orden - usados para las pestañas
    orderCounts() {
      const counts = {
        todas: this.orders.length,
        activa: 0,
        'en-camino': 0,
        entregada: 0,
        listo: 0
      };
      
      // Contar órdenes por estado
      this.orders.forEach(order => {
        // Convertir a número si viene como string
        const idEstado = typeof order.id_estado === 'string' 
          ? parseInt(order.id_estado, 10) 
          : order.id_estado;
        
        if (idEstado === 1) {
          counts.activa++;
        } else if (idEstado === 2) {
          counts['en-camino']++;
        } else if (idEstado === 3) {
          counts.entregada++;
        } else if (idEstado === 4) {
          counts.listo++;
        }
      });
      
      return counts;
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
  created() {
    this.fetchPedidos();
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    setActiveTab(tabId) {
      this.activeTab = tabId;
      // Si estamos cambiando a un tab específico, podríamos hacer una llamada a la API con ese filtro
      if (tabId !== 'todas') {
        this.fetchPedidosByEstado(tabId);
      } else {
        this.fetchPedidos();
      }
    },

    // Método para obtener el nombre del estado según su ID
    getEstadoNombre(id_estado) {
      // Convertir a número si viene como string
      const idEstado = typeof id_estado === 'string' 
        ? parseInt(id_estado, 10) 
        : id_estado;
        
      const estado = this.estados.find(e => e.id === idEstado);
      return estado ? estado.nombre : 'Desconocido';
    },
    
    // Método para obtener conteo de órdenes por pestaña
    getOrderCountByTab(tabId) {
      return this.orderCounts[tabId];
    },
    
    // Obtener array de servicios, independientemente de la estructura de datos
    getServiciosArray(order) {
      if (!order) return [];
      
      if (order.servicios && Array.isArray(order.servicios)) {
        return order.servicios;
      }
      
      // Si no hay servicios, devolvemos un array vacío
      return [];
    },
    
    // Obtener el nombre de un servicio
    getServicioNombre(servicio) {
      if (!servicio) return 'Servicio';
      
      // Si el servicio tiene un objeto servicio anidado
      if (servicio.servicio && servicio.servicio.nombre) {
        return servicio.servicio.nombre;
      }
      
      // Si el servicio tiene directamente un nombre
      if (servicio.nombre) {
        return servicio.nombre;
      }
      
      return 'Servicio';
    },
    
    // Obtener servicios detallados para la vista de detalle
    getServiciosDetallados(order) {
      if (!order) return [];
      
      const serviciosArray = this.getServiciosArray(order);
      
      return serviciosArray.map(servicio => {
        // Si el servicio tiene un objeto servicio anidado
        if (servicio.servicio) {
          const precio = servicio.servicio.precio 
            ? parseFloat(servicio.servicio.precio) 
            : 0;
          const cantidad = servicio.cantidad 
            ? parseInt(servicio.cantidad, 10) 
            : 1;
          return {
            nombre: servicio.servicio.nombre || 'Servicio',
            precio: precio,
            cantidad: cantidad,
            subtotal: precio * cantidad
          };
        }
        
        // Si el servicio tiene directamente sus propiedades
        const precio = servicio.precio 
          ? parseFloat(servicio.precio) 
          : 0;
        const cantidad = servicio.cantidad 
          ? parseInt(servicio.cantidad, 10) 
          : 1;
        const subtotal = servicio.subtotal 
          ? parseFloat(servicio.subtotal) 
          : precio * cantidad;
          
        return {
          nombre: servicio.nombre || 'Servicio',
          precio: precio,
          cantidad: cantidad,
          subtotal: subtotal
        };
      });
    },
    
    // Verificar si es recogida en tienda
    isRecogidaEnTienda(order) {
      if (!order) return false;
      
      const direccionEntrega = order.direccion_entrega || '';
      return direccionEntrega.toLowerCase().includes('recoger en sucursal') || 
             direccionEntrega.toLowerCase().includes('tienda') ||
             direccionEntrega.toLowerCase().includes('local');
    },
    
    formatDate(date) {
      if (!date) return '';
      
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        
        return d.toLocaleDateString('es-HN', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      } catch (error) {
        console.error('Error al formatear fecha:', error);
        return 'Fecha inválida';
      }
    },

    // Formatea un estado para usar en clases CSS
    formatStatusClass(estado) {
      // Convertir a número si es string
      const idEstado = typeof estado === 'string' 
        ? parseInt(estado, 10) 
        : estado;
        
      // Usar el mapa de estados
      switch (idEstado) {
        case 1: return 'en-espera';
        case 2: return 'en-camino';
        case 3: return 'entregada';
        case 4: return 'listo-para-recoger';
        default: return 'desconocido';
      }
    },
    
    async verDetalles(order) {
      // Clonamos la orden para evitar cambios reactivos en la vista
      this.selectedOrder = JSON.parse(JSON.stringify(order));
      
      // Si el pedido no tiene detalles completos, podemos intentar cargarlos
      if (!this.getServiciosArray(order).length) {
        try {
          this.toast.info("Cargando detalles del pedido...", {
            timeout: 2000
          });
          
          const response = await api.servicioCliente.getPedidoDetalle(order.id_pedido);
          if (response.data) {
            this.selectedOrder = response.data;
            this.toast.success("Detalles cargados exitosamente");
          }
        } catch (error) {
          console.error('Error al cargar detalles del pedido:', error);
          this.toast.warning("No se pudieron cargar todos los detalles del pedido");
        }
      }
    },
    
    closeModal() {
      this.selectedOrder = null;
    },
    
    // Método para obtener pasos de tracking según el estado de la orden
    getTrackingSteps(order) {
      if (!order) return [];
      
      const isDelivery = !this.isRecogidaEnTienda(order);
      const steps = [];
      
      // Convertir id_estado a número si es string
      const idEstado = typeof order.id_estado === 'string' 
        ? parseInt(order.id_estado, 10) 
        : order.id_estado;
      
      // Fecha de creación
      const fechaCreacion = order.fecha_creacion || order.fecha || new Date();
      
      // Paso 1: Orden recibida (siempre completado)
      steps.push({
        titulo: 'Orden Recibida',
        completado: true,
        fecha: fechaCreacion,
        hora: new Date(fechaCreacion).toLocaleTimeString('es-HN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        icon: 'fas fa-clipboard-check'
      });
      
      // Paso 2: En Proceso 
      steps.push({
        titulo: 'En Proceso',
        completado: idEstado >= 2,
        fecha: idEstado >= 2 ? (order.fecha_actualizacion || fechaCreacion) : null,
        hora: idEstado >= 2 ? new Date(order.fecha_actualizacion || fechaCreacion).toLocaleTimeString('es-HN', {
          hour: '2-digit',
          minute: '2-digit'
        }) : null,
        icon: 'fas fa-soap'
      });
      
      // A partir de aquí, el flujo depende de si es entrega a domicilio o recogida en tienda
      if (isDelivery) {
        // Paso 3 para domicilio: Listo para Entrega
        steps.push({
          titulo: 'Listo para Entrega',
          completado: idEstado >= 2,
          fecha: idEstado >= 2 ? (order.fecha_actualizacion || fechaCreacion) : null,
          hora: idEstado >= 2 ? new Date(order.fecha_actualizacion || fechaCreacion).toLocaleTimeString('es-HN', {
            hour: '2-digit',
            minute: '2-digit'
          }) : null,
          icon: 'fas fa-box'
        });
        
        // Paso 4 para domicilio: En Camino
        steps.push({
          titulo: 'En Camino',
          completado: idEstado >= 2,
          fecha: idEstado >= 2 ? (order.fecha_actualizacion || fechaCreacion) : null,
          hora: idEstado >= 2 ? new Date(order.fecha_actualizacion || fechaCreacion).toLocaleTimeString('es-HN', {
            hour: '2-digit',
            minute: '2-digit'
          }) : null,
          icon: 'fas fa-truck'
        });
        
        // Paso 5 para domicilio: Entregado
        steps.push({
          titulo: 'Entregado',
          completado: idEstado === 3,
          fecha: idEstado === 3 ? (order.fecha_actualizacion || fechaCreacion) : null,
          hora: idEstado === 3 ? new Date(order.fecha_actualizacion || fechaCreacion).toLocaleTimeString('es-HN', {
            hour: '2-digit',
            minute: '2-digit'
          }) : null,
          icon: 'fas fa-house-user'
        });
      } else {
        // Paso 3 para recogida: Listo para Recogida
        steps.push({
          titulo: 'Listo para Recogida',
          completado: idEstado >= 4,
          fecha: idEstado >= 4 ? (order.fecha_actualizacion || fechaCreacion) : null,
          hora: idEstado >= 4 ? new Date(order.fecha_actualizacion || fechaCreacion).toLocaleTimeString('es-HN', {
            hour: '2-digit',
            minute: '2-digit'
          }) : null,
          icon: 'fas fa-box'
        });
        
        // Paso 4 para recogida: Recogido
        steps.push({
          titulo: 'Recogido',
          completado: idEstado === 3,
          fecha: idEstado === 3 ? (order.fecha_actualizacion || fechaCreacion) : null,
          hora: idEstado === 3 ? new Date(order.fecha_actualizacion || fechaCreacion).toLocaleTimeString('es-HN', {
            hour: '2-digit',
            minute: '2-digit'
          }) : null,
          icon: 'fas fa-check-circle'
        });
      }
      
      return steps;
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
    },
    
    // Métodos para interactuar con la API
    async fetchPedidos() {
      try {
        this.loading = true;
        console.log('Obteniendo historial de pedidos...');
        
        const response = await api.servicioCliente.getHistorialPedidos();
        console.log('Respuesta de API:', response);
        
        if (response.data && Array.isArray(response.data)) {
          this.orders = response.data;
          if (this.orders.length > 0) {
            this.toast.success(`Se cargaron ${this.orders.length} pedidos`);
          } else {
            this.toast.info("No se encontraron pedidos");
          }
        } else if (response.data) {
          // Si no es un array, pero tiene datos
          this.orders = [response.data];
          this.toast.success("Se cargó 1 pedido");
        } else {
          this.orders = [];
          this.toast.info("No se encontraron pedidos");
        }
      } catch (error) {
        console.error('Error al obtener historial de pedidos:', error);
        this.orders = [];
        this.toast.error("Error al cargar los pedidos");
      } finally {
        this.loading = false;
      }
    },
    
    async fetchPedidosByEstado(tabId) {
      try {
        this.loading = true;
        
        // Mapear los IDs de pestañas a los valores de ID de estado esperados por la API
        const estadoIdMap = {
          'activa': 1,
          'en-camino': 2,
          'entregada': 3,
          'listo': 4
        };
        
        // Intentaremos primero con el ID de estado numérico
        const idEstado = estadoIdMap[tabId];
        console.log('Buscando pedidos con id_estado:', idEstado);
        
        const estadoNombre = this.getEstadoNombre(idEstado);
        
        try {
          // Primera opción: enviar el ID del estado (número)
          const response = await api.servicioCliente.getHistorialPedidos(idEstado);
          console.log('Respuesta filtrada de API (usando id_estado):', response);
          
          if (response.data && Array.isArray(response.data)) {
            this.orders = response.data;
            if (this.orders.length > 0) {
              this.toast.success(`Se encontraron ${this.orders.length} pedidos en estado "${estadoNombre}"`);
            } else {
              this.toast.info(`No se encontraron pedidos en estado "${estadoNombre}"`);
            }
            return; // Si funciona, salimos
          } else if (response.data) {
            // Si no es un array, pero tiene datos
            this.orders = [response.data];
            this.toast.success(`Se encontró 1 pedido en estado "${estadoNombre}"`);
            return; // Si funciona, salimos
          }
        } catch (err) {
          console.log('Error con id_estado, intentando con nombre de estado');
        }
        
        // Si no funcionó con ID, intentar con el nombre del estado
        const estadoMap = {
          'activa': 'En Espera',
          'en-camino': 'En Camino',
          'entregada': 'Entregada',
          'listo': 'Listo para recoger'
        };
        
        const estadoFiltro = estadoMap[tabId];
        console.log('Buscando pedidos con estado (nombre):', estadoFiltro);
        
        const response = await api.servicioCliente.getHistorialPedidos(estadoFiltro);
        console.log('Respuesta filtrada de API (usando nombre):', response);
        
        if (response.data && Array.isArray(response.data)) {
          this.orders = response.data;
          if (this.orders.length > 0) {
            this.toast.success(`Se encontraron ${this.orders.length} pedidos en estado "${estadoFiltro}"`);
          } else {
            this.toast.info(`No se encontraron pedidos en estado "${estadoFiltro}"`);
          }
        } else if (response.data) {
          // Si no es un array, pero tiene datos
          this.orders = [response.data];
          this.toast.success(`Se encontró 1 pedido en estado "${estadoFiltro}"`);
        } else {
          this.orders = [];
          this.toast.info(`No se encontraron pedidos en estado "${estadoFiltro}"`);
        }
      } catch (error) {
        console.error('Error al obtener pedidos por estado:', error);
        this.orders = [];
        this.toast.error("Error al filtrar los pedidos");
      } finally {
        this.loading = false;
      }
    },

    // Mostrar modal de confirmación para cancelar pedido
    cancelarPedido(order) {
      this.pedidoACancelar = order;
      this.showCancelConfirmation = true;
    },
    
    // Cancelar la operación de cancelación
    cancelCancellation() {
      this.showCancelConfirmation = false;
      this.pedidoACancelar = null;
    },
    
    // Confirmar la cancelación y proceder
    async confirmCancellation() {
      if (!this.pedidoACancelar) return;
      
      try {
        this.showCancelConfirmation = false;
        this.toast.info("Procesando cancelación...");
        
        // Llamar al API para cancelar el pedido
        await api.servicioCliente.cancelarPedido(this.pedidoACancelar.id_pedido);
        
        // Actualizar la lista de pedidos (eliminando el cancelado)
        const index = this.orders.findIndex(p => p.id_pedido === this.pedidoACancelar.id_pedido);
        if (index !== -1) {
          this.orders.splice(index, 1);
        }
        
        // Cerrar el modal si estaba abierto
        if (this.selectedOrder && this.selectedOrder.id_pedido === this.pedidoACancelar.id_pedido) {
          this.closeModal();
        }
        
        this.toast.success(`Pedido #${this.pedidoACancelar.id_pedido} cancelado exitosamente`);
        
        // Limpiar referencia
        this.pedidoACancelar = null;
        
        // Recargar los pedidos para mantener la lista actualizada
        this.fetchPedidos();
      } catch (error) {
        console.error('Error al cancelar pedido:', error);
        
        // Mostrar mensaje específico según el error
        if (error.response && error.response.status === 400) {
          this.toast.error("No se puede cancelar este pedido. Ya está en proceso.");
        } else if (error.response && error.response.status === 404) {
          this.toast.error("Pedido no encontrado.");
        } else {
          this.toast.error("Error al cancelar el pedido. Intente nuevamente.");
        }
      }
    }
  }
};
</script>
<style src="@/assets/css/HistorialPedidoCliente.css" scoped></style>