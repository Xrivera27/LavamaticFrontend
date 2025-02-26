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
                <tr v-for="(mantenimiento, index) in paginatedMantenimientos" :key="index">
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
                    <button style="margin-bottom: 1rem; width: 30%;"
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
                      <option v-for="equipo in equipos" :key="equipo">
                        {{ equipo }}
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
                  
                  <div class="form-group">
                    <br>
                    <label>Estado:</label>
                    <select v-model="mantenimientoForm.activo" required>
                      <option :value="true">Activo</option>
                      <option :value="false">Finalizado</option>
                    </select>
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
  
  export default {
    name: "gestionMantenimiento",
    components: {
      SidebarAdmin
    },
    data() {
      return {
        isSidebarExpanded: false,
        showConfirmModal: false,
        showDetailsModal: false,
        mantenimientoToDelete: null,
        mantenimientoDetalle: null,
        isLoading: false,
        searchQuery: "",
        isModalOpen: false,
        isEditing: false,
        editIndex: null,
        currentPage: 1,
        pageSize: 10,
        validationErrors: {},
        mantenimientoForm: {
          id_mantenimiento: 0,
          nombre_equipo: "",
          fecha_inicio: null,
          fecha_inicio_str: "",
          fecha_fin: null,
          fecha_fin_str: "",
          descripcion: "",
          activo: true
        },
        mantenimientos: [
          {
            id_mantenimiento: 1,
            nombre_equipo: "Lavadora Industrial LG-450",
            fecha_inicio: new Date('2023-08-15'),
            fecha_fin: new Date('2023-08-20'),
            descripcion: "Mantenimiento preventivo general, limpieza de filtros y revisión de motor. Se reemplazaron piezas desgastadas del sistema de bombeo y se realizó una calibración completa del sistema de dosificación de detergente. El equipo quedó operativo al 100% y se programó el próximo mantenimiento preventivo para dentro de 3 meses.",
            activo: false
          },
          {
            id_mantenimiento: 2,
            nombre_equipo: "Secadora Industrial Whirlpool X-500",
            fecha_inicio: new Date('2023-09-10'),
            fecha_fin: null,
            descripcion: "Revisión y cambio de filtros, limpieza de conductos de ventilación. Se detectó un problema con el sistema de calefacción que requiere repuestos especiales. Se ha solicitado la pieza al proveedor y se espera su llegada en 5 días hábiles. Mientras tanto, la secadora funciona a capacidad reducida.",
            activo: true
          },
          {
            id_mantenimiento: 3,
            nombre_equipo: "Lavadora Industrial Samsung Heavy Duty",
            fecha_inicio: new Date('2023-10-05'),
            fecha_fin: new Date('2023-10-07'),
            descripcion: "Reparación del sistema de dosificación de detergente, ajuste de bombas. Se encontró una fuga en la válvula principal que fue reparada. Además, se reajustaron todos los sellos de la máquina y se verificó el correcto funcionamiento de los sensores de nivel de agua. La máquina quedó funcionando correctamente.",
            activo: false
          },
          {
            id_mantenimiento: 4,
            nombre_equipo: "Sistema de Planchado Industrial",
            fecha_inicio: new Date('2023-11-12'),
            fecha_fin: null,
            descripcion: "Mantenimiento correctivo, reparación de sistema de vapor y termostato. El sistema presentaba problemas de regulación de temperatura y pérdida de presión. Se está trabajando en la limpieza del sistema de generación de vapor y el reemplazo de las válvulas de seguridad. Se espera finalizar en 3 días, previa prueba de presión y temperatura.",
            activo: true
          }
        ],
        equipos: [
          "Lavadora Industrial Samsung",
          "Lavadora Industrial Samsung Heavy Duty",
          "Lavadora Industrial LG-450",
          "Secadora Industrial Maytag",
          "Secadora Industrial Whirlpool X-500",
          "Dobladora Automática Siemens",
          "Sistema de Planchado Industrial",
          "Lavadora Industrial Speed Queen",
          "Secadora Industrial Speed Queen",
          "Máquina de Limpieza en Seco",
          "Caldera Industrial"
        ]
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
      guardarMantenimiento() {
        // Validar formulario
        if (!this.validarFormulario()) {
          // Mostrar primer error
          const primerError = Object.values(this.validationErrors)[0];
          alert(primerError);
          return;
        }
  
        // Convertir string de fechas a objetos Date
        const fechaInicio = new Date(this.mantenimientoForm.fecha_inicio_str);
        const fechaFin = this.mantenimientoForm.fecha_fin_str ? new Date(this.mantenimientoForm.fecha_fin_str) : null;
        
        // Simulación de guardado
        this.isLoading = true;
        
        setTimeout(() => {
          if (this.isEditing) {
            // Actualizar mantenimiento existente
            const index = this.mantenimientos.findIndex(m => m.id_mantenimiento === this.mantenimientoForm.id_mantenimiento);
            if (index !== -1) {
              this.mantenimientos.splice(index, 1, { 
                ...this.mantenimientoForm,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin 
              });
            }
            alert("Registro de mantenimiento actualizado correctamente");
          } else {
            // Crear nuevo mantenimiento
            const newId = Math.max(...this.mantenimientos.map(m => m.id_mantenimiento), 0) + 1;
            const nuevoMantenimiento = { 
              ...this.mantenimientoForm,
              id_mantenimiento: newId,
              fecha_inicio: fechaInicio,
              fecha_fin: fechaFin
            };
            
            this.mantenimientos.push(nuevoMantenimiento);
            alert("Registro de mantenimiento creado correctamente");
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
      deleteMantenimiento(mantenimiento) {
        this.mantenimientoToDelete = mantenimiento;
        this.showConfirmModal = true;
      },
      confirmDelete() {
        this.isLoading = true;
        
        setTimeout(() => {
          const index = this.mantenimientos.findIndex(m => m.id_mantenimiento === this.mantenimientoToDelete.id_mantenimiento);
          if (index !== -1) {
            this.mantenimientos.splice(index, 1);
          }
          
          alert("Registro de mantenimiento eliminado correctamente");
          
          this.isLoading = false;
          this.showConfirmModal = false;
          this.mantenimientoToDelete = null;
        }, 1000);
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
      // Simulación de carga de datos
      this.isLoading = true;
      
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  };
  </script>
  
  <style src="@/assets/css/Crearmantenimiento.css" scoped></style>