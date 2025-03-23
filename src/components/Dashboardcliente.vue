<template>
  <div class="dashboard-layout">
    <Sidebarcliente @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="dashboard-container">
        <!-- Título principal -->
        <div class="welcome-title">
          <h1>Bienvenido, a continuación podrás ver los servicios que brindamos</h1>
        </div>
        
        <!-- Carrusel de servicios -->
        <div class="service-selection">
          <h2 class="selection-title">NUESTROS SERVICIOS</h2>
          
          <!-- Mostrar mensaje de carga mientras se obtienen los datos -->
          <div v-if="loading" class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando servicios...</span>
          </div>
          
          <!-- Mostrar mensaje de error si falla la carga -->
          <div v-else-if="error" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ error }}</span>
          </div>
          
          <!-- Carrusel con los servicios -->
          <div v-else-if="servicios.length > 0" class="carousel-container">
            <button class="carousel-button prev" @click="prevSlide">
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="carousel-track-container">
              <div class="carousel-track" :style="carouselStyle">
                <div 
                  v-for="servicio in servicios" 
                  :key="servicio.id_servicio" 
                  class="carousel-slide"
                  @click="selectService(servicio)"
                >
                <div class="service-card" :class="getServiceClass(servicio.categoria)">
  <h3>{{ servicio.nombre }}</h3>
  <p class="service-description">{{ servicio.descripcion }}</p>
  
  <div class="card-info">
    <div class="service-details">
      <div class="service-price">
        <span>Precio:</span>
        <strong>Lps.{{ formatPrecio(servicio.precio) }}</strong>
      </div>
      <div class="service-time">
        <span>Tiempo estimado:</span>
        <strong>{{ servicio.tiempo_estimado }} min</strong>
      </div>
    </div>
    
    <div class="equipment-info" v-if="servicio.equipo">
      <span>Equipo:</span>
      <strong>{{ servicio.equipo.nombre }}</strong>
    </div>
  </div>
