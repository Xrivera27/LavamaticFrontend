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
                <th>Dirección</th>
                <th>Servicios</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pedido, index) in pedidosFiltrados" :key="pedido.id">
                <td data-label="#">{{ index + 1 }}</td>
                <td data-label="Cliente">{{ pedido.cliente }}</td>
                <td data-label="Dirección">
                  <div class="direccion-cell">{{ pedido.direccion }}</div>
                </td>
                <td data-label="Servicios">
                  <div class="servicios-lista">{{ pedido.servicios.join(', ') }}</div>
                </td>
                <td data-label="Total">${{ pedido.total.toFixed(2) }}</td>
                <td data-label="Fecha">{{ formatDate(pedido.fecha) }}</td>
                <td data-label="Acciones">
                  <button
                    class="btn btn-info"
                    @click="verDetalles(pedido)"
                    title="Ver detalles"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  
                  <!-- Botón para aceptar pedido (solo en estado 'asignados') -->
                  <button
                    v-if="estadoActual === 'asignados'"
                    class="btn btn-success"
                    @click="aceptarPedido(pedido)"
                    title="Aceptar pedido"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>

                  <!-- Botón para finalizar entrega (solo en estado 'encamino') -->
                  <button
                    v-if="estadoActual === 'encamino'"
                    class="btn btn-success"
                    @click="finalizarEntrega(pedido)"
                    title="Finalizar entrega"
                  >
                    <i class="fa-solid fa-flag-checkered"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
                  <strong>Fecha:</strong>
                  <span>{{ formatDate(pedidoDetalle.fecha) }}</span>
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
                >
                  {{ botonConfirmacion }}
                </button>
                <button class="btn btn-secondary" @click="cancelarAccion">
                  No, regresar
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
import SidebarRepartidor from './SidebarRepartidor.vue';

export default {
  name: 'PedidosRepartidor',
  components: {
    SidebarRepartidor
  },
  data() {
    return {
      isSidebarExpanded: false,
      isLoading: false,
      showDetailsModal: false,
      showConfirmModal: false,
      searchQuery: "",
      estadoActual: 'asignados',
      pedidoDetalle: null,
      pedidoSeleccionado: null,
      tituloConfirmacion: '',
      mensajeConfirmacion: '',
      submensajeConfirmacion: '',
      botonConfirmacion: '',
      accionPendiente: null,
      pedidosAsignados: [
        {
          id: 1,
          cliente: 'Roberto Mendoza',
          direccion: 'Colonia Kennedy, Calle Principal #123',
          telefono: '+504 9988-7766',
          servicios: ['Lavado Estándar', 'Planchado'],
          serviciosDetalle: [
            { nombre: 'Lavado Estándar', precio: 7.99 },
            { nombre: 'Planchado', precio: 5.99 }
          ],
          total: 13.98,
          fecha: new Date('2024-02-22 10:30'),
          notas: 'Llamar antes de entregar. Preferiblemente en la tarde.'
        },
        {
          id: 2,
          cliente: 'María Torres',
          direccion: 'Residencial Las Uvas, Casa #45',
          telefono: '+504 9955-4433',
          servicios: ['Lavado Express', 'Limpieza en Seco'],
          serviciosDetalle: [
            { nombre: 'Lavado Express', precio: 12.99 },
            { nombre: 'Limpieza en Seco', precio: 19.99 }
          ],
          total: 32.98,
          fecha: new Date('2024-02-22 11:15'),
          notas: ''
        }
      ],
      pedidosEnCamino: [
        {
          id: 3,
          cliente: 'Carlos Rodríguez',
          direccion: 'Col. Miraflores, Bloque 4, Casa #12',
          telefono: '+504 8877-6655',
          servicios: ['Lavado y Planchado'],
          serviciosDetalle: [
            { nombre: 'Lavado y Planchado', precio: 15.99 }
          ],
          total: 15.99,
          fecha: new Date('2024-02-22 09:45'),
          notas: 'El timbre no funciona, por favor llamar al llegar.'
        }
      ]
    }
  },
  computed: {
    placeholderBusqueda() {
      return this.estadoActual === 'asignados' ? 'asignados...' : 'en camino...';
    },
    pedidosFiltrados() {
      const pedidos = this.estadoActual === 'asignados' ? this.pedidosAsignados : this.pedidosEnCamino;
      
      if (!this.searchQuery) return pedidos;

      const searchTerm = this.searchQuery.toLowerCase();
      return pedidos.filter(pedido => 
        pedido.cliente.toLowerCase().includes(searchTerm) ||
        pedido.direccion.toLowerCase().includes(searchTerm) ||
        pedido.servicios.some(s => s.toLowerCase().includes(searchTerm))
      );
    }
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    cambiarEstado(estado) {
      this.estadoActual = estado;
      this.searchQuery = '';
      if (this.showDetailsModal) {
        this.cerrarDetalles();
      }
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
    confirmarAccion() {
      this.isLoading = true;
      
      setTimeout(() => {
        if (this.accionPendiente === 'aceptar') {
          // Mover de asignados a en camino
          const index = this.pedidosAsignados.findIndex(p => p.id === this.pedidoSeleccionado.id);
          if (index !== -1) {
            const pedido = this.pedidosAsignados.splice(index, 1)[0];
            this.pedidosEnCamino.push(pedido);
          }
          alert("Pedido aceptado correctamente");
        } else {
          // Eliminar de en camino (en una app real, se movería a completados)
          const index = this.pedidosEnCamino.findIndex(p => p.id === this.pedidoSeleccionado.id);
          if (index !== -1) {
            this.pedidosEnCamino.splice(index, 1);
          }
          alert("Entrega finalizada correctamente");
        }
        
        this.isLoading = false;
        this.showConfirmModal = false;
        this.pedidoSeleccionado = null;
        this.accionPendiente = null;
      }, 1000);
    },
    cancelarAccion() {
      this.showConfirmModal = false;
      this.pedidoSeleccionado = null;
      this.accionPendiente = null;
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

<style src="@/assets/css/PedidosRepartidor.css" scoped></style>