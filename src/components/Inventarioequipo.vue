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
    
          <div class="pagination-wrapper">
            <div class="pagination-info">
              Mostrando {{ paginatedEquipos.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
              {{ Math.min(currentPage * pageSize, filteredEquipos.length) }} de
              {{ filteredEquipos.length }} registros
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
              <p>¿Estás seguro de que quieres eliminar este equipo?</p>
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
                  <label>Cantidad en Mantenimiento:</label>
                  <input 
                    type="number" 
                    v-model.number="equipoForm.cantidad_mantenimiento" 
                    min="0"
                    required
                    placeholder="Unidades en mantenimiento"
                    :max="equipoForm.cantidad_total" 
                  />
                </div>

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
        this.showConfirmModal = true;
      },
      
      async confirmDelete() {
        this.isLoading = true;
        
        try {
          await api.equipos.delete(this.equipoToDelete.id_equipo);
          this.toast.success("Equipo eliminado correctamente");
          
          // Eliminar de la lista local
          const index = this.equipos.findIndex(e => e.id_equipo === this.equipoToDelete.id_equipo);
          if (index !== -1) {
            this.equipos.splice(index, 1);
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
      
      cancelDelete() {
        this.showConfirmModal = false;
        this.equipoToDelete = null;
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