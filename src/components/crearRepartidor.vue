<template>
  <div class="admin-layout">
    <SidebarAdmin @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="empleados-wrapper">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
        
        <div class="header-section">
          <h1 class="page-title">Gestión de Repartidores</h1>
        </div>
    
        <div class="opciones">
          <button
            id="btnAdd"
            class="btn btn-primary"
            @click="openModal"
            style="width: 200px; white-space: nowrap"
          >
            Agregar Repartidor
          </button>
    
          <div class="search-bar">
            <input style="border-radius: 10px;"
              class="busqueda"
              type="text"
              v-model="searchQuery"
              placeholder="Buscar repartidor..."
            />
          </div>
        </div>
    
        <div class="table-container">
          <div v-if="isLoading" class="loading-indicator">
            Cargando repartidores...
          </div>
    
          <div v-else-if="paginatedEmpleados.length === 0" class="no-data">
            No se encontraron repartidores para mostrar.
          </div>
    
          <table v-else class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Código Mochila</th>
                <th>GPS Asignado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(empleado, index) in paginatedEmpleados" :key="index">
                <td data-label="#">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </td>
                <td data-label="Nombre">{{ empleado.nombre }}</td>
                <td data-label="Apellido">{{ empleado.apellido }}</td>
                <td data-label="Teléfono">{{ empleado.telefono }}</td>
                <td data-label="Código Mochila">{{ empleado.codigo_mochila }}</td>
                <td data-label="GPS Asignado">{{ empleado.gps_asignado }}</td>
                <td data-label="Estado">
                  <span :class="'badge ' + getEstadoClass(empleado.estado)">
                    {{ empleado.estado }}
                  </span>
                </td>
                <td data-label="Acciones">
                  <button
                  style="margin-bottom: 1rem;"
                    id="btnEditar"
                    class="btn btn-warning"
                    @click="editEmpleado(empleado)"
                  >
                    <i class="fa-solid fa-pencil" style="color: white;"></i>
                  </button>
                  <button
                    id="btnEliminar"
                    class="btn btn-danger"
                    @click="deleteUsuariol(empleado)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
    
          <div class="pagination-wrapper">
            <div class="pagination-info">
              Mostrando {{ paginatedEmpleados.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
              {{ Math.min(currentPage * pageSize, filteredEmpleados.length) }} de
              {{ filteredEmpleados.length }} registros
            </div>
            <div class="pagination-container">
              <button
              style="margin-bottom: 1rem;"
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
    
        <div class="modal" v-if="showConfirmModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres eliminar este repartidor?</p>
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
    
        <div v-if="isModalOpen" class="modal">
          <div class="modal-usuario">
            <div class="modal-header">
              <h2 class="h2-modal-content">
                {{ isEditing ? "Editar Repartidor" : "Agregar Repartidor" }}
              </h2>
            </div>
    
            <div class="modal-body">
              <div class="contenedor contenedor-izquierdo">
                <div class="form-group">
                  <label>Nombre:</label>
                  <input
                    ref="nombreInput"
                    v-model="usuarioForm.nombre"
                    type="text"
                    required
                  />
                </div>
    
                <div class="form-group">
                  <label>Apellido:</label>
                  <input v-model="usuarioForm.apellido" type="text" required />
                </div>
    
                <div class="form-group">
                  <label>Correo:</label>
                  <input v-model="usuarioForm.correo" type="email" required />
                </div>
                
                <div class="form-group">
                  <label>Teléfono:</label>
                  <div class="phone-input-container">
                    <select
                      v-model="selectedCountryCode"
                      class="select-phone"
                    >
                      <option value="+504">🇭🇳 +504</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+34">🇪🇸 +34</option>
                    </select>
                    <input
                      v-model="usuarioForm.telefono"
                      type="text"
                      class="input-phone"
                      placeholder="Número de teléfono"
                      required
                    />
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Dirección:</label>
                  <input v-model="usuarioForm.direccion" type="text" required />
                </div>
              </div>
    
              <div class="contenedor contenedor-derecho">
                <div class="form-group">
                  <label>
                    <span
                      class="info-icon"
                      @mouseover="showTooltip = true"
                      @mouseleave="showTooltip = false"
                      >ℹ️</span
                    >
                    Contraseña:
                  </label>
                  <div class="password-wrapper">
                    <input
                      v-model="usuarioForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      :disabled="!isPassEdit"
                    />
                    <button
                      type="button"
                      class="toggle-password"
                      @click="showPassword = !showPassword"
                      :disabled="!isPassEdit"
                    >
                      <i class="fa-solid" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="showTooltip" class="tooltip">
                    La contraseña debe tener al menos 8 caracteres, incluir una
                    letra mayúscula, una letra minúscula, un número y un símbolo.
                  </div>
                </div>
    
                <div class="form-group">
                  <label>Confirmar contraseña:</label>
                  <div class="password-wrapper">
                    <input
                      v-model="usuarioForm.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      required
                      :disabled="!isPassEdit"
                    />
                    <button
                      type="button"
                      class="toggle-password"
                      @click="showConfirmPassword = !showConfirmPassword"
                      :disabled="!isPassEdit"
                    >
                      <i class="fa-solid" :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Campos específicos de repartidor -->
                <div class="form-group">
                  <label>Código de Mochila:</label>
                  <input 
                    v-model="usuarioForm.codigo_mochila" 
                    type="text" 
                    required 
                    placeholder="Ej: MOCH-001" 
                    :class="{ 'input-error': validationErrors.codigo_mochila }"
                  />
                  <span v-if="validationErrors.codigo_mochila" class="error-message">
                    {{ validationErrors.codigo_mochila }}
                  </span>
                </div>
                
                <div class="form-group">
                  <label>GPS Asignado:</label>
                  <input 
                    v-model="usuarioForm.gps_asignado" 
                    type="text" 
                    required 
                    placeholder="Ej: GPS-12345" 
                    :class="{ 'input-error': validationErrors.gps_asignado }"
                  />
                  <span v-if="validationErrors.gps_asignado" class="error-message">
                    {{ validationErrors.gps_asignado }}
                  </span>
                </div>
                
                <div class="form-group">
                  <label>Estado:</label>
                  <select v-model="usuarioForm.estado" required>
                    <option value="">Seleccione un estado</option>
                    <option value="Activo">Activo</option>
                    <option value="En ruta">En ruta</option>
                    <option value="Descanso">Descanso</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button style="margin-bottom: 1rem;"
                  class="btn btn-primary"
                  @click="guardarUsuario"
                >
                  {{ isEditing ? 'Guardar Cambios' : 'Agregar Repartidor' }}
                </button>
                <button
                  class="btn btn-secondary"
                  @click="closeModal"
                >
                  Cerrar
                </button>
              </div>
              <button
                class="btn editar-password"
                :disabled="!isEditing"
                @click="editarPassword"
              >
                Editar Contraseña
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

export default {
  name: "crearRepartidor",
  components: {
    SidebarAdmin
  },
  data() {
    return {
      isSidebarExpanded: false,
      showConfirmModal: false,
      empleadoToDelete: null,
      isLoading: false,
      showTooltip: false,
      searchQuery: "",
      isModalOpen: false,
      isEditing: false,
      isPassEdit: true,
      showPassword: false,
      showConfirmPassword: false,
      selectedCountryCode: "+504",
      editIndex: null,
      currentPage: 1,
      pageSize: 10,
      validationErrors: {
        codigo_mochila: '',
        gps_asignado: ''
      },
      usuarioForm: {
        id_usuario: 0,
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        codigo_mochila: "",
        gps_asignado: "",
        estado: ""
      },
      empleados: [
        {
          id_usuario: 1,
          id_repartidor: 101,
          nombre: "Juan",
          apellido: "Pérez",
          correo: "juan@example.com",
          telefono: "99887766",
          direccion: "Colonia Kennedy",
          codigo_mochila: "MOCH-001",
          gps_asignado: "GPS-12345",
          estado: "Activo"
        },
        {
          id_usuario: 2,
          id_repartidor: 102,
          nombre: "María",
          apellido: "López",
          correo: "maria@example.com",
          telefono: "88776655",
          direccion: "Col. Miraflores",
          codigo_mochila: "MOCH-002",
          gps_asignado: "GPS-67890",
          estado: "En ruta"
        }
      ],
    };
  },
  computed: {
    filteredEmpleados() {
      return this.empleados.filter(
        (empleado) =>
          empleado.nombre
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          empleado.apellido
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          empleado.codigo_mochila
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          empleado.gps_asignado
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
      );
    },
    paginatedEmpleados() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredEmpleados.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredEmpleados.length / this.pageSize) || 1;
    },
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    getEstadoClass(estado) {
      switch(estado) {
        case 'Activo': return 'badge-success';
        case 'En ruta': return 'badge-primary';
        case 'Descanso': return 'badge-warning';
        case 'Inactivo': return 'badge-danger';
        default: return 'badge-secondary';
      }
    },
    openModal() {
      this.isModalOpen = true;
      this.validationErrors = {
        codigo_mochila: '',
        gps_asignado: ''
      };
      this.$nextTick(() => {
        this.$refs.nombreInput?.focus();
      });
    },
    closeModal() {
      this.isModalOpen = false;
      this.clearForm();
    },
    clearForm() {
      this.usuarioForm = {
        id_usuario: 0,
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        codigo_mochila: "",
        gps_asignado: "",
        estado: ""
      };
      this.isEditing = false;
      this.editIndex = null;
      this.isPassEdit = true;
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.validationErrors = {
        codigo_mochila: '',
        gps_asignado: ''
      };
    },
    editarPassword() {
      this.isPassEdit = true;
    },
    validarCodigosMochilasGPS() {
      let isValid = true;
      this.validationErrors = {
        codigo_mochila: '',
        gps_asignado: ''
      };

      // Validar que el código de mochila sea único
      if (this.usuarioForm.codigo_mochila) {
        const existeMochila = this.empleados.some(
          e => 
            e.codigo_mochila.toLowerCase() === this.usuarioForm.codigo_mochila.toLowerCase() && 
            (!this.isEditing || e.id_usuario !== this.usuarioForm.id_usuario)
        );
        
        if (existeMochila) {
          this.validationErrors.codigo_mochila = "Este código de mochila ya está en uso";
          isValid = false;
        }
      }

      // Validar que el código GPS sea único
      if (this.usuarioForm.gps_asignado) {
        const existeGPS = this.empleados.some(
          e => 
            e.gps_asignado.toLowerCase() === this.usuarioForm.gps_asignado.toLowerCase() && 
            (!this.isEditing || e.id_usuario !== this.usuarioForm.id_usuario)
        );
        
        if (existeGPS) {
          this.validationErrors.gps_asignado = "Este código GPS ya está en uso";
          isValid = false;
        }
      }

      return isValid;
    },
    guardarUsuario() {
      // Validaciones básicas
      if (!this.usuarioForm.nombre || 
          !this.usuarioForm.apellido || 
          !this.usuarioForm.correo ||
          !this.usuarioForm.codigo_mochila ||
          !this.usuarioForm.gps_asignado ||
          !this.usuarioForm.estado) {
        alert("Por favor complete todos los campos obligatorios");
        return;
      }
      
      if (this.isPassEdit && this.usuarioForm.password !== this.usuarioForm.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }

      // Validar que los códigos de mochila y GPS sean únicos
      if (!this.validarCodigosMochilasGPS()) {
        return;
      }

      // Simulación de guardado
      this.isLoading = true;
      
      setTimeout(() => {
        if (this.isEditing) {
          // Actualizar empleado existente
          this.empleados[this.editIndex] = {...this.usuarioForm};
          alert("Repartidor actualizado correctamente");
        } else {
          // Crear email a partir del nombre y apellido si no está editando
          if (!this.usuarioForm.correo) {
            const nombreLimpio = this.usuarioForm.nombre.toLowerCase().replace(/\s+/g, '');
            const apellidoLimpio = this.usuarioForm.apellido.toLowerCase().replace(/\s+/g, '');
            this.usuarioForm.correo = `${nombreLimpio}.${apellidoLimpio}@lavamatic.com`;
          }

          // Agregar nuevo empleado
          const newId = Math.max(...this.empleados.map(e => e.id_usuario), 0) + 1;
          const newRepartidorId = Math.max(...this.empleados.map(e => e.id_repartidor || 0), 100) + 1;
          this.empleados.push({
            ...this.usuarioForm,
            id_usuario: newId,
            id_repartidor: newRepartidorId
          });
          alert("Repartidor agregado correctamente");
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
    deleteUsuariol(empleado) {
      this.empleadoToDelete = empleado;
      this.showConfirmModal = true;
    },
    confirmDelete() {
      this.isLoading = true;
      
      setTimeout(() => {
        const index = this.empleados.findIndex(e => e.id_usuario === this.empleadoToDelete.id_usuario);
        if (index !== -1) {
          this.empleados.splice(index, 1);
        }
        alert("Repartidor eliminado correctamente");
        this.isLoading = false;
        this.showConfirmModal = false;
        this.empleadoToDelete = null;
      }, 1000);
    },
    cancelDelete() {
      this.showConfirmModal = false;
      this.empleadoToDelete = null;
    },
    editEmpleado(empleado) {
      this.editIndex = this.empleados.findIndex(
        (item) => item.id_usuario === empleado.id_usuario
      );
      this.usuarioForm = { ...empleado };
      this.isEditing = true;
      this.isPassEdit = false;
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

<style src="@/assets/css/CrearRepartidor.css" scoped></style>