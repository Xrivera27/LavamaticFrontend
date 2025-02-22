<template>
    <div class="admin-layout">
      <SidebarAdmin @sidebar-toggle="handleSidebarToggle" />
      <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
        <div class="servicios-wrapper">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
          
          <div class="header-section">
            <h1 class="page-title">Gestión de Servicios</h1>
          </div>
      
          <div class="opciones">
            <button
              id="btnAdd"
              class="btn btn-primary"
              @click="openModal"
              style="width: 200px; white-space: nowrap"
            >
              Agregar Servicio
            </button>
      
            <div class="search-bar">
              <input
                class="busqueda"
                type="text"
                v-model="searchQuery"
                placeholder="Buscar servicio..."
              />
            </div>
          </div>
      
          <div class="table-container">
            <div v-if="isLoading" class="loading-indicator">
              Cargando servicios...
            </div>
      
            <div v-else-if="paginatedServicios.length === 0" class="no-data">
              No se encontraron servicios para mostrar.
            </div>
      
            <table v-else class="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Tiempo Estimado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(servicio, index) in paginatedServicios" :key="index">
                  <td data-label="#">
                    {{ (currentPage - 1) * pageSize + index + 1 }}
                  </td>
                  <td data-label="Nombre">{{ servicio.nombre }}</td>
                  <td data-label="Categoría">{{ servicio.categoria }}</td>
                  <td data-label="Precio">${{ servicio.precio.toFixed(2) }}</td>
                  <td data-label="Tiempo Estimado">{{ servicio.tiempo_estimado }} minutos</td>
                  <td data-label="Acciones">
                    <button
                      class="btn btn-info"
                      @click="verDetalles(servicio)"
                      title="Ver detalles"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    <button
                      class="btn btn-warning"
                      @click="editServicio(servicio)"
                      title="Editar"
                    >
                      <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      @click="deleteServicio(servicio)"
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
                Mostrando {{ paginatedServicios.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
                {{ Math.min(currentPage * pageSize, filteredServicios.length) }} de
                {{ filteredServicios.length }} registros
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
                <h2>Detalles del Servicio</h2>
              </div>
              <div class="modal-body-detalle">
                <div v-if="servicioDetalle" class="detalle-content">
                  <div class="detalle-row">
                    <strong>Nombre:</strong> 
                    <span>{{ servicioDetalle.nombre }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Categoría:</strong>
                    <span>{{ servicioDetalle.categoria }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Precio:</strong>
                    <span>${{ servicioDetalle.precio.toFixed(2) }}</span>
                  </div>
                  <div class="detalle-row">
                    <strong>Tiempo Estimado:</strong>
                    <span>{{ servicioDetalle.tiempo_estimado }} minutos</span>
                  </div>
                  <div class="detalle-descripcion">
                    <strong>Descripción:</strong>
                    <p>{{ servicioDetalle.descripcion }}</p>
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
                <p>¿Estás seguro de que quieres eliminar este servicio?</p>
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
                  {{ isEditing ? "Editar Servicio" : "Agregar Servicio" }}
                </h2>
              </div>
      
              <div class="modal-body">
                <div class="contenedor contenedor-izquierdo">
                  <div class="form-group">
                    <label>Nombre:</label>
                    <input
                      ref="nombreInput"
                      v-model="servicioForm.nombre"
                      type="text"
                      required
                      placeholder="Nombre del servicio"
                    />
                  </div>
      
                  <div class="form-group">
                    <label>Categoría:</label>
                    <select v-model="servicioForm.categoria" required>
                      <option value="">Seleccione una categoría</option>
                      <option value="Lavado">Lavado</option>
                      <option value="Secado">Secado</option>
                      <option value="Planchado">Planchado</option>
                      <option value="Limpieza en seco">Limpieza en seco</option>
                      <option value="Teñido">Teñido</option>
                      <option value="Express">Express</option>
                    </select>
                  </div>
                </div>
      
                <div class="contenedor contenedor-derecho">
                  <div class="form-group">
                    <label>Precio ($):</label>
                    <input 
                      type="number" 
                      v-model.number="servicioForm.precio" 
                      min="0"
                      step="0.01"
                      required
                      placeholder="Precio del servicio" 
                    />
                  </div>
  
                  <div class="form-group">
                    <label>Tiempo Estimado (minutos):</label>
                    <input 
                      type="number" 
                      v-model.number="servicioForm.tiempo_estimado" 
                      min="1"
                      required
                      placeholder="Tiempo estimado en minutos" 
                    />
                  </div>
  
                  <div class="form-group">
                    <label>Descripción:</label>
                    <textarea 
                      v-model="servicioForm.descripcion" 
                      rows="5" 
                      placeholder="Descripción detallada del servicio..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <div class="action-buttons">
                  <button 
                    class="btn btn-primary"
                    @click="guardarServicio"
                  >
                    {{ isEditing ? 'Guardar Cambios' : 'Agregar Servicio' }}
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
    name: "gestionServicios",
    components: {
      SidebarAdmin
    },
    data() {
      return {
        isSidebarExpanded: false,
        showConfirmModal: false,
        showDetailsModal: false,
        servicioToDelete: null,
        servicioDetalle: null,
        isLoading: false,
        searchQuery: "",
        isModalOpen: false,
        isEditing: false,
        editIndex: null,
        currentPage: 1,
        pageSize: 10,
        validationErrors: {},
        servicioForm: {
          id_servicio: 0,
          nombre: "",
          descripcion: "",
          precio: 0,
          tiempo_estimado: 0,
          categoria: ""
        },
        servicios: [
          {
            id_servicio: 1,
            nombre: "Lavado Estándar",
            descripcion: "Servicio de lavado regular para prendas sin requerimientos especiales. Incluye detergente, suavizante y secado básico.",
            precio: 7.99,
            tiempo_estimado: 120,
            categoria: "Lavado"
          },
          {
            id_servicio: 2,
            nombre: "Lavado Express",
            descripcion: "Servicio rápido de lavado para clientes con prisa. Entrega en la mitad del tiempo del lavado estándar. Incluye secado completo.",
            precio: 12.99,
            tiempo_estimado: 60,
            categoria: "Express"
          },
          {
            id_servicio: 3,
            nombre: "Lavado y Planchado",
            descripcion: "Servicio completo que incluye lavado, secado y planchado de prendas. Recomendado para camisas, blusas y prendas formales.",
            precio: 15.99,
            tiempo_estimado: 180,
            categoria: "Planchado"
          },
          {
            id_servicio: 4,
            nombre: "Limpieza en Seco",
            descripcion: "Servicio especializado para prendas delicadas que no se pueden lavar con agua. Ideal para trajes, vestidos de fiesta y prendas con etiqueta de 'solo limpieza en seco'.",
            precio: 19.99,
            tiempo_estimado: 240,
            categoria: "Limpieza en seco"
          },
          {
            id_servicio: 5,
            nombre: "Teñido de Prendas",
            descripcion: "Servicio profesional para cambiar el color de prendas. Incluye evaluación previa de la tela para garantizar resultados óptimos.",
            precio: 24.99,
            tiempo_estimado: 300,
            categoria: "Teñido"
          }
        ]
      };
    },
    computed: {
      filteredServicios() {
        return this.servicios.filter(
          (servicio) => {
            const searchTermLower = this.searchQuery.toLowerCase();
            
            return (
              servicio.nombre.toLowerCase().includes(searchTermLower) ||
              servicio.descripcion.toLowerCase().includes(searchTermLower) ||
              servicio.categoria.toLowerCase().includes(searchTermLower) ||
              servicio.precio.toString().includes(searchTermLower) ||
              servicio.tiempo_estimado.toString().includes(searchTermLower)
            );
          }
        );
      },
      paginatedServicios() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.filteredServicios.slice(startIndex, endIndex);
      },
      totalPages() {
        return Math.ceil(this.filteredServicios.length / this.pageSize) || 1;
      },
    },
    methods: {
      handleSidebarToggle(expanded) {
        this.isSidebarExpanded = expanded;
      },
      verDetalles(servicio) {
        this.servicioDetalle = {...servicio};
        this.showDetailsModal = true;
      },
      cerrarDetalles() {
        this.showDetailsModal = false;
        this.servicioDetalle = null;
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
        this.servicioForm = {
          id_servicio: 0,
          nombre: "",
          descripcion: "",
          precio: 0,
          tiempo_estimado: 0,
          categoria: ""
        };
        this.isEditing = false;
        this.editIndex = null;
        this.validationErrors = {};
      },
      validarFormulario() {
        let isValid = true;
        this.validationErrors = {};
  
        // Validar nombre
        if (!this.servicioForm.nombre.trim()) {
          this.validationErrors.nombre = "El nombre es obligatorio";
          isValid = false;
        }
        
        // Validar categoría
        if (!this.servicioForm.categoria) {
          this.validationErrors.categoria = "Debe seleccionar una categoría";
          isValid = false;
        }
        
        // Validar precio
        if (this.servicioForm.precio <= 0) {
          this.validationErrors.precio = "El precio debe ser mayor que cero";
          isValid = false;
        }
        
        // Validar tiempo estimado
        if (this.servicioForm.tiempo_estimado <= 0) {
          this.validationErrors.tiempo_estimado = "El tiempo estimado debe ser mayor que cero";
          isValid = false;
        }
  
        return isValid;
      },
      guardarServicio() {
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
            // Actualizar servicio existente
            const index = this.servicios.findIndex(s => s.id_servicio === this.servicioForm.id_servicio);
            if (index !== -1) {
              this.servicios.splice(index, 1, { ...this.servicioForm });
            }
            alert("Servicio actualizado correctamente");
          } else {
            // Crear nuevo servicio
            const newId = Math.max(...this.servicios.map(s => s.id_servicio), 0) + 1;
            const nuevoServicio = { 
              ...this.servicioForm,
              id_servicio: newId
            };
            
            this.servicios.push(nuevoServicio);
            alert("Servicio agregado correctamente");
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
      deleteServicio(servicio) {
        this.servicioToDelete = servicio;
        this.showConfirmModal = true;
      },
      confirmDelete() {
        this.isLoading = true;
        
        setTimeout(() => {
          const index = this.servicios.findIndex(s => s.id_servicio === this.servicioToDelete.id_servicio);
          if (index !== -1) {
            this.servicios.splice(index, 1);
          }
          
          alert("Servicio eliminado correctamente");
          
          this.isLoading = false;
          this.showConfirmModal = false;
          this.servicioToDelete = null;
        }, 1000);
      },
      cancelDelete() {
        this.showConfirmModal = false;
        this.servicioToDelete = null;
      },
      editServicio(servicio) {
        // Clonar el servicio
        this.servicioForm = { ...servicio };
        
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
  
  <style src="@/assets/css/Crearservicios.css" scoped></style>