</div>
                </div>
              </div>
            </div>
            
            <button class="carousel-button next" @click="nextSlide">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <!-- Mensaje de no hay servicios -->
          <div v-else class="no-services-message">
            No hay servicios disponibles en este momento.
          </div>
          
          <!-- Indicadores del carrusel -->
          <div v-if="servicios.length > 0" class="carousel-indicators">
            <span 
              v-for="(servicio, index) in servicios" 
              :key="index"
              :class="{ 'active': activeSlideIndex === index }"
              @click="goToSlide(index)"
            ></span>
          </div>
        </div>

        <!-- Sección de últimos pedidos -->
        <div class="recent-orders-section">
          <h2 class="section-title">TUS ÚLTIMOS PEDIDOS</h2>
          
          <!-- Mostrar carga de pedidos -->
          <div v-if="loadingPedidos" class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Cargando tus pedidos...</span>
          </div>
          
          <!-- Mostrar error al cargar pedidos -->
          <div v-else-if="pedidosError" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ pedidosError }}</span>
          </div>
          
          <!-- Tabla de pedidos sin opción de cancelación -->
          <div v-else-if="ultimosPedidos.length > 0" class="recent-orders-table-container">
            <table class="recent-orders-table">
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Fecha</th>
                  <th>Dirección de Entrega</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pedido in ultimosPedidos" :key="pedido.id_pedido">
                  <td>#{{ pedido.id_pedido }}</td>
                  <td>{{ formatearFecha(pedido.fecha_creacion) }}</td>
                  <td>{{ truncarTexto(pedido.direccion_entrega, 30) }}</td>
                  <td>
                    <span class="status-badge" :class="getEstadoClass(pedido.id_estado)">
                      {{ getNombreEstado(pedido.id_estado) }}
                    </span>
                  </td>
                  <td>Lps. {{ formatPrecio(pedido.total) }}</td>
                  <td>
                    <button 
                      class="btn-details" 
                      title="Ver detalles"
                      @click="verDetallePedido(pedido.id_pedido)"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Mensaje de no hay pedidos -->
          <div v-else class="no-orders-message">
            <i class="fas fa-shopping-bag"></i>
            <p>Aún no tienes pedidos. ¡Realiza tu primer pedido ahora!</p>
            <button class="new-order-btn" @click="irANuevoPedido">Nuevo Pedido</button>
          </div>
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
                <span class="total-price">L.{{ formatPrecio(selectedOrder.total) }}</span>
              </div>
              
              <!-- Info básica -->
              <div class="order-basic-info">
                <div class="info-row">
                  <span class="info-label">Fecha:</span>
                  <span>{{ formatearFecha(selectedOrder.fecha_creacion) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Estado:</span>
                  <span 
                    class="status-badge" 
                    :class="getEstadoClass(selectedOrder.id_estado)"
                  >
                    {{ getNombreEstado(selectedOrder.id_estado) }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Entrega:</span>
                  <span>{{ isRecogidaEnTienda(selectedOrder) ? 'En tienda' : 'A domicilio' }}</span>
                </div>
                <div class="info-row" v-if="selectedOrder.direccion_entrega">
                  <span class="info-label">Dirección:</span>
                  <span>{{ selectedOrder.direccion_entrega }}</span>
                </div>
              </div>
            </div>
            
            <!-- Columna derecha con servicios -->
            <div class="order-right-column">
              <h4>Servicios</h4>
              <div v-if="getServiciosDetallados(selectedOrder).length > 0">
                <div v-for="(item, index) in getServiciosDetallados(selectedOrder)" :key="index" class="service-item">
                  <div class="service-name">{{ item.nombre }}</div>
                  <div class="service-details">
                    <span class="service-quantity">{{ item.cantidad }}x</span>
                    <span class="service-price">L.{{ formatPrecio(item.subtotal) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="no-services">
                No hay detalles disponibles para este pedido.
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
                    {{ formatearFecha(step.fecha) }}
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
import Sidebarcliente from './Sidebarcliente.vue'
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: 'DashboardCliente',
  components: {
    Sidebarcliente
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      isSidebarExpanded: false,
      activeSlideIndex: 0,
      servicios: [],
      loading: true,
      error: null,
      
      // Datos para la sección de pedidos
      ultimosPedidos: [],
      loadingPedidos: true,
      pedidosError: null,
      
      // Mapeo de estados de acuerdo con los datos proporcionados
      estadosMap: {
        1: 'En Espera',
        2: 'En camino',
        3: 'Entregada',
        4: 'Listo para recoger'
      },
      
      // Pedido seleccionado para mostrar detalles
      selectedOrder: null
    }
  },
  computed: {
    carouselStyle() {
      return {
        transform: `translateX(-${this.activeSlideIndex * 100}%)`
      };
    }
  },
  created() {
    this.fetchServicios();
    this.fetchPedidosCliente();
  },
  methods: {
    // Función para formatear el precio correctamente
    formatPrecio(precio) {
      // Asegurarse de que precio sea un número
      const precioNumerico = Number(precio);
      
      // Verificar si es un número válido
      if (isNaN(precioNumerico)) {
        return '0.00'; // Valor por defecto si no es un número
      }
      
      // Formatear el precio con 2 decimales
      return precioNumerico.toFixed(2);
    },
    
    // Formatear fecha
    formatearFecha(fecha) {
      if (!fecha) return 'N/A';
      
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return fecha; // Si no es una fecha válida, retornar el string original
      
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    
    // Truncar texto largo
    truncarTexto(texto, longitud) {
      if (!texto) return 'N/A';
      return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
    },
    
    // Obtener el nombre del estado basado en el ID
    getNombreEstado(id_estado) {
      return this.estadosMap[id_estado] || 'Desconocido';
    },
    
    // Obtener el color/clase del estado basado en el ID
    getEstadoClass(id_estado) {
      switch(id_estado) {
        case 1: // En Espera
          return 'status-espera';
        case 2: // En camino
          return 'status-camino';
        case 3: // Entregada
          return 'status-entregada';
        case 4: // Listo para recoger
          return 'status-listo';
        default:
          return 'status-espera';
      }
    },
    
    // Obtener servicios desde la API
    async fetchServicios() {
      try {
        this.loading = true;
        this.error = null;
        
        // Usar el servicio de API que ya tienes
        const response = await api.servicios.getAll();
        
        // La estructura de la respuesta debería ser directamente un array de servicios
        if (response && response.data) {
          this.servicios = response.data.filter(servicio => servicio.activo === true);
          console.log('Servicios cargados:', this.servicios);
        } else {
          throw new Error('Formato de respuesta no válido');
        }
        
        this.loading = false;
      } catch (err) {
        console.error('Error al obtener servicios:', err);
        this.error = 'No se pudieron cargar los servicios. Por favor, intenta nuevamente más tarde.';
        this.loading = false;
      }
    },
    
    // Obtener pedidos del cliente actual
    async fetchPedidosCliente() {
      try {
        this.loadingPedidos = true;
        this.pedidosError = null;
        
        // Primero, verificamos si hay un token en sessionStorage
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.error('No hay token de autenticación');
          this.pedidosError = 'Debes iniciar sesión para ver tus pedidos';
          this.loadingPedidos = false;
          return;
        }
        
        // Intenta obtener el ID del usuario desde sessionStorage
        const userId = this.getUserId();
        console.log('ID de usuario obtenido:', userId);
        
        // Intentamos obtener los pedidos usando el endpoint de cliente
        try {
          // Intenta usar el endpoint específico para el cliente
          const response = await api.servicioCliente.getHistorialPedidos();
          
          if (response && response.data) {
            this.ultimosPedidos = response.data
              .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
              .slice(0, 3);
            
            console.log('Pedidos cargados:', this.ultimosPedidos);
            this.loadingPedidos = false;
            return;
          }
        } catch (clienteError) {
          console.error('Error al obtener pedidos del cliente:', clienteError);
          
          // Si el error es de autorización, intentamos refrescar el token
          if (clienteError.response && clienteError.response.status === 401) {
            console.log('Intentando refrescar la sesión...');
            // Aquí podrías implementar la lógica para refrescar el token si es necesario
          }
        }
        
        // Si el primer método falló, intentamos con un endpoint alternativo
        try {
          // Obtener todos los pedidos y filtrar por el ID del cliente
          const allPedidosResponse = await api.pedidos.getAll();
          
          if (allPedidosResponse && allPedidosResponse.data) {
            // Filtramos pedidos por ID de cliente
            const pedidosCliente = allPedidosResponse.data
              .filter(pedido => pedido.id_cliente == userId)
              .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
              .slice(0, 5);
            
            this.ultimosPedidos = pedidosCliente;
            console.log('Pedidos obtenidos método alternativo:', this.ultimosPedidos);
          }
        } catch (alternativeError) {
          console.error('Error en método alternativo:', alternativeError);
          throw alternativeError; // Re-lanzar para el catch general
        }
        
        this.loadingPedidos = false;
      } catch (err) {
        console.error('Error al obtener los últimos pedidos:', err);
        
        // Mensaje específico para error de autorización
        if (err.response && err.response.status === 401) {
          this.pedidosError = 'No tienes autorización para ver estos pedidos. Por favor, inicia sesión nuevamente.';
        } else {
          this.pedidosError = 'No se pudieron cargar tus pedidos recientes.';
        }
        
        this.loadingPedidos = false;
      }
    },
    
    // Mejorar el método para obtener el ID del usuario
    getUserId() {
      // Intentar obtener de diferentes fuentes
      try {
        // 1. Intentar desde el objeto user en sessionStorage
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.id || userData.id_cliente || userData.id_usuario) {
            return userData.id || userData.id_cliente || userData.id_usuario;
          }
        }
        
        // 2. Intentar desde el token decodificado
        const token = sessionStorage.getItem('token');
        if (token) {
          // Si tienes acceso a jwt-decode o una función similar
          // return jwtDecode(token).sub; // o el campo donde esté el ID
          
          // Alternativa: si el ID se guarda por separado
          const userId = sessionStorage.getItem('userId');
          if (userId) return userId;
        }
        
        // Si no se encuentra, podemos intentar obtenerlo del perfil
        console.log('No se pudo obtener el ID del usuario desde sessionStorage');
        return null;
      } catch (e) {
        console.error('Error al obtener ID del usuario:', e);
        return null;
      }
    },
    
    // Métodos para el carrusel
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    getServiceClass(categoria) {
      if (!categoria) return 'standard';
      
      switch(categoria.toLowerCase()) {
        case 'premium':
          return 'premium';
        case 'express':
          return 'express';
        case 'basica':
          return 'standard';
        case 'secado':
          return 'secado';
        default:
          return 'standard';
      }
    },
    nextSlide() {
      if (this.activeSlideIndex < this.servicios.length - 1) {
        this.activeSlideIndex++;
      } else {
        this.activeSlideIndex = 0;
      }
    },
    prevSlide() {
      if (this.activeSlideIndex > 0) {
        this.activeSlideIndex--;
      } else {
        this.activeSlideIndex = this.servicios.length - 1;
      }
    },
    goToSlide(index) {
      this.activeSlideIndex = index;
    },
    selectService(servicio) {
      this.$router.push({
        name: 'servicios',
        query: { 
          id: servicio.id_servicio,
          tipo: servicio.categoria?.toLowerCase() || 'standard'
        }
      });
    },
    
    // Ir a realizar un nuevo pedido - ahora redirige a la página de servicios
    irANuevoPedido() {
      this.$router.push({ name: 'servicios' });
    },
    
    // Ver detalle de un pedido - método actualizado
    async verDetallePedido(id_pedido) {
      // Buscar el pedido en la lista actual
      const pedido = this.ultimosPedidos.find(p => p.id_pedido == id_pedido);
      
      // Clonar el pedido para evitar cambios reactivos en la vista
      this.selectedOrder = pedido ? JSON.parse(JSON.stringify(pedido)) : null;
      
      // Si no hay pedido, mostrar error
      if (!this.selectedOrder) {
        if (this.toast) {
          this.toast.error("No se encontró información del pedido");
        } else {
          alert("No se encontró información del pedido");
        }
        return;
      }
      
      // Si el pedido no tiene detalles completos, intentar cargarlos
      if (!this.getServiciosArray(this.selectedOrder).length) {
        try {
          if (this.toast) {
            this.toast.info("Cargando detalles del pedido...", {
              timeout: 2000
            });
          }
          
          const response = await api.servicioCliente.getPedidoDetalle(id_pedido);
          if (response && response.data) {
            this.selectedOrder = response.data;
            if (this.toast) {
              this.toast.success("Detalles cargados exitosamente");
            }
          }
        } catch (error) {
          console.error('Error al cargar detalles del pedido:', error);
          if (this.toast) {
            this.toast.warning("No se pudieron cargar todos los detalles del pedido");
          }
          // No hacemos nada más - seguimos usando los datos básicos
        }
      }
    },
    
    // Cerrar modal de detalles
    closeModal() {
      this.selectedOrder = null;
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
    
    // Verificar si es recogida en tienda
    isRecogidaEnTienda(order) {
      if (!order) return false;
      
      const direccionEntrega = order.direccion_entrega || '';
      return direccionEntrega.toLowerCase().includes('recoger en sucursal') || 
              direccionEntrega.toLowerCase().includes('tienda') ||
              direccionEntrega.toLowerCase().includes('local');
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
    }
  }
};
</script>

<style src="@/assets/css/dashboardClienteStyle.css" scoped></style>
