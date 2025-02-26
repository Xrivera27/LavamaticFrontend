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
                  <td  data-label="En Mantenimiento">{{ equipo.cantidad_mantenimiento }}</td>
                  <td data-label="Disponibles">
                    {{ equipo.cantidad_total - equipo.cantidad_mantenimiento }}
                  </td>
                  <td data-label="Acciones">
                    <button  style="margin-bottom: 1rem; width: 30%;"
                      class="btn btn-info"
                      @click="verDetalles(equipo)"
                      title="Ver detalles"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    <button  style="margin-bottom: 1rem; width: 30%;"
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
                <button  style="margin-bottom: 1rem;"
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
                    <span>{{ equipoDetalle.cantidad_total - equipoDetalle.cantidad_mantenimiento }}</span>
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
  
  export default {
    name: "gestionInventario",
    components: {
      SidebarAdmin
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
        pageSize: 10,
        validationErrors: {},
        equipoForm: {
          id_equipo: 0,
          nombre: "",
          descripcion: "",
          cantidad_total: 0,
          cantidad_mantenimiento: 0
        },
        equipos: [
          {
            id_equipo: 1,
            nombre: "Lavadora Industrial LG-450",
            descripcion: "Lavadora industrial de alta capacidad para cargas grandes. Incluye sistema de dosificación automática y ciclos programables. Ideal para procesar grandes volúmenes de ropa.",
            cantidad_total: 5,
            cantidad_mantenimiento: 1
          },
          {
            id_equipo: 2,
            nombre: "Secadora Industrial Whirlpool X-500",
            descripcion: "Secadora industrial de alta eficiencia energética. Capacidad para grandes cargas y sistema de sensor de humedad para prevenir sobresecado.",
            cantidad_total: 4,
            cantidad_mantenimiento: 1
          },
          {
            id_equipo: 3,
            nombre: "Lavadora Industrial Samsung Heavy Duty",
            descripcion: "Lavadora industrial resistente diseñada para uso intensivo. Sistema anti-vibración y programas específicos para diferentes tipos de telas y niveles de suciedad.",
            cantidad_total: 3,
            cantidad_mantenimiento: 0
          },
          {
            id_equipo: 4,
            nombre: "Sistema de Planchado Industrial",
            descripcion: "Sistema completo de planchado industrial con rodillo caliente. Alta eficiencia para planchado de sábanas, manteles y prendas grandes.",
            cantidad_total: 2,
            cantidad_mantenimiento: 1
          },
          {
            id_equipo: 5,
            nombre: "Dobladora Automática Siemens",
            descripcion: "Dobladora automática para prendas. Permite doblar diferentes tipos de prendas con alta precisión y velocidad.",
            cantidad_total: 1,
            cantidad_mantenimiento: 0
          }
        ]
      };
    },
    computed: {
      filteredEquipos() {
        return this.equipos.filter(
          (equipo) => {
            const searchTermLower = this.searchQuery.toLowerCase();
            
            return (
              equipo.nombre.toLowerCase().includes(searchTermLower) ||
              equipo.descripcion.toLowerCase().includes(searchTermLower) ||
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
      guardarEquipo() {
        // Validar formulario
        if (!this.validarFormulario()) {
          // Mostrar primer error
          const primerError = Object.values(this.validationErrors)[0];
          alert(primerError);
          return;
        }
        
        // Simulación de guardado
        this.isLoading = true;
        
        setTimeout(() => {
          if (this.isEditing) {
            // Actualizar equipo existente
            const index = this.equipos.findIndex(e => e.id_equipo === this.equipoForm.id_equipo);
            if (index !== -1) {
              this.equipos.splice(index, 1, { ...this.equipoForm });
            }
            alert("Equipo actualizado correctamente");
          } else {
            // Crear nuevo equipo
            const newId = Math.max(...this.equipos.map(e => e.id_equipo), 0) + 1;
            const nuevoEquipo = { 
              ...this.equipoForm,
              id_equipo: newId
            };
            
            this.equipos.push(nuevoEquipo);
            alert("Equipo agregado correctamente");
          }
          
          this.isLoading = false;
          this.closeModal();
        }, 1000);
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
      confirmDelete() {
        this.isLoading = true;
        
        setTimeout(() => {
          const index = this.equipos.findIndex(e => e.id_equipo === this.equipoToDelete.id_equipo);
          if (index !== -1) {
            this.equipos.splice(index, 1);
          }
          
          alert("Equipo eliminado correctamente");
          
          this.isLoading = false;
          this.showConfirmModal = false;
          this.equipoToDelete = null;
        }, 1000);
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
      // Simulación de carga de datos
      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  };
  </script>
  
  <style src="@/assets/css/Crearinventario.css" scoped></style>