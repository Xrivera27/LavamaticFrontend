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
            <span class="badge" v-if="pedidosFinalizados.length">{{ pedidosFinalizados.length }}</span>
          </button>
        </div>
    
        <div class="opciones">
          <div class="search-bar">
            <input
              class="busqueda"
              type="text"
              v-model="searchQuery"
              :placeholder="`Buscar pedido en ${estadoActual}...`"
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
                <th v-if="estadoActual === 'asignados' || estadoActual === 'finalizados'">Repartidor</th>
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
                <td data-label="Total">${{ Number(pedido.total).toFixed(2) }}</td>
                <td data-label="Fecha">{{ formatDate(pedido.fecha) }}</td>
                <td v-if="estadoActual === 'asignados' || estadoActual === 'finalizados'" data-label="Repartidor">
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
                    style="color: white;"
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
                  <strong>Total:</strong>
                  <span>${{ Number(pedidoDetalle.total).toFixed(2) }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Dirección de Recogida:</strong>
                  <span>{{ pedidoDetalle.direccion_recogida || 'No especificada' }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Dirección de Entrega:</strong>
                  <span>{{ pedidoDetalle.direccion_entrega || 'No especificada' }}</span>
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
              <p>El repartidor actual será desasignado.</p>
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
      </div>
    </div>
  </div>
</template>

<script>
import SidebarAdmin from './SidebarAdmin.vue';
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: "GestionPedidos",
  components: {
    SidebarAdmin
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
      isLoading: false,
      searchQuery: "",
      currentPage: 1,
      pageSize: 4,
      estadoActual: 'espera', // 'espera', 'asignados', 'finalizados'
      pedidoDetalle: null,
      pedidoSeleccionado: null,
      repartidorSeleccionado: null,
      repartidoresDisponibles: [],
      repartidorUsuarioMap: {}, // Añadido para mantener el mapeo
      pedidos: []
    };
  },
  computed: {
    pedidosEnEspera() {
      return this.pedidos.filter(p => p.estado === 'En Espera' && p.id_repartidor === null);
    },
    pedidosAsignados() {
      // Considerar como asignados SOLO los pedidos con id_repartidor que NO estén finalizados o entregados
      return this.pedidos.filter(p => 
        p.id_repartidor !== null && 
        p.estado !== 'Finalizado' && 
        p.estado !== 'Entregada'
      );
    },
    pedidosFinalizados() {
      // Mostrar todos los pedidos finalizados o entregados
      return this.pedidos.filter(p => 
        p.estado === 'Finalizado' || 
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
          case 'asignados':
            // Mostrar los que tienen repartidor pero NO están finalizados o entregados
            if (pedido.id_repartidor === null || 
                pedido.estado === 'Finalizado' || 
                pedido.estado === 'Entregada') return false;
            break;
          case 'finalizados':
            // Mostrar los pedidos finalizados o entregados
            if (pedido.estado !== 'Finalizado' && pedido.estado !== 'Entregada') return false;
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
        console.log("Pedidos finalizados:", this.pedidosFinalizados);
        
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
        2: 'Asignado',
        3: 'Finalizado',
        4: 'Entregada'
        // Añadir más estados según sea necesario
      };
      return estadosMap[idEstado] || 'Desconocido';
    },
    
    obtenerEstadoId(nombreEstado) {
      const estadosMap = {
        'En Espera': 1,
        'Asignado': 2,
        'Finalizado': 3,
        'Entregada': 4
        // Añadir más estados según sea necesario
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
        case 'Asignado': return 'badge-primary';
        case 'Finalizado': return 'badge-success';
        case 'Entregada': return 'badge-success';
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
        await api.pedidos.asignarRepartidor(
          this.pedidoSeleccionado.id_pedido, 
          this.repartidorSeleccionado.id_repartidor
        );
        
        // Actualizar localmente
        const index = this.pedidos.findIndex(p => p.id_pedido === this.pedidoSeleccionado.id_pedido);
        if (index !== -1) {
          this.pedidos[index] = {
            ...this.pedidoSeleccionado,
            estado: 'En Espera', // Mantenerlo en espera como mencionaste
            id_estado: 1,
            repartidor: this.repartidorSeleccionado.nombre, // Usar el nombre del objeto seleccionado
            id_repartidor: this.repartidorSeleccionado.id_repartidor
          };
        }
        
        this.toast.success("Repartidor asignado correctamente");
        this.showAsignarModal = false;
        this.pedidoSeleccionado = null;
        this.repartidorSeleccionado = null;
        
        // Recargar datos para asegurar que todo esté actualizado
        await this.cargarDatos();
      } catch (error) {
        console.error("Error al asignar repartidor:", error);
        const errorMsg = error.response?.data?.error || "Error al asignar repartidor";
        this.toast.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Método para cerrar el modal de asignación
    cancelarAsignacion() {
      console.log("Cancelando asignación de repartidor");
      this.showAsignarModal = false;
      this.pedidoSeleccionado = null;
      this.repartidorSeleccionado = null;
    },
    
    volverAEspera(pedido) {
      this.pedidoSeleccionado = pedido;
      this.showConfirmModal = true;
    },
    
    async confirmarVolverAEspera() {
      this.isLoading = true;
      
      try {
        // Llamar a la API para volver el pedido a estado "En Espera"
        await api.pedidos.volverAEspera(this.pedidoSeleccionado.id_pedido);
        
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
        
        this.toast.success("Pedido vuelto a estado 'En Espera' correctamente");
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
    this.cargarDatos();
  }
};
</script>

<style src="@/assets/css/CrearPedidos.css" scoped>
</style>