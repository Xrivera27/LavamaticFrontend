<template>
  <div class="admin-layout">
    <SidebarDinamico @sidebar-toggle="handleSidebarToggle" />
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
            :class="{ active: estadoActual === 'listos' }"
            @click="cambiarEstado('listos')"
          >
            Listos para recoger
            <span class="badge" v-if="pedidosListos.length">{{ pedidosListos.length }}</span>
          </button>
          <button 
            class="tab-button" 
            :class="{ active: estadoActual === 'soloAsignados' }"
            @click="cambiarEstado('soloAsignados')"
          >
            Asignados
            <span class="badge" v-if="pedidosSoloAsignados.length">{{ pedidosSoloAsignados.length }}</span>
          </button>
          <button 
            class="tab-button" 
            :class="{ active: estadoActual === 'asignados' }"
            @click="cambiarEstado('asignados')"
          >
            En camino
            <span class="badge" v-if="pedidosAsignados.length">{{ pedidosAsignados.length }}</span>
          </button>
          <button 
            class="tab-button" 
            :class="{ active: estadoActual === 'finalizados' }"
            @click="cambiarEstado('finalizados')"
          >
            Entregados
            <span class="badge" v-if="pedidosFinalizados.length">{{ pedidosFinalizados.length }}</span>
          </button>
        </div>
    
        <div class="opciones">
          <div class="search-bar">
            <input
              class="busqueda"
              type="text"
              v-model="searchQuery"
              :placeholder="`Buscar pedido en ${getEstadoDisplayName()}...`"
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
                <th v-if="estadoActual === 'soloAsignados' || estadoActual === 'asignados' || estadoActual === 'finalizados'">Repartidor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pedido) in paginatedPedidos" :key="pedido.id_pedido">
                <td data-label="#">
                  {{ pedido.id_pedido }}
                </td>
                <td data-label="Cliente">{{ pedido.cliente }}</td>
                <td data-label="Servicios">
                  <div class="servicios-lista">
                    {{ pedido.servicios }}
                  </div>
                </td>
                <td data-label="Total">LPS.{{ Number(pedido.total).toFixed(2) }}</td>
                <td data-label="Fecha">{{ formatDate(pedido.fecha) }}</td>
                <td v-if="estadoActual === 'soloAsignados' || estadoActual === 'asignados' || estadoActual === 'finalizados'" data-label="Repartidor">
                  {{ pedido.repartidor || 'Recogida en tienda' }}
                </td>
                <td data-label="Estado">
                  <span :class="'badge ' + getEstadoClass(estadoActual === 'soloAsignados' ? 'Asignado' : pedido.estado)">
                    {{ estadoActual === 'soloAsignados' ? 'Asignado' : pedido.estado }}
                  </span>
                </td>
                <td data-label="Acciones">
  <div class="btn-group" role="group">
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

    <!-- Botón para marcar como listo para recoger (solo en estado 'en espera') -->
    <button
      v-if="estadoActual === 'espera'"
      class="btn btn-success"
      @click="marcarComoListo(pedido)"
      title="Marcar como listo para recoger"
    >
      <i class="fa-solid fa-check-circle"></i>
    </button>

    <!-- Botón para marcar como entregado (desde listos para recoger) -->
    <button
      v-if="estadoActual === 'listos'"
      class="btn btn-success"
      @click="marcarComoEntregado(pedido)"
      title="Marcar como entregado"
    >
      <i class="fa-solid fa-flag-checkered"></i>
    </button>

    <!-- Botón para marcar como entregado (solo en estado 'asignados') -->
    <button
      v-if="estadoActual === 'asignados'"
      class="btn btn-success"
      @click="marcarComoEntregado(pedido)"
      title="Marcar como entregado"
    >
      <i class="fa-solid fa-check"></i>
    </button>

    <!-- Botón para volver a poner en espera -->
    <button
      v-if="estadoActual === 'asignados' || estadoActual === 'soloAsignados' || estadoActual === 'listos'"
      class="btn btn-warning"
      style="color: white;"
      @click="volverAEspera(pedido)"
      title="Volver a espera"
    >
      <i class="fa-solid fa-rotate-left"></i>
    </button>
  </div>
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
                  <span :class="'badge ' + getEstadoClass(pedidoDetalle.id_repartidor && pedidoDetalle.estado === 'En Espera' ? 'Asignado' : pedidoDetalle.estado)">
                    {{ pedidoDetalle.id_repartidor && pedidoDetalle.estado === 'En Espera' ? 'Asignado' : pedidoDetalle.estado }}
                  </span>
                </div>
                <div class="detalle-row" v-if="pedidoDetalle.repartidor">
                  <strong>Repartidor:</strong>
                  <span>{{ pedidoDetalle.repartidor }}</span>
                </div>
                <div class="detalle-servicios">
                  <strong>Total:</strong>
                  <span>LPS.{{ Number(pedidoDetalle.total).toFixed(2) }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Dirección de Entrega:</strong>
                  <span>{{ pedidoDetalle.direccion_entrega || 'No especificada' }}</span>
                </div>
                
                <!-- Botones de acción en modal de detalles -->
                <div class="detalle-acciones" v-if="pedidoDetalle.estado === 'En Espera' && !pedidoDetalle.id_repartidor">
                  <button 
                    class="btn btn-success" 
                    @click="marcarComoListoDesdeModal()"
                  >
                    Marcar como listo para recoger
                  </button>
                </div>
                <div class="detalle-acciones" v-if="pedidoDetalle.estado === 'Listo para recoger'">
                  <button 
                    class="btn btn-success" 
                    @click="marcarComoEntregadoDesdeModal()"
                  >
                    Marcar como entregado
                  </button>
                </div>
                <div class="detalle-acciones" v-if="pedidoDetalle.estado === 'En camino'">
                  <button 
                    class="btn btn-success" 
                    @click="marcarComoEntregadoDesdeModal()"
                  >
                    Marcar como entregado
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="cerrarDetalles">
                Cerrar
              </button>
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
                <label id="texttop">Seleccionar Repartidor:</label>
                <select v-model="repartidorSeleccionado" required @change="logRepartidorSeleccionado">
                  <option value="">Seleccione un repartidor</option>
                  <option v-for="repartidor in repartidoresDisponibles" :key="repartidor.id_repartidor" :value="repartidor">
                    {{ repartidor.nombre !== `Error al cargar (ID: ${repartidor.id_usuario})` ? 
                        repartidor.nombre : `Repartidor #${repartidor.id_repartidor}` }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
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

        <!-- Modal de confirmación para volver a espera -->
        <div class="modal" v-if="showConfirmModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres volver este pedido a estado "En Espera"?</p>
              <p v-if="pedidoSeleccionado && pedidoSeleccionado.id_repartidor">El repartidor actual será desasignado.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-warning" @click="confirmarVolverAEspera" style="color: white;">
                Sí, volver a espera
              </button>
              <button class="btn btn-secondary" @click="cancelarVolverAEspera">
                No, cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de confirmación para marcar como entregado -->
        <div class="modal" v-if="showEntregadoModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación de Entrega</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres marcar este pedido como entregado?</p>
              <p v-if="pedidoSeleccionado && pedidoSeleccionado.estado === 'En Espera' && !pedidoSeleccionado.id_repartidor">
                Se marcará como entregado directamente sin asignar repartidor.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-success" @click="confirmarEntrega">
                Sí, confirmar entrega
              </button>
              <button class="btn btn-secondary" @click="cancelarEntrega">
                No, cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de confirmación para cambiar a "En camino" -->
        <div class="modal" v-if="showEnCaminoModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación de Estado</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres cambiar el estado del pedido a "En camino"?</p>
              <p>Se notificará al cliente que su pedido está en proceso de entrega.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" @click="confirmarCambiarAEnCamino">
                Sí, confirmar
              </button>
              <button class="btn btn-secondary" @click="cancelarCambiarAEnCamino">
                No, cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de confirmación para marcar como listo para recoger -->
        <div class="modal" v-if="showListoModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres marcar este pedido como listo para recoger en sucursal?</p>
              <p><strong>Importante:</strong> Este estado es exclusivamente para pedidos que serán recogidos por el cliente en la tienda, NO para entregas a domicilio.</p>
              <p>Al marcar como "Listo para recoger", se notificará al cliente que puede pasar a recoger su pedido.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-success" @click="confirmarListo">
                Sí, marcar como listo
              </button>
              <button class="btn btn-secondary" @click="cancelarListo">
                No, cancelar
              </button>
            </div>
          </div>
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
      
      <!-- Mensaje específico para pedidos que están Listos para Recoger -->
      <p v-if="pedidoSeleccionado && pedidoSeleccionado.estado === 'Listo para recoger'">
        <strong>Importante:</strong> Este pedido ya estaba marcado como listo para recoger. 
        Al volver a "En Espera", el cliente será notificado que su pedido ya no está disponible para recoger.
      </p>
      
      <!-- Mensaje específico para pedidos que están En Camino -->
      <p v-if="pedidoSeleccionado && pedidoSeleccionado.estado === 'En camino'">
        <strong>Atención:</strong> El pedido ya estaba en proceso de entrega. 
        Al volver a "En Espera", se interrumpirá el proceso de entrega actual.
      </p>
      
      <!-- Mensaje para pedidos con repartidor asignado -->
      <p v-if="pedidoSeleccionado && pedidoSeleccionado.id_repartidor">
        El repartidor asignado (<strong>{{ pedidoSeleccionado.repartidor }}</strong>) será desasignado del pedido.
      </p>

      <p>Esta acción no se puede deshacer automáticamente.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-warning" @click="confirmarVolverAEspera" style="color: white;">
        Sí, volver a espera
      </button>
      <button class="btn btn-secondary" @click="cancelarVolverAEspera">
        No, cancelar
      </button>
    </div>
  </div>
</div>
</template>

<script>
import SidebarDinamico from './SidebarDinamico.vue';
import api from '@/services/apiService';
import { useToast } from "vue-toastification";
import { io } from 'socket.io-client'; // Importar socket.io-client

export default {
  name: "GestionPedidos",
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
      showDetailsModal: false,
      showAsignarModal: false,
      showConfirmModal: false,
      showEntregadoModal: false,
      showEnCaminoModal: false,
      showListoModal: false,
      isLoading: false,
      searchQuery: "",
      currentPage: 1,
      pageSize: 4,
      estadoActual: 'espera', // 'espera', 'listos', 'soloAsignados', 'asignados', 'finalizados'
      pedidoDetalle: null,
      pedidoSeleccionado: null,
      repartidorSeleccionado: null,
      repartidoresDisponibles: [],
      repartidorUsuarioMap: {}, // Añadido para mantener el mapeo
      pedidos: [],
      // Variables para WebSocket
      socket: null,
      sonidoActivado: true
    };
  },
  computed: {
    pedidosEnEspera() {
      return this.pedidos.filter(p => p.estado === 'En Espera' && p.id_repartidor === null);
    },
    pedidosListos() {
      // Pedidos que están marcados como "Listo para recoger"
      return this.pedidos.filter(p => 
        p.estado === 'Listo para recoger'
      );
    },
    pedidosSoloAsignados() {
      // Pedidos que tienen repartidor asignado pero aún están en estado "En Espera"
      return this.pedidos.filter(p => 
        p.id_repartidor !== null && 
        p.estado === 'En Espera'
      );
    },
    pedidosAsignados() {
      // Pedidos que están "En camino"
      return this.pedidos.filter(p => 
        p.estado === 'En camino'
      );
    },
    pedidosFinalizados() {
      // Pedidos entregados
      return this.pedidos.filter(p => 
        p.estado === 'Entregada'
      );
    },
    pedidosFiltrados() {
      return this.pedidos.filter(pedido => {
        // Filtrar por estado
        switch(this.estadoActual) {
          case 'espera':
            // Solo mostrar los que están en espera Y NO tienen repartidor
            if (pedido.estado !== 'En Espera' || pedido.id_repartidor !== null) return false;
            break;
          case 'listos':
            // Mostrar los que están listos para recoger
            if (pedido.estado !== 'Listo para recoger') return false;
            break;
          case 'soloAsignados':
            // Mostrar los que tienen repartidor pero aún no están en camino
            if (pedido.id_repartidor === null || pedido.estado !== 'En Espera') return false;
            break;
          case 'asignados':
            // Mostrar los que están "En camino"
            if (pedido.estado !== 'En camino') return false;
            break;
          case 'finalizados':
            // Mostrar los pedidos entregados
            if (pedido.estado !== 'Entregada') return false;
            break;
        }
      
        // Filtrar por término de búsqueda
        if (!this.searchQuery) return true;
        
        const searchTermLower = this.searchQuery.toLowerCase();
        
        return (
          pedido.cliente.toLowerCase().includes(searchTermLower) ||
          pedido.total.toString().includes(searchTermLower) ||
          (pedido.repartidor && pedido.repartidor.toLowerCase().includes(searchTermLower))
        );
      });
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
    // WEBSOCKET METHODS - NUEVOS MÉTODOS
    iniciarWebSocket() {
  // URL explícita para el entorno de producción
  const API_URL = 'https://lavamaticbackend.onrender.com';
  
  console.log('Intentando conectar WebSocket a:', API_URL);

  // Configuración más detallada para Socket.io
  this.socket = io(API_URL, {
    path: '/socket.io/', // Asegúrate de que esta es la ruta correcta
    transports: ['websocket', 'polling'], // Intenta websocket primero, luego polling
    secure: true, // Importante para HTTPS
    rejectUnauthorized: false, // Necesario en algunos casos
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000 // Aumentar el tiempo de espera
  });
  
  // Monitorear eventos de conexión para depuración
  this.socket.on('connect', () => {
    console.log('WebSocket conectado exitosamente con ID:', this.socket.id);
    this.socket.emit('admin-connected');
    console.log('Enviado evento admin-connected');
    
    // Mostrar notificación de conexión exitosa
    this.toast.success("Conexión WebSocket establecida", {
      timeout: 3000
    });
  });
  
  this.socket.on('connect_error', (error) => {
    console.error('Error de conexión WebSocket:', error.message);
    
    // Mostrar error en la interfaz
    this.toast.error(`Error de conexión: ${error.message}`, {
      timeout: 5000
    });
  });
  
  this.socket.on('disconnect', (reason) => {
    console.log('WebSocket desconectado. Razón:', reason);
    
    // Intentar reconectar manualmente después de cierto tiempo si la desconexión no es explícita
    if (reason === 'io server disconnect') {
      // Si el servidor cerró la conexión, intentar reconectar manualmente
      setTimeout(() => {
        console.log('Intentando reconexión manual...');
        this.socket.connect();
      }, 3000);
    }
  });
  
  this.socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Intento de reconexión #${attemptNumber}`);
  });
  
  this.socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconectado después de ${attemptNumber} intentos`);
    
    // Volver a unirse a la sala de administradores
    this.socket.emit('admin-connected');
    
    this.toast.success("Conexión WebSocket restablecida", {
      timeout: 3000
    });
  });
  
  // Escuchar el evento específico para nuevos pedidos
  this.socket.on('nuevo-pedido', (pedidoData) => {
    console.log('✅ Evento nuevo-pedido recibido:', pedidoData);
    this.manejarNuevoPedido(pedidoData);
  });
  
  // Escuchar eventos de actualización de pedidos
  this.socket.on('pedido-actualizado', (pedidoData) => {
    console.log('Evento pedido-actualizado recibido:', pedidoData);
    this.manejarPedidoActualizado(pedidoData);
  });
  
  console.log('Inicialización de WebSocket completada');
},

    // Manejar evento de nuevo pedido
manejarNuevoPedido(pedidoData) {
  console.log('Nuevo pedido recibido:', pedidoData);
  
  // Convertir el pedido recibido al formato de la aplicación
  const nuevoPedido = {
    id_pedido: pedidoData.id,
    cliente: pedidoData.cliente,
    total: pedidoData.total || 0,
    fecha: new Date(pedidoData.timestamp || Date.now()),
    estado: 'En Espera',
    id_estado: 1,
    repartidor: null,
    id_repartidor: null,
    direccion_recogida: pedidoData.direccionRecogida || '',
    direccion_entrega: pedidoData.direccionEntrega || '',
    servicios: pedidoData.servicios || 'Servicio no especificado'
  };
  
  // Añadir el nuevo pedido al principio de la lista
  this.pedidos.unshift(nuevoPedido);
  
  // Mostrar notificación
  this.mostrarNotificacionNuevoPedido(nuevoPedido);
  
  // Reproducir sonido de alerta
  this.reproducirSonidoAlerta();
},
    
    // Mostrar notificación para un nuevo pedido
    mostrarNotificacionNuevoPedido(pedido) {
      // Notificación en la aplicación
      this.toast.success(`¡Nuevo pedido recibido! #${pedido.id_pedido} - Cliente: ${pedido.cliente}`, {
        timeout: 10000,
        closeButton: true,
        icon: true
      });
      
      // Notificación del navegador si está disponible
      this.mostrarNotificacionNavegador(pedido);
    },
    
    // Mostrar notificación del navegador
    mostrarNotificacionNavegador(pedido) {
      // Comprobar si el navegador soporta notificaciones
      if ('Notification' in window) {
        // Solicitar permiso si no está concedido
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
        
        // Mostrar notificación si el permiso está concedido
        if (Notification.permission === 'granted') {
          new Notification('Nuevo Pedido', {
            body: `Cliente: ${pedido.cliente}\nTotal: LPS.${Number(pedido.total).toFixed(2)}`,
            icon: '/favicon.ico' // Ruta a tu icono
          });
        }
      }
    },
    
    // Reproducir sonido de alerta
    reproducirSonidoAlerta() {
      if (!this.sonidoActivado) return;
      
      try {
        // Crear un elemento de audio
        const audio = new Audio();
        
        // Establecer la fuente del sonido (ajustar según tu proyecto)
        audio.src = '/sounds/notification.mp3';
        
        // Reproducir el sonido
        audio.play().catch(error => {
          console.error('Error al reproducir sonido:', error);
        });
      } catch (error) {
        console.error('Error con reproducción de audio:', error);
      }
    },
    
    // Desconectar el socket al desmontar el componente
    desconectarWebSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        console.log('WebSocket desconectado');
      }
    },
    // FIN DE WEBSOCKET METHODS

    getEstadoDisplayName() {
      switch(this.estadoActual) {
        case 'espera': return 'En Espera';
        case 'listos': return 'Listos para recoger';
        case 'soloAsignados': return 'Asignados';
        case 'asignados': return 'En camino';
        case 'finalizados': return 'Entregados';
        default: return this.estadoActual;
      }
    },
    
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    async cargarDatos() {
      this.isLoading = true;
      try {
        // 1. Cargar repartidores disponibles primero para tener el mapa
        await this.cargarRepartidoresDisponibles();
        
        // 2. Cargar pedidos
        const pedidosResponse = await api.pedidos.getAll();
        const pedidos = pedidosResponse.data;
        
        // 3. Cargar usuarios (para obtener nombres de clientes)
        const usuariosResponse = await api.clients.getAll();
        const usuariosMap = {};
        usuariosResponse.data.forEach(usuario => {
          usuariosMap[usuario.id] = usuario;
        });
        
        // 4. Procesar pedidos con la información combinada
        this.pedidos = pedidos.map(pedido => {
          // Determinar el estado correcto
          let estado = pedido.estado ? pedido.estado.nombre_estado : this.obtenerEstadoNombre(pedido.id_estado);
          
          // Obtener información del cliente
          let nombreCliente = 'Cliente Desconocido';
          if (pedido.cliente && pedido.cliente.nombre) {
            nombreCliente = pedido.cliente.nombre;
          } else if (pedido.id_cliente && usuariosMap[pedido.id_cliente]) {
            nombreCliente = usuariosMap[pedido.id_cliente].nombre;
          } else if (pedido.id_cliente) {
            nombreCliente = `Cliente ${pedido.id_cliente}`;
          }
          
          // Obtener información del repartidor desde nuestro mapa
          let nombreRepartidor = null;
          if (pedido.repartidor && pedido.repartidor.nombre) {
            nombreRepartidor = pedido.repartidor.nombre;
          } else if (pedido.id_repartidor) {
            // Buscar primero en repartidoresDisponibles
            const repartidorInfo = this.repartidoresDisponibles.find(r => r.id_repartidor === pedido.id_repartidor);
            if (repartidorInfo) {
              nombreRepartidor = repartidorInfo.nombre;
            } else {
              // Si no encontramos en repartidoresDisponibles, tratar de buscar en usuariosMap
              const idUsuario = this.repartidorUsuarioMap[pedido.id_repartidor];
              if (idUsuario && usuariosMap[idUsuario]) {
                nombreRepartidor = usuariosMap[idUsuario].nombre;
              } else {
                nombreRepartidor = `Repartidor ${pedido.id_repartidor}`;
              }
            }
          }
          
          return {
            id_pedido: pedido.id_pedido,
            id_cliente: pedido.id_cliente,
            cliente: nombreCliente,
            total: pedido.total || 0,
            fecha: pedido.fecha_creacion ? new Date(pedido.fecha_creacion) : new Date(),
            estado: estado,
            id_estado: pedido.id_estado,
            repartidor: nombreRepartidor,
            id_repartidor: pedido.id_repartidor,
            direccion_recogida: pedido.direccion_recogida || '',
            direccion_entrega: pedido.direccion_entrega || '',
            servicios: pedido.servicios || 'Lavado general'
          };
        });
        
        // Log para depuración
        console.log("Pedidos procesados:", this.pedidos);
        console.log("Pedidos con repartidor:", this.pedidos.filter(p => p.id_repartidor));
        console.log("Pedidos entregados:", this.pedidosFinalizados);
        
        this.toast.success("Datos cargados correctamente");
      } catch (error) {
        console.error("Error al cargar datos:", error);
        this.toast.error("Error al cargar los datos");
      } finally {
        this.isLoading = false;
      }
    },

    async cargarRepartidoresDisponibles() {
      try {
        // Obtener lista de repartidores
        const response = await api.repartidores.getAll();
        console.log("Datos repartidores obtenidos:", response.data);
        
        // Procesar cada repartidor para extraer la información de usuario
        const repartidoresData = response.data.map(repartidor => {
          // Verificar si existe la propiedad 'user' y tiene un nombre
          const nombreUsuario = repartidor.user && repartidor.user.nombre 
            ? repartidor.user.nombre 
            : `Repartidor ${repartidor.id_repartidor}`;
            
          return {
            id_repartidor: repartidor.id_repartidor,
            id_usuario: repartidor.id_usuario,
            nombre: nombreUsuario,
            codigo_mochila: repartidor.codigo_mochila || ''
          };
        });
        
        this.repartidoresDisponibles = repartidoresData;
        console.log("Repartidores disponibles procesados:", this.repartidoresDisponibles);
      } catch (error) {
        console.error("Error al cargar repartidores:", error);
        this.toast.error("Error al cargar lista de repartidores disponibles");
      }
    },
    
    logRepartidorSeleccionado() {
      console.log("Repartidor seleccionado:", this.repartidorSeleccionado);
    },

    obtenerEstadoNombre(idEstado) {
      const estadosMap = {
        1: 'En Espera',
        2: 'En camino',
        3: 'Entregada',
        4: 'Listo para recoger'
      };
      return estadosMap[idEstado] || 'Desconocido';
    },
    
    obtenerEstadoId(nombreEstado) {
      const estadosMap = {
        'En Espera': 1,
        'En camino': 2,
        'Entregada': 3,
        'Listo para recoger': 4
      };
      return estadosMap[nombreEstado] || 1;
    },
    
    cambiarEstado(estado) {
      this.estadoActual = estado;
      this.currentPage = 1;
      this.searchQuery = '';
    },
    
    formatDate(date) {
      if (!date || date === 'Invalid Date') return 'Fecha no disponible';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      if (isNaN(date.getTime())) return 'Fecha no válida';
      
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    },
    
    getEstadoClass(estado) {
      switch(estado) {
        case 'En Espera': return 'badge-warning';
        case 'Asignado': return 'badge-info';
        case 'En camino': return 'badge-primary';
        case 'Entregada': return 'badge-success';
        case 'Listo para recoger': return 'badge-info';
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
    
    async confirmarAsignacion() {
      if (!this.repartidorSeleccionado) return;
      
      this.isLoading = true;
      
      try {
        console.log("Asignando repartidor:", this.repartidorSeleccionado);
        
        // Llamar a la API para asignar el repartidor
        const response = await api.pedidos.asignarRepartidor(
          this.pedidoSeleccionado.id_pedido, 
          this.repartidorSeleccionado.id_repartidor
        );
        
        console.log("Respuesta asignación:", response.data);
        
        // Actualizar localmente
        const index = this.pedidos.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'En Espera', // Mantiene estado "En Espera" pero con repartidor asignado
            id_estado: 1,
            repartidor: this.repartidorSeleccionado.nombre,
            id_repartidor: this.repartidorSeleccionado.id_repartidor
          };
        }
        
        this.toast.success("Repartidor asignado correctamente");
        this.showAsignarModal = false;
        this.pedidoSeleccionado = null;
        this.repartidorSeleccionado = null;
        
      } catch (error) {
        console.error("Error al asignar repartidor:", error);
        const errorMsg = error.response?.data?.error || "Error al asignar repartidor";
        this.toast.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelarAsignacion() {
      this.showAsignarModal = false;
      this.pedidoSeleccionado = null;
      this.repartidorSeleccionado = null;
    },
    
    // Métodos para cambiar a "En camino"
    cambiarAEnCamino(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showEnCaminoModal = true;
    },
    
    cambiarAEnCaminoDesdeModal() {
      this.pedidoSeleccionado = this.pedidoDetalle;
      this.showDetailsModal = false;
      this.showEnCaminoModal = true;
    },
    
    async confirmarCambiarAEnCamino() {
      this.isLoading = true;
      
      try {
        // Cambiar estado a "En camino" (id_estado 2)
        const response = await api.pedidos.cambiarEstado(
          this.pedidoSeleccionado.id_pedido, 
          2
        );
        
        console.log("Respuesta cambiar a en camino:", response.data);
        
        // Actualizar localmente
        const index = this.pedidos.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'En camino',
            id_estado: 2
          };
        }
        
        this.toast.success("Pedido cambiado a estado 'En camino' correctamente");
        this.showEnCaminoModal = false;
        this.pedidoSeleccionado = null;
      } catch (error) {
        console.error("Error al cambiar a en camino:", error);
        const errorMsg = error.response?.data?.error || "Error al cambiar el estado del pedido";
        this.toast.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelarCambiarAEnCamino() {
      this.showEnCaminoModal = false;
      this.pedidoSeleccionado = null;
    },
    
    volverAEspera(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showConfirmModal = true;
    },
    
    async confirmarVolverAEspera() {
  this.isLoading = true;
  
  try {
    // Guardar el estado actual para mostrar el mensaje adecuado
    const estadoAnterior = this.pedidoSeleccionado.estado;
    const teniaRepartidor = this.pedidoSeleccionado.id_repartidor !== null;
    
    // Llamar a la API para volver el pedido a estado "En Espera"
    const response = await api.pedidos.volverAEspera(this.pedidoSeleccionado.id_pedido);
    console.log("Respuesta volver a espera:", response.data);
    
    // Actualizar localmente
    const index = this.pedidos.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
    if (index !== -1) {
      this.pedidos[index] = {
        ...this.pedidoSeleccionado,
        estado: 'En Espera',
        id_estado: 1,
        repartidor: null,
        id_repartidor: null
      };
    }
    
    // Mostrar mensaje personalizado según el estado anterior
    if (estadoAnterior === 'Listo para recoger' || estadoAnterior === 'En camino' || teniaRepartidor) {
      this.toast.success("Pedido vuelto a estado 'En Espera' correctamente. Se ha enviado una notificación al cliente.");
    } else {
      this.toast.success("Pedido vuelto a estado 'En Espera' correctamente");
    }
    
    this.showConfirmModal = false;
    this.pedidoSeleccionado = null;
  } catch (error) {
    console.error("Error al volver a espera:", error);
    const errorMsg = error.response?.data?.error || "Error al volver el pedido a espera";
    this.toast.error(errorMsg);
  } finally {
    this.isLoading = false;
  }
},
    
    cancelarVolverAEspera() {
      this.showConfirmModal = false;
      this.pedidoSeleccionado = null;
    },
    
    // Métodos para marcar como entregado
    marcarComoEntregado(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showEntregadoModal = true;
    },
    
    marcarComoEntregadoDesdeModal() {
      this.pedidoSeleccionado = this.pedidoDetalle;
      this.showDetailsModal = false;
      this.showEntregadoModal = true;
    },
    
    async confirmarEntrega() {
      this.isLoading = true;
      
      try {
        // Cambiar estado a "Entregada" (id_estado 3)
        const response = await api.pedidos.cambiarEstado(
          this.pedidoSeleccionado.id_pedido, 
          3
        );
        
        console.log("Respuesta marcar como entregado:", response.data);
        
        // Actualizar localmente
        const index = this.pedidos.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'Entregada',
            id_estado: 3
          };
        }
        
        this.toast.success("Pedido marcado como entregado. Se ha enviado un email de agradecimiento al cliente.");
        this.showEntregadoModal = false;
        this.pedidoSeleccionado = null;
      } catch (error) {
        console.error("Error al marcar como entregado:", error);
        const errorMsg = error.response?.data?.error || "Error al marcar el pedido como entregado";
        this.toast.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelarEntrega() {
      this.showEntregadoModal = false;
      this.pedidoSeleccionado = null;
    },
    
    // Métodos para marcar como listo para recoger
    marcarComoListo(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showListoModal = true;
    },
    
    marcarComoListoDesdeModal() {
      this.pedidoSeleccionado = this.pedidoDetalle;
      this.showDetailsModal = false;
      this.showListoModal = true;
    },
    
    async confirmarListo() {
      this.isLoading = true;
      
      try {
        // Cambiar estado a "Listo para recoger" (id_estado 4)
        const response = await api.pedidos.cambiarEstado(
          this.pedidoSeleccionado.id_pedido, 
          4
        );
        
        console.log("Respuesta marcar como listo:", response.data);
        
        // Actualizar localmente
        const index = this.pedidos.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'Listo para recoger',
            id_estado: 4
          };
        }
        
        this.toast.success("Pedido marcado como listo para recoger");
        this.showListoModal = false;
        this.pedidoSeleccionado = null;
      } catch (error) {
        console.error("Error al marcar como listo:", error);
        const errorMsg = error.response?.data?.error || "Error al cambiar el estado del pedido";
        this.toast.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelarListo() {
      this.showListoModal = false;
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
    // Cargar datos y iniciar WebSocket cuando el componente se monta
    this.cargarDatos();
    
    // Iniciar la conexión WebSocket
    this.iniciarWebSocket();
  },
  beforeUnmount() {
    // Desconectar WebSocket cuando el componente se desmonta
    this.desconectarWebSocket();
  }
};
</script>

<style src="@/assets/css/CrearPedidos.css" scoped>
</style>