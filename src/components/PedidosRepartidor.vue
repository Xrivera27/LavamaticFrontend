<template>
  <div class="repartidor-layout">
    <SidebarRepartidor @sidebar-toggle="handleSidebarToggle" />
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
            :class="{ active: estadoActual === 'asignados' }"
            @click="cambiarEstado('asignados')"
          >
            Pedidos Asignados
            <span class="badge" v-if="pedidosAsignados.length">{{ pedidosAsignados.length }}</span>
          </button>
          <button 
            class="tab-button" 
            :class="{ active: estadoActual === 'encamino' }"
            @click="cambiarEstado('encamino')"
          >
            En Camino
            <span class="badge" v-if="pedidosEnCamino.length">{{ pedidosEnCamino.length }}</span>
          </button>
          <button 
            class="tab-button" 
            :class="{ active: estadoActual === 'historial' }"
            @click="cambiarEstado('historial')"
          >
            Entregados
            <span class="badge" v-if="pedidosHistorial.length">{{ pedidosHistorial.length }}</span>
          </button>
        </div>
    
        <div class="opciones">
          <div class="search-bar">
            <input
              class="busqueda"
              type="text"
              v-model="searchQuery"
              :placeholder="`Buscar pedido ${placeholderBusqueda}`"
            />
          </div>
        </div>
    
        <div class="table-container">
          <div v-if="isLoading" class="loading-indicator">
            Cargando pedidos...
          </div>
    
          <div v-else-if="pedidosPaginados.length === 0" class="no-data">
            <p>No se encontraron pedidos para mostrar.</p>
            <button v-if="errorCarga" class="btn btn-primary" @click="cargarPedidos">
              <i class="fa-solid fa-refresh"></i> Intentar nuevamente
            </button>
          </div>
    
          <table v-else class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Servicios</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pedido) in pedidosPaginados" :key="pedido.id_pedido">
                <td data-label="#">{{ pedido.id_pedido }}</td>
                <td data-label="Cliente">{{ pedido.cliente }}</td>
                <td data-label="Dirección">
                  <div class="direccion-cell">
                    {{ pedido.direccion_entrega || 'No especificada' }}
                  </div>
                </td>
                <td data-label="Servicios">
                  <div class="servicios-lista">{{ pedido.servicios }}</div>
                </td>
                <td data-label="Total">LPS.{{ Number(pedido.total).toFixed(2) }}</td>
                <td data-label="Fecha">{{ formatDate(pedido.fecha) }}</td>
                <td data-label="Acciones">
                  <button
                    class="btn btn-info btn-action"
                    @click="verDetalles(pedido)"
                    title="Ver detalles"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  
                  <!-- Botón para aceptar pedido (solo en estado 'asignados') -->
                  <button
                    v-if="estadoActual === 'asignados'"
                    class="btn btn-success btn-action"
                    @click="aceptarPedido(pedido)"
                    title="Aceptar pedido"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>

                  <!-- Botón para finalizar entrega (solo en estado 'encamino') -->
                  <button
                    v-if="estadoActual === 'encamino'"
                    class="btn btn-success btn-action"
                    @click="finalizarEntrega(pedido)"
                    title="Finalizar entrega"
                  >
                    <i class="fa-solid fa-flag-checkered"></i>
                  </button>
                  
                  <!-- Botón para ver ubicación -->
                  <button
                    v-if="estadoActual !== 'historial'"
                    class="btn btn-primary btn-action"
                    @click="verMapa(pedido)"
                    title="Ver ubicación"
                  >
                    <i class="fa-solid fa-map-marker-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Paginación -->
          <div class="paginacion-container" v-if="totalPaginas > 1">
            <button 
              class="btn-paginacion" 
              :disabled="paginaActual === 1" 
              @click="cambiarPagina(paginaActual - 1)"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            
            <span class="info-paginacion">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </span>
            
            <button 
              class="btn-paginacion" 
              :disabled="paginaActual === totalPaginas" 
              @click="cambiarPagina(paginaActual + 1)"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Modal de detalles -->
        <div class="modal" v-if="showDetailsModal">
          <div class="modal-detalle">
            <div class="modal-header">
              <h2>Detalles del Pedido #{{ pedidoDetalle?.id_pedido }}</h2>
            </div>
            <div class="modal-body-detalle">
              <div v-if="pedidoDetalle" class="detalle-content">
                <div class="detalle-row">
                  <strong>Cliente:</strong> 
                  <span>{{ pedidoDetalle.nombreCliente }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Dirección de Entrega:</strong>
                  <span>{{ pedidoDetalle.direccion_entrega || 'No especificada' }}</span>
                </div>
                <div class="detalle-row" v-if="pedidoDetalle.barrio">
                  <strong>Barrio/Colonia:</strong>
                  <span>{{ pedidoDetalle.barrio }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Teléfono:</strong>
                  <span>{{ pedidoDetalle.telefonoCliente }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Fecha:</strong>
                  <span>{{ pedidoDetalle.fechaFormateada }}</span>
                </div>
                <div class="detalle-servicios">
                  <strong>Servicios:</strong>
                  <div class="servicios-list">
                    <div v-if="pedidoDetalle.serviciosDetalle && pedidoDetalle.serviciosDetalle.length">
                      <div v-for="(servicio, index) in pedidoDetalle.serviciosDetalle" :key="index" class="servicio-item">
                        <span>{{ servicio.nombre }} {{ servicio.cantidad > 1 ? `(${servicio.cantidad}x)` : '' }}</span>
                        <span>LPS.{{ Number(servicio.precio).toFixed(2) }}</span>
                      </div>
                    </div>
                    <div v-else class="servicio-item">
                      <span>{{ pedidoDetalle.serviciosTexto || pedidoDetalle.servicios || 'Sin servicios' }}</span>
                    </div>
                  </div>
                  <div class="total-row">
                    <strong>Total:</strong>
                    <span>LPS.{{ Number(pedidoDetalle.total).toFixed(2) }}</span>
                  </div>
                </div>

                <div class="detalle-estado">
                  <strong>Estado:</strong>
                  <span :class="'badge ' + getEstadoClass(pedidoDetalle.estadoNombre || pedidoDetalle.estado)">
                    {{ pedidoDetalle.estadoNombre || (pedidoDetalle.estado && pedidoDetalle.estado.nombre_estado) || pedidoDetalle.estado || 'Estado desconocido' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <!-- Botón condicional según el estado -->
                <button 
                  v-if="estadoActual === 'asignados'"
                  class="btn btn-success" 
                  @click="aceptarPedido(pedidoDetalle)"
                >
                  Aceptar Pedido
                </button>
                <button 
                  v-if="estadoActual === 'encamino'"
                  class="btn btn-success" 
                  @click="finalizarEntrega(pedidoDetalle)"
                >
                  Finalizar Entrega
                </button>
                <button 
                  v-if="estadoActual !== 'historial'"
                  class="btn btn-primary" 
                  @click="verMapa(pedidoDetalle)"
                >
                  Ver Ubicación
                </button>
                <button class="btn btn-secondary" @click="cerrarDetalles">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de confirmación -->
        <div class="modal" v-if="showConfirmModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>{{ tituloConfirmacion }}</h2>
            </div>
            <div class="modal-body-confirm">
              <p>{{ mensajeConfirmacion }}</p>
              <p>{{ submensajeConfirmacion }}</p>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button 
                  class="btn btn-success" 
                  @click="confirmarAccion"
                  :disabled="isProcessing"
                >
                  <i v-if="isProcessing" class="fas fa-spinner fa-spin"></i>
                  {{ isProcessing ? 'Procesando...' : botonConfirmacion }}
                </button>
                <button class="btn btn-secondary" @click="cancelarAccion" :disabled="isProcessing">
                  No, regresar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal del mapa -->
        <div class="modal" v-if="showMapModal">
          <div class="modal-mapa">
            <div class="modal-header">
              <h2>Ubicación de Entrega</h2>
            </div>
            <div class="modal-body-mapa">
              <div class="mapa-placeholder">
                <i class="fa-solid fa-map-location-dot"></i>
                <p>Para este pedido, la dirección es:</p>
                <p class="direccion-mapa">{{ pedidoSeleccionado?.direccion_entrega || 'No especificada' }}</p>
                <p class="barrio-centro">{{ pedidoSeleccionado?.barrio }}</p>
              </div>
              
              <button 
                class="btn btn-obtener-ubicacion" 
                @click="obtenerUbicacionActual"
              >
                <i class="fa-solid fa-location-crosshairs"></i> Obtener mi ubicación actual
              </button>
              
              <div v-if="ubicacionActual" class="ubicacion-actual-container">
                <h3>Mi ubicación actual:</h3>
                <p>Latitud: {{ ubicacionActual.lat }}</p>
                <p>Longitud: {{ ubicacionActual.lng }}</p>
                
                <a 
                  :href="`https://www.google.com/maps/dir/?api=1&origin=${ubicacionActual.lat},${ubicacionActual.lng}&destination=${encodeURIComponent(pedidoSeleccionado?.direccion_entrega || 'La Ceiba')}, ${pedidoSeleccionado?.barrio}, La Ceiba`" 
                  target="_blank" 
                  class="btn btn-ver-ruta"
                >
                  <i class="fa-solid fa-directions"></i> Ver ruta en Google Maps
                </a>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="cerrarMapa">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarRepartidor from './SidebarRepartidor.vue';
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: 'PedidosRepartidor',
  components: {
    SidebarRepartidor
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      isSidebarExpanded: false,
      isLoading: false,
      isProcessing: false,
      errorCarga: false,
      showDetailsModal: false,
      showConfirmModal: false,
      showMapModal: false,
      searchQuery: "",
      estadoActual: 'asignados',
      pedidoDetalle: null,
      pedidoSeleccionado: null,
      tituloConfirmacion: '',
      mensajeConfirmacion: '',
      submensajeConfirmacion: '',
      botonConfirmacion: '',
      accionPendiente: null,
      // Arrays para almacenar los diferentes tipos de pedidos
      pedidosAsignados: [],
      pedidosEnCamino: [],
      pedidosHistorial: [],
      // Paginación
      elementosPorPagina: 4,
      paginaActual: 1,
      // Para ubicación
      obteniendo_ubicacion: false,
      ubicacionActual: null,
      // Lista de barrios y colonias de La Ceiba
      barriosColonias: [
        "Barrio Alvarado",
        "Barrio El Centro",
        "Barrio Inglés",
        "Barrio La Isla",
        "Barrio Mejía",
        "Barrio Solares Nuevos",
        "Colonia El Naranjal",
        "Colonia Luisiana",
        "Colonia San José",
        "Colonia Suyapa",
        "Colonia Los Laureles",
        "Colonia Miramar",
        "Colonia Atlántida",
        "Colonia Gracias a Dios",
        "Colonia Los Fuertes",
        "Colonia San Isidro",
        "Colonia San Judas",
        "Colonia Toronjal",
        "Colonia Irías",
        "Colonia Los Bomberos"
      ]
    }
  },
  computed: {
    placeholderBusqueda() {
      switch(this.estadoActual) {
        case 'asignados': return 'asignados...';
        case 'encamino': return 'en camino...';
        case 'historial': return 'en historial...';
        default: return '...';
      }
    },
    pedidosFiltrados() {
      let pedidos;
      switch(this.estadoActual) {
        case 'asignados': pedidos = this.pedidosAsignados; break;
        case 'encamino': pedidos = this.pedidosEnCamino; break;
        case 'historial': pedidos = this.pedidosHistorial; break;
        default: pedidos = [];
      }
      
      if (!this.searchQuery) return pedidos;

      const searchTerm = this.searchQuery.toLowerCase();
      return pedidos.filter(pedido => 
        (pedido.cliente && pedido.cliente.toLowerCase().includes(searchTerm)) ||
        (pedido.id_pedido && pedido.id_pedido.toString().includes(searchTerm)) || // Añadir búsqueda por ID
        (pedido.direccion_entrega && pedido.direccion_entrega.toLowerCase().includes(searchTerm)) ||
        (pedido.direccion_recogida && pedido.direccion_recogida.toLowerCase().includes(searchTerm)) ||
        (pedido.barrio && pedido.barrio.toLowerCase().includes(searchTerm)) ||
        (pedido.servicios && pedido.servicios.toLowerCase().includes(searchTerm))
      );
    },
    totalPaginas() {
      return Math.ceil(this.pedidosFiltrados.length / this.elementosPorPagina);
    },
    pedidosPaginados() {
      const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
      const fin = inicio + this.elementosPorPagina;
      return this.pedidosFiltrados.slice(inicio, fin);
    }
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    cambiarEstado(estado) {
      this.estadoActual = estado;
      this.searchQuery = '';
      this.paginaActual = 1; // Resetear a la primera página al cambiar de estado
      
      if (this.showDetailsModal) {
        this.cerrarDetalles();
      }
      
      // Cargar datos si es necesario
      if (estado === 'historial' && this.pedidosHistorial.length === 0) {
        this.cargarHistorial();
      }
    },
    
    cambiarPagina(pagina) {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.paginaActual = pagina;
      }
    },
    
    formatDate(date) {
      if (!date) return 'Fecha no disponible';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      if (isNaN(date.getTime())) return 'Fecha no válida';
      
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getEstadoClass(estado) {
      if (!estado) return 'badge-secondary';
      
      // Si estado es un objeto (con nombre_estado)
      if (typeof estado === 'object' && estado.nombre_estado) {
        estado = estado.nombre_estado;
      }
      
      // Ahora convertimos a minúsculas, asegurándonos que sea string
      const estadoLower = String(estado).toLowerCase();
      
      if (estadoLower.includes('espera')) return 'badge-warning';
      if (estadoLower.includes('camino') || estadoLower.includes('asignado')) return 'badge-primary';
      if (estadoLower.includes('finalizado') || estadoLower.includes('entregado')) return 'badge-success';
      return 'badge-secondary';
    },
    
    async cargarPedidos() {
      this.isLoading = true;
      this.errorCarga = false;
      
      try {
        // Obtener pedidos asignados
        const response = await api.repartidor.getPedidos();
        console.log("Respuesta completa:", response);
        
        if (response.data && (Array.isArray(response.data) || typeof response.data === 'object')) {
          let pedidosArray = Array.isArray(response.data) ? response.data : [response.data];
          
          // Procesar cada pedido para extraer la información correctamente
          const pedidosProcesados = pedidosArray.map(pedido => {
            // Procesar servicios
            let serviciosTexto = 'Sin servicios';
            
            if (pedido.servicios && Array.isArray(pedido.servicios)) {
              serviciosTexto = pedido.servicios
                .map(s => s.servicio ? s.servicio.nombre : 'Servicio')
                .join(', ');
            }
            
            // Extraer información del cliente
            let nombreCliente = 'Cliente';
            if (pedido.cliente && pedido.cliente.nombre) {
              nombreCliente = pedido.cliente.nombre;
            }
            
            return {
              id_pedido: pedido.id_pedido,
              cliente: nombreCliente,
              direccion_entrega: pedido.direccion_entrega || 'No especificada',
              direccion_recogida: pedido.direccion_recogida || 'No especificada',
              barrio: pedido.barrio || '',
              referencia: pedido.referencia || '',
              servicios: serviciosTexto,
              serviciosDetalle: pedido.servicios ? pedido.servicios.map(s => ({
                nombre: s.servicio ? s.servicio.nombre : 'Servicio',
                precio: s.servicio ? parseFloat(s.servicio.precio) : 0,
                cantidad: s.cantidad || 1
              })) : [],
              total: parseFloat(pedido.total || 0),
              fecha: pedido.fecha_creacion || new Date(),
              estado: pedido.estado ? pedido.estado.nombre_estado : 'En Espera',
              id_estado: pedido.id_estado || 1,
              telefono: pedido.telefono || 'No especificado'
            };
          });
          
          console.log("Pedidos procesados:", pedidosProcesados);
          
          // Clasificar pedidos según su estado
          this.pedidosAsignados = pedidosProcesados.filter(
            p => p.estado === 'En Espera' || p.id_estado === 1
          );
          
          this.pedidosEnCamino = pedidosProcesados.filter(
            p => p.estado === 'En Camino' || p.id_estado === 2
          );
          
          this.pedidosHistorial = pedidosProcesados.filter(
            p => p.estado === 'Finalizado' || p.id_estado === 3
          );
          
          if (pedidosProcesados.length > 0) {
            this.toast.success(`Se cargaron los pedidos`);
          } else {
            this.toast.info("No hay pedidos asignados actualmente");
          }
        } else {
          this.toast.info("No hay pedidos para mostrar");
        }
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        this.toast.error("Error al cargar los pedidos");
        this.errorCarga = true;
      } finally {
        this.isLoading = false;
      }
    },
    
    async cargarHistorial() {
      this.isLoading = true;
      this.errorCarga = false;
      
      try {
        const response = await api.repartidor.getHistorial();
        console.log("Historial cargado:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          this.pedidosHistorial = response.data.map(pedido => {
            // Asegurarse de que cada pedido tenga la información correcta
            return {
              ...pedido,
              barrio: pedido.barrio || '',
              referencia: pedido.referencia || '',
              estado: pedido.estado || 'Finalizado',
              id_estado: pedido.id_estado || 3
            };
          });
          this.toast.success(`Se cargaron ${response.data.length} entregas en el historial`);
        } else if (response.data && response.data.message) {
          this.toast.info(response.data.message);
        }
      } catch (error) {
        console.error("Error al cargar historial:", error);
        this.toast.error("Error al cargar el historial de entregas");
        this.errorCarga = true;
      } finally {
        this.isLoading = false;
      }
    },
    
    async verDetalles(pedido) {
      this.isLoading = true;
      
      try {
        // Intentar cargar detalles adicionales si es necesario
        const response = await api.repartidor.getPedidoDetalle(pedido.id_pedido);
        
        // Procesar la respuesta para formatear correctamente los datos
        let pedidoFormateado = response.data || pedido;
        
        // Procesar información del cliente
        if (pedidoFormateado.cliente) {
          pedidoFormateado.nombreCliente = pedidoFormateado.cliente.nombre || 'Cliente';
          pedidoFormateado.telefonoCliente = pedidoFormateado.cliente.telefono || 'No especificado';
        } else {
          pedidoFormateado.nombreCliente = 'Cliente';
          pedidoFormateado.telefonoCliente = 'No especificado';
        }
        
        // Incluir barrio y referencia si existen
        pedidoFormateado.barrio = pedidoFormateado.barrio || '';
        pedidoFormateado.referencia = pedidoFormateado.referencia || '';
        
        // Formatear fecha
        pedidoFormateado.fechaFormateada = this.formatDate(pedidoFormateado.fecha_creacion);
        
        // Procesar los servicios si existen
        if (pedidoFormateado.servicios && Array.isArray(pedidoFormateado.servicios)) {
          pedidoFormateado.serviciosDetalle = pedidoFormateado.servicios.map(servicio => {
            // Si es un objeto complejo con 'servicio' anidado
            if (servicio.servicio) {
              return {
                nombre: servicio.servicio.nombre || 'Sin nombre',
                precio: parseFloat(servicio.servicio.precio || 0),
                cantidad: servicio.cantidad || 1
              };
            }
            // Si ya es un objeto simple
            return {
              nombre: servicio.nombre || 'Sin nombre',
              precio: parseFloat(servicio.precio || 0),
              cantidad: servicio.cantidad || 1
            };
          });
          
          // Crear texto de servicios para visualización simple
          pedidoFormateado.serviciosTexto = pedidoFormateado.serviciosDetalle
            .map(s => `${s.nombre} (${s.cantidad}x)`)
            .join(', ');
        } else {
          pedidoFormateado.serviciosDetalle = [];
          pedidoFormateado.serviciosTexto = 'Sin servicios';
        }
        
        // Asegurarse de que estado sea un objeto con nombre_estado o una cadena
        if (pedidoFormateado.estado && typeof pedidoFormateado.estado === 'object') {
          pedidoFormateado.estadoNombre = pedidoFormateado.estado.nombre_estado || 'Estado desconocido';
        } else {
          pedidoFormateado.estadoNombre = pedidoFormateado.estado || 'Estado desconocido';
        }
        
        this.pedidoDetalle = pedidoFormateado;
      } catch (error) {
        console.error("Error al cargar detalles:", error);
        // Si falla, usar los datos que ya tenemos pero procesándolos
        this.pedidoDetalle = {...pedido};
        this.toast.error("No se pudieron cargar los detalles completos");
      } finally {
        this.isLoading = false;
        this.showDetailsModal = true;
      }
    },
    
    cerrarDetalles() {
      this.showDetailsModal = false;
      this.pedidoDetalle = null;
    },
 

    aceptarPedido(pedido) {
      this.pedidoSeleccionado = pedido;
      this.tituloConfirmacion = 'Confirmar Aceptación';
      this.mensajeConfirmacion = '¿Estás seguro de que quieres aceptar este pedido?';
      this.submensajeConfirmacion = 'El pedido pasará a tu lista de entregas en camino.';
      this.botonConfirmacion = 'Sí, aceptar pedido';
      this.accionPendiente = 'aceptar';
      this.showConfirmModal = true;
      
      if (this.showDetailsModal) {
        this.cerrarDetalles();
      }
    },
    
    finalizarEntrega(pedido) {
      this.pedidoSeleccionado = pedido;
      this.tituloConfirmacion = 'Confirmar Entrega';
      this.mensajeConfirmacion = '¿Confirmas que has realizado la entrega de este pedido?';
      this.submensajeConfirmacion = 'El pedido será marcado como completado.';
      this.botonConfirmacion = 'Sí, confirmar entrega';
      this.accionPendiente = 'finalizar';
      this.showConfirmModal = true;
      
      if (this.showDetailsModal) {
        this.cerrarDetalles();
      }
    },
    
    async confirmarAccion() {
      this.isProcessing = true;
      
      try {
        if (this.accionPendiente === 'aceptar') {
          // Actualizar a estado "En Camino" (id_estado 2)
          await api.repartidor.actualizarEstado(
            this.pedidoSeleccionado.id_pedido, 
            { nuevo_estado: 2 }
          );
          
          // Mover de asignados a en camino localmente
          const index = this.pedidosAsignados.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
          if (index !== -1) {
            const pedido = {...this.pedidosAsignados[index], estado: 'En Camino'};
            this.pedidosAsignados.splice(index, 1);
            this.pedidosEnCamino.push(pedido);
          }
          
          this.toast.success("Pedido aceptado correctamente");
        } else if (this.accionPendiente === 'finalizar') {
          // Actualizar a estado "Finalizado" (id_estado 3)
          await api.repartidor.actualizarEstado(
            this.pedidoSeleccionado.id_pedido, 
            { nuevo_estado: 3 }
          );
          
          // Mover de en camino a historial localmente
          const index = this.pedidosEnCamino.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
          if (index !== -1) {
            const pedido = {...this.pedidosEnCamino[index], estado: 'Finalizado'};
            this.pedidosEnCamino.splice(index, 1);
            this.pedidosHistorial.unshift(pedido); // Agregar al inicio del historial
          }
          
          this.toast.success("Entrega finalizada correctamente");
        }
      } catch (error) {
        console.error("Error al procesar acción:", error);
        const errorMsg = error.response?.data?.error || `Error al ${this.accionPendiente} el pedido`;
        this.toast.error(errorMsg);
      } finally {
        this.showConfirmModal = false;
        this.pedidoSeleccionado = null;
        this.accionPendiente = null;
        this.isProcessing = false;
      }
    },
    
    cancelarAccion() {
      this.showConfirmModal = false;
      this.pedidoSeleccionado = null;
      this.accionPendiente = null;
    },
    
    verMapa(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showMapModal = true;
      this.ubicacionActual = null;
      
      // Cerrar otros modales si están abiertos
      if (this.showDetailsModal) {
        this.cerrarDetalles();
      }
    },
    
    obtenerUbicacionActual() {
      this.obteniendo_ubicacion = true;
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.ubicacionActual = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.obteniendo_ubicacion = false;
            this.toast.success('Ubicación obtenida correctamente');
          },
          (error) => {
            this.obteniendo_ubicacion = false;
            console.error('Error al obtener ubicación:', error);
            
            let mensaje = 'No se pudo obtener tu ubicación.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                mensaje = 'Permiso de ubicación denegado.';
                break;
              case error.POSITION_UNAVAILABLE:
                mensaje = 'Información de ubicación no disponible.';
                break;
              case error.TIMEOUT:
                mensaje = 'Tiempo de espera agotado para obtener ubicación.';
                break;
            }
            
            this.toast.error(mensaje);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        this.obteniendo_ubicacion = false;
        this.toast.error('Tu navegador no soporta geolocalización.');
      }
    },
    
    cerrarMapa() {
      this.showMapModal = false;
      this.ubicacionActual = null;
    }
  },
  watch: {
    searchQuery() {
      // Resetear a la primera página cuando cambia la búsqueda
      this.paginaActual = 1;
    }
  },
  mounted() {
    this.cargarPedidos();
  }
}
</script>



<style src="@/assets/css/PedidosRepartidor.css" scoped></style>

