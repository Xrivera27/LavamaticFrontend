<template>
  <div class="admin-layout">
    <SidebarAdmin @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="mantenimiento-wrapper">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
        
        <div class="header-section">
          <h1 class="page-title">Gestión de Mantenimiento de Equipos</h1>
        </div>
    
        <div class="opciones">
          <button
            id="btnAdd"
            class="btn btn-primary"
            @click="openModal"
            style="width: 240px; white-space: nowrap"
          >
            Registrar Mantenimiento
          </button>
    
          <div class="search-bar">
            <input
              class="busqueda"
              type="text"
              v-model="searchQuery"
              placeholder="Buscar mantenimiento..."
            />
          </div>
        </div>
    
        <div class="table-container">
          <div v-if="isLoading" class="loading-indicator">
            Cargando registros de mantenimiento...
          </div>
    
          <div v-else-if="paginatedMantenimientos.length === 0" class="no-data">
            No se encontraron registros de mantenimiento para mostrar.
          </div>
    
          <table v-else class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Equipo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(mantenimiento, index) in paginatedMantenimientos" :key="mantenimiento.id_mantenimiento">
                <td data-label="#">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </td>
                <td data-label="Equipo">{{ mantenimiento.nombre_equipo }}</td>
                <td data-label="Fecha Inicio">{{ formatDate(mantenimiento.fecha_inicio) }}</td>
                <td data-label="Fecha Fin">{{ formatDate(mantenimiento.fecha_fin) }}</td>
                <td data-label="Estado">
                  <span :class="'badge ' + getEstadoClass(mantenimiento.activo)">
                    {{ mantenimiento.activo ? 'Activo' : 'Finalizado' }}
                  </span>
                </td>
                <td data-label="Acciones">
                  <button style="margin-bottom: 1rem; width: 30%;"
                    class="btn btn-info btn-view"
                    @click="verDetalles(mantenimiento)"
                    title="Ver detalles"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button style="margin-bottom: 1rem; width: 30%;"
                    class="btn btn-warning"
                    @click="editMantenimiento(mantenimiento)"
                    title="Editar"
                  >
                    <i class="fa-solid fa-pencil" style="color: white;"></i>
                  </button>
                  <button v-if="mantenimiento.activo" style="margin-bottom: 1rem; width: 30%;"
                    class="btn btn-success"
                    @click="finalizarMantenimiento(mantenimiento)"
                    title="Finalizar mantenimiento"
                  >
                    <i class="fa-solid fa-check"></i>
                  </button>
                  <button v-else style="margin-bottom: 1rem; width: 30%;"
                    class="btn btn-danger"
                    @click="deleteMantenimiento(mantenimiento)"
                    title="Eliminar"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
    
          <div class="pagination-wrapper">
            <div class="pagination-info" id="paginacion">
              Mostrando {{ paginatedMantenimientos.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
              {{ Math.min(currentPage * pageSize, filteredMantenimientos.length) }} de
              {{ filteredMantenimientos.length }} registros
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
              <h2>Detalles del Mantenimiento</h2>
            </div>
            <div class="modal-body-detalle">
              <div v-if="mantenimientoDetalle" class="detalle-content">
                <div class="detalle-row">
                  <strong>Equipo:</strong> 
                  <span>{{ mantenimientoDetalle.nombre_equipo }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Fecha de Inicio:</strong>
                  <span>{{ formatDate(mantenimientoDetalle.fecha_inicio) }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Fecha de Fin:</strong>
                  <span>{{ formatDate(mantenimientoDetalle.fecha_fin) }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Estado:</strong>
                  <span :class="'badge ' + getEstadoClass(mantenimientoDetalle.activo)">
                    {{ mantenimientoDetalle.activo ? 'Activo' : 'Finalizado' }}
                  </span>
                </div>
                <div class="detalle-descripcion">
                  <strong>Descripción:</strong>
                  <p>{{ mantenimientoDetalle.descripcion }}</p>
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
    
        <!-- Modal de confirmación para eliminar -->
        <div class="modal" v-if="showConfirmModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres eliminar este registro de mantenimiento?</p>
              <p>Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button class="btn btn-danger" @click="confirmDelete">
                  Sí, eliminar
                </button>
                <button class="btn btn-secondary" @click="cancelDelete">
                  No, regresar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal de confirmación para finalizar mantenimiento -->
        <div class="modal" v-if="showFinishModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Finalizar Mantenimiento</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres finalizar este mantenimiento?</p>
              <p>El equipo volverá a estar disponible para uso.</p>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button class="btn btn-success" @click="confirmFinalizarMantenimiento">
                  Sí, finalizar
                </button>
                <button class="btn btn-secondary" @click="cancelFinalizarMantenimiento">
                  No, regresar
                </button>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Modal de creación/edición -->
        <div v-if="isModalOpen" class="modal">
          <div class="modal-usuario">
            <div class="modal-header">
              <h2 class="h2-modal-content">
                {{ isEditing ? "Editar Mantenimiento" : "Registrar Mantenimiento" }}
              </h2>
            </div>
    
            <div class="modal-body">
              <div class="contenedor contenedor-izquierdo">
                <div class="form-group">
                  <label>Equipo:</label>
                  <select
                    ref="equipoInput"
                    v-model="mantenimientoForm.nombre_equipo"
                    required
                  >
                    <option value="">Seleccione un equipo</option>
                    <option v-for="equipo in equipos" :key="equipo.id" :value="equipo.nombre">
                      {{ equipo.nombre }}
                    </option>
                  </select>
                </div>
    
                <div class="form-group">
                  <label>Fecha de Inicio:</label>
                  <input 
                    type="date" 
                    v-model="mantenimientoForm.fecha_inicio_str" 
                    required
                  />
                </div>
    
                <div class="form-group">
                  <label>Fecha de Fin:</label>
                  <input 
                    type="date" 
                    v-model="mantenimientoForm.fecha_fin_str"
                  />
                </div>
              </div>
    
              <div class="contenedor contenedor-derecho">
                <div class="form-group">
                  <label>Descripción:</label>
                  <textarea id="desc"
                    v-model="mantenimientoForm.descripcion" 
                    rows="5" 
                    required 
                    placeholder="Describa el mantenimiento a realizar..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button 
                  class="btn btn-primary"
                  @click="guardarMantenimiento"
                >
                  {{ isEditing ? 'Guardar Cambios' : 'Registrar Mantenimiento' }}
                </button>
                <button 
                  class="btn btn-secondary"
                  @click="closeModal"
                >
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
import SidebarAdmin from './SidebarAdmin.vue';
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: "GestionMantenimiento",
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
      showConfirmModal: false,
      showFinishModal: false, // Modal para finalizar mantenimiento
      showDetailsModal: false,
      mantenimientoToDelete: null,
      mantenimientoToFinish: null, // Para finalizar mantenimiento
      mantenimientoDetalle: null,
      isLoading: false,
      searchQuery: "",
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      currentPage: 1,
      pageSize: 5,
      validationErrors: {},
      mantenimientoForm: {
        id_mantenimiento: 0,
        id_equipo: 0,
        nombre_equipo: "",
        fecha_inicio: null,
        fecha_inicio_str: "",
        fecha_fin: null,
        fecha_fin_str: "",
        descripcion: "",
        activo: true
      },
      mantenimientos: [],
      equipos: []
    };
  },
  computed: {
    filteredMantenimientos() {
      return this.mantenimientos.filter(
        (mantenimiento) => {
          const searchTermLower = this.searchQuery.toLowerCase();
          
          return (
            mantenimiento.nombre_equipo.toLowerCase().includes(searchTermLower) ||
            mantenimiento.descripcion.toLowerCase().includes(searchTermLower) ||
            this.formatDate(mantenimiento.fecha_inicio).includes(searchTermLower) ||
            (mantenimiento.fecha_fin && this.formatDate(mantenimiento.fecha_fin).includes(searchTermLower)) ||
            (mantenimiento.activo ? 'activo' : 'finalizado').includes(searchTermLower)
          );
        }
      );
    },
    paginatedMantenimientos() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredMantenimientos.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredMantenimientos.length / this.pageSize) || 1;
    },
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    async cargarDatos() {
      this.isLoading = true;
      try {
        // Cargar equipos
        const equiposResponse = await api.equipos.getAll();
        this.equipos = equiposResponse.data.map(equipo => ({
          id: equipo.id_equipo,
          nombre: equipo.nombre
        }));
        
        // Mapeo para facilitar lookups
        const equiposMap = {};
        this.equipos.forEach(equipo => {
          equiposMap[equipo.id] = equipo.nombre;
        });
        
        // Cargar mantenimientos
        const mantenimientosResponse = await api.mantenimientos.getAll();
        
        this.mantenimientos = mantenimientosResponse.data.map(mantenimiento => {
          return {
            id_mantenimiento: mantenimiento.id_mantenimiento,
            id_equipo: mantenimiento.id_equipo,
            nombre_equipo: equiposMap[mantenimiento.id_equipo] || 'Equipo desconocido',
            fecha_inicio: new Date(mantenimiento.fecha_inicio),
            fecha_fin: mantenimiento.fecha_fin ? new Date(mantenimiento.fecha_fin) : null,
            descripcion: mantenimiento.descripcion || '',
            activo: mantenimiento.activo
          };
        });
        
        if (this.mantenimientos.length > 0) {
          this.toast.success("Registros de mantenimiento cargados correctamente");
        } else {
          this.toast.info("No hay registros de mantenimiento");
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        this.toast.error("Error al cargar los datos");
      } finally {
        this.isLoading = false;
      }
    },
    
    formatDate(date) {
      if (!date) return 'Sin definir';
      
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    },
    
    getEstadoClass(activo) {
      return activo ? 'badge-success' : 'badge-secondary';
    },
    
    verDetalles(mantenimiento) {
      this.mantenimientoDetalle = {...mantenimiento};
      this.showDetailsModal = true;
    },
    
    cerrarDetalles() {
      this.showDetailsModal = false;
      this.mantenimientoDetalle = null;
    },
    
    openModal() {
      this.isModalOpen = true;
      this.validationErrors = {};
      this.$nextTick(() => {
        this.$refs.equipoInput?.focus();
      });
    },
    
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    
    clearForm() {
      this.mantenimientoForm = {
        id_mantenimiento: 0,
        id_equipo: 0,
        nombre_equipo: "",
        fecha_inicio: null,
        fecha_inicio_str: "",
        fecha_fin: null,
        fecha_fin_str: "",
        descripcion: "",
        activo: true
      };
      this.isEditing = false;
      this.editIndex = null;
      this.validationErrors = {};
    },
    
    validarFormulario() {
      let isValid = true;
      this.validationErrors = {};

      // Validar equipo
      if (!this.mantenimientoForm.nombre_equipo) {
        this.validationErrors.nombre_equipo = "Debe seleccionar un equipo";
        isValid = false;
      }
      
      // Validar fecha de inicio
      if (!this.mantenimientoForm.fecha_inicio_str) {
        this.validationErrors.fecha_inicio = "La fecha de inicio es obligatoria";
        isValid = false;
      }
      
      // Validar descripción
      if (!this.mantenimientoForm.descripcion.trim()) {
        this.validationErrors.descripcion = "La descripción es obligatoria";
        isValid = false;
      }
      
      // Si fecha fin está definida, validar que sea posterior a fecha inicio
      if (this.mantenimientoForm.fecha_fin_str && 
          this.mantenimientoForm.fecha_inicio_str && 
          new Date(this.mantenimientoForm.fecha_fin_str) < new Date(this.mantenimientoForm.fecha_inicio_str)) {
        this.validationErrors.fecha_fin = "La fecha de fin no puede ser anterior a la fecha de inicio";
        isValid = false;
      }

      return isValid;
    },
    
    // Método para finalizar mantenimiento en lugar de eliminar
    finalizarMantenimiento(mantenimiento) {
      this.mantenimientoToFinish = mantenimiento;
      this.showFinishModal = true;
    },
    
    async confirmFinalizarMantenimiento() {
      this.isLoading = true;
      
      try {
        // Usar el endpoint de delete que está configurado para finalizar el mantenimiento
        // y actualizar el inventario de equipos
        await api.mantenimientos.delete(this.mantenimientoToFinish.id_mantenimiento);
        
        this.toast.success("Mantenimiento finalizado correctamente");
        this.showFinishModal = false;
        this.mantenimientoToFinish = null;
        
        // Recargar datos
        await this.cargarDatos();
      } catch (error) {
        console.error("Error al finalizar mantenimiento:", error);
        const errorMessage = error.response?.data?.error || "Error al finalizar el mantenimiento";
        this.toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelFinalizarMantenimiento() {
      this.showFinishModal = false;
      this.mantenimientoToFinish = null;
    },
    
    // Obtener id del equipo por nombre
    getEquipoIdByNombre(nombre) {
      const equipo = this.equipos.find(e => e.nombre === nombre);
      return equipo ? equipo.id : null;
    },
    
    async guardarMantenimiento() {
      if (!this.validarFormulario()) {
        const primerError = Object.values(this.validationErrors)[0];
        this.toast.error(primerError);
        return;
      }
      
      // Obtener ID del equipo
      const id_equipo = this.getEquipoIdByNombre(this.mantenimientoForm.nombre_equipo);
      if (!id_equipo) {
        this.toast.error("Error al identificar el equipo seleccionado");
        return;
      }
      
      const datosMantenimiento = {
        id_equipo: id_equipo,
        fecha_fin: this.mantenimientoForm.fecha_fin_str || null,
        descripcion: this.mantenimientoForm.descripcion,
        activo: true // Siempre activo por defecto
      };
      
      this.isLoading = true;
      
      try {
        if (this.isEditing) {
          await api.mantenimientos.update(
            this.mantenimientoForm.id_mantenimiento, 
            datosMantenimiento
          );
          
          this.toast.success("Registro de mantenimiento actualizado correctamente");
        } else {
          await api.mantenimientos.create(datosMantenimiento);
          
          this.toast.success("Registro de mantenimiento creado correctamente");
        }
        
        await this.cargarDatos();
        this.closeModal();
      } catch (error) {
        console.error("Error al guardar mantenimiento:", error);
        const errorMessage = error.response?.data?.error || "Error al guardar el registro";
        this.toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
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
    },
    
    deleteMantenimiento(mantenimiento) {
      this.mantenimientoToDelete = mantenimiento;
      this.showConfirmModal = true;
    },
    
    async confirmDelete() {
      this.isLoading = true;
      
      try {
        await api.mantenimientos.delete(this.mantenimientoToDelete.id_mantenimiento);
        
        this.toast.success("Registro de mantenimiento eliminado correctamente");
        this.showConfirmModal = false;
        this.mantenimientoToDelete = null;
        
        // Recargar datos
        await this.cargarDatos();
      } catch (error) {
        console.error("Error al eliminar mantenimiento:", error);
        const errorMessage = error.response?.data?.error || "Error al eliminar el registro de mantenimiento";
        this.toast.error(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelDelete() {
      this.showConfirmModal = false;
      this.mantenimientoToDelete = null;
    },
    
    editMantenimiento(mantenimiento) {
      // Formato de fechas para el input type="date"
      const formatDateForInput = (date) => {
        if (!date) return '';
        if (typeof date === 'string') {
          date = new Date(date);
        }
        return date.toISOString().split('T')[0];
      };
      
      // Clonar el mantenimiento
      this.mantenimientoForm = { 
        ...mantenimiento,
        fecha_inicio_str: formatDateForInput(mantenimiento.fecha_inicio),
        fecha_fin_str: formatDateForInput(mantenimiento.fecha_fin)
      };
      
      this.isEditing = true;
      this.openModal();
    }
  },
  mounted() {
    // Cargar datos del backend
    this.cargarDatos();
  }
};
</script>

<style src="@/assets/css/Crearmantenimiento.css" scoped></style>