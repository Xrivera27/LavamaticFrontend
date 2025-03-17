<template>
  <div class="admin-layout" id="gesteq">
    <SidebarAdmin @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="inventario-wrapper">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
        
        <div class="header-section">
          <h1 class="page-title">Gestión de Inventario de Equipos</h1>
        </div>
    
        <div class="opciones">
          <button
            id="btnAdd"
            class="btn btn-primary"
            @click="openModal"
            style="width: 200px; white-space: nowrap"
          >
            Agregar Equipo
          </button>
    
          <div class="search-bar">
            <input
              class="busqueda"
              type="text"
              v-model="searchQuery"
              placeholder="Buscar equipo..."
            />
          </div>
        </div>
    
        <div class="table-container">
          <div v-if="isLoading" class="loading-indicator">
            Cargando equipos...
          </div>
    
          <div v-else-if="paginatedEquipos.length === 0" class="no-data">
            No se encontraron equipos para mostrar.
          </div>
    
          <table v-else class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Cantidad Total</th>
                <th>En Mantenimiento</th>
                <th>Disponibles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(equipo, index) in paginatedEquipos" :key="index">
                <td data-label="#">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </td>
                <td data-label="Nombre">{{ equipo.nombre }}</td>
                <td data-label="Cantidad Total">{{ equipo.cantidad_total }}</td>
                <td data-label="En Mantenimiento">{{ equipo.cantidad_mantenimiento }}</td>
                <td data-label="Disponibles">
                  {{ equipo.cantidad_total }}
                </td>
                <td data-label="Acciones">
                  <button style="margin-bottom: 1rem; width: 30%;"
                    class="btn btn-info"
                    @click="verDetalles(equipo)"
                    title="Ver detalles"
                  >
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button style="margin-bottom: 1rem; width: 30%;"
                    class="btn btn-warning"
                    @click="editEquipo(equipo)"
                    title="Editar"
                  >
                    <i class="fa-solid fa-pencil" style="color: white;"></i>
                  </button>
                  <button style="width: 30%;"
                    class="btn btn-danger"
                    @click="deleteEquipo(equipo)"
                    title="Eliminar"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
    
          <div class="pagination-wrapper" v-if="totalPages > 0">
  <div class="pagination-info">
    Mostrando {{ paginatedEquipos.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
    {{ Math.min(currentPage * pageSize, filteredEquipos.length) }} de
    {{ filteredEquipos.length }} registros
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
              <h2>Detalles del Equipo</h2>
            </div>
            <div class="modal-body-detalle">
              <div v-if="equipoDetalle" class="detalle-content" id="detalleview">
                <div class="detalle-row">
                  <strong>Nombre:</strong> 
                  <span>{{ equipoDetalle.nombre }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Cantidad Total:</strong>
                  <span>{{ equipoDetalle.cantidad_total }}</span>
                </div>
                <div class="detalle-row">
                  <strong>En Mantenimiento:</strong>
                  <span>{{ equipoDetalle.cantidad_mantenimiento }}</span>
                </div>
                <div class="detalle-row">
                  <strong>Disponibles:</strong>
                  <span>{{ equipoDetalle.cantidad_total }}</span>
                </div>
                <div class="detalle-descripcion">
                  <strong>Descripción:</strong>
                  <p>{{ equipoDetalle.descripcion }}</p>
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
    
        <!-- Modal de confirmación para eliminar -->
        <div class="modal" v-if="showConfirmModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Cuántos equipos deseas eliminar?</p>
              <p>Actualmente hay <strong>{{ equipoToDelete ? equipoToDelete.cantidad_total : 0 }}</strong> unidades disponibles.</p>
              
              <div class="form-group" style="margin-top: 20px;">
                <label>Cantidad a eliminar:</label>
                <input 
  type="number" 
  v-model.number="cantidadEliminar"
  min="1"
  :max="equipoToDelete ? equipoToDelete.cantidad_total : 0"
  required
  placeholder="Ingrese la cantidad"
  class="input-cantidad"
  @input="validarCantidadEliminar"
/>
                <p v-if="errorCantidad" class="error-message" style="color: red; margin-top: 5px;">
                  {{ errorCantidad }}
                </p>
              </div>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button class="btn btn-danger" @click="confirmDelete" :disabled="!cantidadValidaParaEliminar">
                  Eliminar cantidad específica
                </button>
                <button class="btn btn-danger" @click="deleteAll" style="margin-left: 5px;">
                  Eliminar todas las unidades
                </button>
                <button class="btn btn-secondary" @click="cancelDelete" style="margin-left: 5px;">
                  Cancelar
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
                {{ isEditing ? "Editar Equipo" : "Agregar Equipo" }}
              </h2>
            </div>
    
            <div class="modal-body">
              <div class="contenedor contenedor-izquierdo">
                <div class="form-group">
                  <label>Nombre:</label>
                  <input
                    ref="nombreInput"
                    v-model="equipoForm.nombre"
                    type="text"
                    required
                    placeholder="Nombre del equipo"
                  />
                </div>
    
                <div class="form-group">
                  <label>Cantidad Total:</label>
                  <input 
                    type="number" 
                    v-model.number="equipoForm.cantidad_total" 
                    min="0"
                    required
                    placeholder="Cantidad total de unidades" 
                  />
                </div>
              </div>
    
              <div class="contenedor contenedor-derecho">

                <div class="form-group">
                  <label>Descripción:</label>
                  <textarea 
                    v-model="equipoForm.descripcion" 
                    rows="5" 
                    placeholder="Descripción detallada del equipo..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button 
                  class="btn btn-primary"
                  @click="guardarEquipo"
                >
                  {{ isEditing ? 'Guardar Cambios' : 'Agregar Equipo' }}
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
  name: "gestionInventario",
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
      showDetailsModal: false,
      equipoToDelete: null,
      equipoDetalle: null,
      isLoading: false,
      searchQuery: "",
      isModalOpen: false,
      isEditing: false,
      editIndex: null,
      currentPage: 1,
      pageSize: 4, // Cambiado a 4 como solicitado
      validationErrors: {},
      cantidadEliminar: 1,
      errorCantidad: "",
      equipoForm: {
        id_equipo: 0,
        nombre: "",
        descripcion: "",
        cantidad_total: 0,
        cantidad_mantenimiento: 0
      },
      equipos: []
    };
  },
  computed: {
    filteredEquipos() {
      return this.equipos.filter(
        (equipo) => {
          const searchTermLower = this.searchQuery.toLowerCase();
          
          return (
            equipo.nombre.toLowerCase().includes(searchTermLower) ||
            (equipo.descripcion && equipo.descripcion.toLowerCase().includes(searchTermLower)) ||
            equipo.cantidad_total.toString().includes(searchTermLower) ||
            equipo.cantidad_mantenimiento.toString().includes(searchTermLower)
          );
        }
      );
    },
    paginatedEquipos() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredEquipos.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredEquipos.length / this.pageSize) || 1;
    },
    cantidadValidaParaEliminar() {
      return this.cantidadEliminar > 0 && 
             this.equipoToDelete && 
             this.cantidadEliminar <= this.equipoToDelete.cantidad_total;
    }
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    // Cargar equipos desde el backend
    async cargarEquipos() {
      this.isLoading = true;
      try {
        const response = await api.equipos.getAll();
        console.log("Datos de equipos recibidos:", response.data);
        
        // Procesar los datos del servidor
        this.equipos = response.data.map(equipo => {
          return {
            id_equipo: equipo.id_equipo,
            nombre: equipo.nombre || '',
            descripcion: equipo.descripcion || '',
            cantidad_total: equipo.cantidad_total || 0,
            cantidad_mantenimiento: equipo.cantidad_mantenimiento || 0
          };
        });
        
        if (this.equipos.length > 0) {
          this.toast.success("Equipos cargados correctamente");
        } else {
          this.toast.info("No hay equipos registrados");
        }
      } catch (error) {
        console.error("Error al cargar equipos:", error);
        this.toast.error("Error al cargar equipos");
      } finally {
        this.isLoading = false;
      }
    },

    validarCantidadEliminar() {
  // Asegurarse que sea un número
  this.cantidadEliminar = Number(this.cantidadEliminar);
  
  // Validar que no sea menor o igual a cero
  if (this.cantidadEliminar <= 0) {
    this.errorCantidad = "La cantidad debe ser mayor a 0";
    return;
  }
  
  // Validar que no exceda la cantidad disponible
  if (this.cantidadEliminar > this.equipoToDelete.cantidad_total) {
    this.errorCantidad = `No puede eliminar más de ${this.equipoToDelete.cantidad_total} unidades disponibles`;
    return;
  }
  
  // Si todo está bien, limpiar el mensaje de error
  this.errorCantidad = "";
},
    
    verDetalles(equipo) {
      this.equipoDetalle = {...equipo};
      this.showDetailsModal = true;
    },
    
    cerrarDetalles() {
      this.showDetailsModal = false;
      this.equipoDetalle = null;
    },
    
    openModal() {
      this.isModalOpen = true;
      this.validationErrors = {};
      this.$nextTick(() => {
        this.$refs.nombreInput?.focus();
      });
    },
    
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    
    clearForm() {
      this.equipoForm = {
        id_equipo: 0,
        nombre: "",
        descripcion: "",
        cantidad_total: 0,
        cantidad_mantenimiento: 0
      };
      this.isEditing = false;
      this.editIndex = null;
      this.validationErrors = {};
    },
    
    validarFormulario() {
      let isValid = true;
      this.validationErrors = {};

      // Validar nombre
      if (!this.equipoForm.nombre.trim()) {
        this.validationErrors.nombre = "El nombre es obligatorio";
        isValid = false;
      }
      
      // Validar cantidades
      if (this.equipoForm.cantidad_total < 0) {
        this.validationErrors.cantidad_total = "La cantidad total no puede ser negativa";
        isValid = false;
      }
      
      if (this.equipoForm.cantidad_mantenimiento < 0) {
        this.validationErrors.cantidad_mantenimiento = "La cantidad en mantenimiento no puede ser negativa";
        isValid = false;
      }
      
      // Validar que las cantidades sean coherentes
      if (this.equipoForm.cantidad_mantenimiento > this.equipoForm.cantidad_total) {
        this.validationErrors.cantidad_mantenimiento = "La cantidad en mantenimiento no puede superar la cantidad total";
        isValid = false;
      }

      return isValid;
    },
    
    async guardarEquipo() {
      // Validar formulario
      if (!this.validarFormulario()) {
        // Mostrar primer error como toast
        const primerError = Object.values(this.validationErrors)[0];
        this.toast.error(primerError);
        return;
      }
      
      this.isLoading = true;
      
      try {
        // Preparar los datos a enviar
        const datosEquipo = {
          nombre: this.equipoForm.nombre,
          descripcion: this.equipoForm.descripcion,
          cantidad_total: this.equipoForm.cantidad_total,
          cantidad_mantenimiento: this.equipoForm.cantidad_mantenimiento
        };
        
        if (this.isEditing) {
          // Actualizar equipo existente
          await api.equipos.update(this.equipoForm.id_equipo, datosEquipo);
          this.toast.success("Equipo actualizado correctamente");
        } else {
          // Crear nuevo equipo
          await api.equipos.create(datosEquipo);
          this.toast.success("Equipo agregado correctamente");
        }
        
        // Recargar la lista de equipos
        await this.cargarEquipos();
        
        // Cerrar el modal
        this.closeModal();
      } catch (error) {
        console.error("Error al guardar equipo:", error);
        let errorMsg = "Error al guardar equipo";
        
        if (error.response && error.response.data && error.response.data.error) {
          errorMsg = error.response.data.error;
        }
        
        this.toast.error(errorMsg);
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
    
    deleteEquipo(equipo) {
      this.equipoToDelete = equipo;
      this.cantidadEliminar = 1; // Reiniciar la cantidad a 1 por defecto
      this.errorCantidad = ""; // Limpiar cualquier error previo
      this.showConfirmModal = true;
    },
    
    async confirmDelete() {
  // Validar nuevamente la cantidad al intentar eliminar
  if (this.cantidadEliminar > this.equipoToDelete.cantidad_total) {
    this.errorCantidad = `No puede eliminar más de ${this.equipoToDelete.cantidad_total} unidades disponibles`;
    this.toast.error(`No se puede eliminar ${this.cantidadEliminar} unidades. Solo hay ${this.equipoToDelete.cantidad_total} disponibles.`);
    return;
  }
  
  // Validación general
  if (!this.cantidadValidaParaEliminar) {
    this.errorCantidad = "Por favor ingrese una cantidad válida";
    this.toast.error("La cantidad ingresada no es válida");
    return;
  }
  
  this.isLoading = true;
  
  try {
    // Enviar la cantidad como parámetro de consulta
    await api.equipos.delete(this.equipoToDelete.id_equipo, {
      cantidad: this.cantidadEliminar
    });
    
    // Actualizar la interfaz de usuario después de la eliminación
    const index = this.equipos.findIndex(e => e.id_equipo === this.equipoToDelete.id_equipo);
    if (index !== -1) {
      // Si eliminamos todos los equipos
      if (this.cantidadEliminar >= this.equipoToDelete.cantidad_total) {
        this.equipos.splice(index, 1);
        this.toast.success("Equipo eliminado completamente");
      } else {
        // Actualizar el conteo total
        this.equipos[index].cantidad_total -= this.cantidadEliminar;
        this.toast.success(`Se eliminaron ${this.cantidadEliminar} unidades del equipo`);
      }
    }
    
    this.showConfirmModal = false;
    this.equipoToDelete = null;
  } catch (error) {
    console.error("Error al eliminar equipo:", error);
    let errorMsg = "Error al eliminar equipo";
    
    if (error.response && error.response.data && error.response.data.error) {
      errorMsg = error.response.data.error;
    }
    
    this.toast.error(errorMsg);
  } finally {
    this.isLoading = false;
  }
},
    
    // Método para eliminar todas las unidades de un equipo
    async deleteAll() {
      this.isLoading = true;
      
      try {
        // Establecer la cantidad a eliminar al total disponible
        const cantidadTotal = this.equipoToDelete.cantidad_total;
        
        // Realizar la llamada a la API para eliminar todas las unidades
        await api.equipos.delete(this.equipoToDelete.id_equipo, {
          cantidad: cantidadTotal
        });
        
        // Actualizar la interfaz de usuario (eliminar el equipo de la lista)
        const index = this.equipos.findIndex(e => e.id_equipo === this.equipoToDelete.id_equipo);
        if (index !== -1) {
          this.equipos.splice(index, 1);
        }
        
        this.toast.success("Se han eliminado todas las unidades del equipo");
        this.showConfirmModal = false;
        this.equipoToDelete = null;
        
      } catch (error) {
        console.error("Error al eliminar equipo:", error);
        let errorMsg = "Error al eliminar equipo";
        
        if (error.response && error.response.data && error.response.data.error) {
          errorMsg = error.response.data.error;
        }
        
        this.toast.error(errorMsg);
      } finally {
        this.isLoading = false;
      }
    },
    
    cancelDelete() {
      this.showConfirmModal = false;
      this.equipoToDelete = null;
      this.cantidadEliminar = 1;
      this.errorCantidad = "";
    },
    
    editEquipo(equipo) {
      // Clonar el equipo
      this.equipoForm = { ...equipo };
      
      this.isEditing = true;
      this.openModal();
    }
  },
  
  mounted() {
    // Cargar datos de equipos al montar el componente
    this.cargarEquipos();
  }
};
</script>
  
  <style src="@/assets/css/Crearinventario.css" scoped></style>