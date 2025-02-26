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
              placeholder="Buscar por nombre, código mochila o GPS..."
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
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Código Mochila</th>
                <th>GPS Asignado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(empleado, index) in paginatedEmpleados" :key="index">
                <td data-label="#">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </td>
                <td data-label="Nombre Completo">{{ empleado.nombre_completo || `${empleado.nombre} ${empleado.apellido}` }}</td>
                <td data-label="Teléfono">{{ empleado.telefono }}</td>
                <td data-label="Código Mochila">{{ empleado.codigo_mochila }}</td>
                <td data-label="GPS Asignado">{{ empleado.gps_asignado }}</td>
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
                  <label>Nombre Completo:</label>
                  <input
                    ref="nombreInput"
                    v-model="usuarioForm.nombre_completo"
                    type="text"
                    placeholder="Ej: Juan Carlos Rodríguez Martínez"
                    required
                    :class="{ 'input-error': validationErrors.nombre_completo }"
                    @input="validarNombreCompletoInput"
                  />
                  <span v-if="validationErrors.nombre_completo" class="error-message">
                    {{ validationErrors.nombre_completo }}
                  </span>
                </div>
                
                <div class="form-group">
                  <label>Correo:</label>
                  <input 
                    v-model="usuarioForm.correo" 
                    type="email" 
                    placeholder="Ej: juan.rodriguez@lavamatic.com"
                    required 
                    :class="{ 'input-error': validationErrors.correo }"
                    @input="validarCorreoInput"
                  />
                  <span v-if="validationErrors.correo" class="error-message">
                    {{ validationErrors.correo }}
                  </span>
                </div>
                
                <div class="form-group">
                  <label>Teléfono:</label>
                  <div class="phone-input-container">
                    <select
                      v-model="selectedCountryCode"
                      class="select-phone"
                      style="font-size: 0.9em;"
                    >
                      <option value="+504">+504</option>
                      <option value="+1">+1</option>
                      <option value="+52">+52</option>
                      <option value="+34">+34</option>
                    </select>
                    <input
                      v-model="usuarioForm.telefono"
                      type="text"
                      class="input-phone"
                      placeholder="Ej: 9988-7766"
                      required
                      :class="{ 'input-error': validationErrors.telefono }"
                      @input="validarTelefonoInput"
                    />
                  </div>
                  <span v-if="validationErrors.telefono" class="error-message">
                    {{ validationErrors.telefono }}
                  </span>
                </div>
                
                <div class="form-group">
                  <label>Dirección:</label>
                  <input 
                    v-model="usuarioForm.direccion" 
                    type="text" 
                    placeholder="Ej: Col. Kennedy, Calle Principal, Casa #123"
                    required 
                    :class="{ 'input-error': validationErrors.direccion }"
                    @input="validarDireccionInput"
                  />
                  <span v-if="validationErrors.direccion" class="error-message">
                    {{ validationErrors.direccion }}
                  </span>
                </div>
              </div>
    
              <div class="contenedor contenedor-derecho">
                <div class="form-group">
                  <label>
                    <span
                      class="info-icon"
                      @mouseover="showTooltip = true"
                      @mouseleave="showTooltip = false"
                    >ℹ️</span>
                    Contraseña:
                  </label>
                  <div class="password-wrapper">
                    <input
                      v-model="usuarioForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder=""
                      required
                      :disabled="!isPassEdit"
                      :class="{ 'input-error': validationErrors.password }"
                      @input="validarPasswordInput"
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
                  <span v-if="validationErrors.password" class="error-message">
                    {{ validationErrors.password }}
                  </span>
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
                      placeholder=""
                      required
                      :disabled="!isPassEdit"
                      :class="{ 'input-error': validationErrors.confirmPassword }"
                      @input="validarPasswordInput"
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
                  <span v-if="validationErrors.confirmPassword" class="error-message">
                    {{ validationErrors.confirmPassword }}
                  </span>
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
                    @input="validarCodigoMochilaInput"
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
                    @input="validarGPSInput"
                  />
                  <span v-if="validationErrors.gps_asignado" class="error-message">
                    {{ validationErrors.gps_asignado }}
                  </span>
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
                v-if="isEditing"
                class="btn editar-password"
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
        nombre_completo: '',
        correo: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: '',
        codigo_mochila: '',
        gps_asignado: ''
      },
      usuarioForm: {
        id_usuario: 0,
        nombre_completo: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        codigo_mochila: "",
        gps_asignado: ""
      },
      empleados: [
        {
          id_usuario: 1,
          id_repartidor: 101,
          nombre_completo: "Juan Pérez",
          correo: "juan@example.com",
          telefono: "9988-7766",
          direccion: "Colonia Kennedy",
          codigo_mochila: "MOCH-001",
          gps_asignado: "GPS-12345"
        },
        {
          id_usuario: 2,
          id_repartidor: 102,
          nombre_completo: "María López",
          correo: "maria@example.com",
          telefono: "8877-6655",
          direccion: "Col. Miraflores",
          codigo_mochila: "MOCH-002",
          gps_asignado: "GPS-67890"
        }
      ],
    };
  },
  computed: {
    filteredEmpleados() {
      return this.empleados.filter(
        (empleado) => {
          const nombreCompleto = empleado.nombre_completo || '';
          return nombreCompleto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            empleado.codigo_mochila.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            empleado.gps_asignado.toLowerCase().includes(this.searchQuery.toLowerCase());
        }
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
    
    // Métodos de validación en tiempo real
    validarNombreCompletoInput() {
      this.validarNombreCompleto();
    },
    validarCorreoInput() {
      this.validarCorreo();
    },
    validarTelefonoInput() {
      this.validarTelefono();
    },
    validarDireccionInput() {
      this.validarDireccion();
    },
    validarPasswordInput() {
      this.validarPassword();
    },
    validarCodigoMochilaInput() {
      this.validarCodigosMochilasGPS();
    },
    validarGPSInput() {
      this.validarCodigosMochilasGPS();
    },
    
    // Validación del nombre completo (solo letras, espacios y acentos)
    validarNombreCompleto() {
      // Bloquear caracteres no permitidos inmediatamente al escribir
      const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s]*$/;
      if (!regex.test(this.usuarioForm.nombre_completo)) {
        // Eliminar caracteres no permitidos
        this.usuarioForm.nombre_completo = this.usuarioForm.nombre_completo.replace(/[^a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s]/g, '');
        this.validationErrors.nombre_completo = "El nombre solo debe contener letras y espacios";
        return false;
      }
      
      if (!this.usuarioForm.nombre_completo) {
        this.validationErrors.nombre_completo = "El nombre es obligatorio";
        return false;
      } else {
        this.validationErrors.nombre_completo = "";
        return true;
      }
    },
    
    // Validación del correo electrónico
    validarCorreo() {
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!this.usuarioForm.correo) {
        this.validationErrors.correo = "El correo es obligatorio";
        return false;
      } else if (!regex.test(this.usuarioForm.correo)) {
        this.validationErrors.correo = "Formato de correo no válido";
        return false;
      } else {
        this.validationErrors.correo = "";
        return true;
      }
    },

    // Validación del teléfono (formato ###-#### o ########)
    validarTelefono() {
      // Restringir a solo números y guiones
      const input = this.usuarioForm.telefono;
      const soloNumeros = input.replace(/[^0-9-]/g, '');
      
      if (soloNumeros !== input) {
        this.usuarioForm.telefono = soloNumeros;
      }
      
      // Si hay más de un guion o está en posición incorrecta, corregirlo
      if (soloNumeros.split('-').length > 2) {
        // Mantener solo el primer guion
        const parts = soloNumeros.split('-');
        const first = parts[0];
        const rest = parts.slice(1).join('');
        this.usuarioForm.telefono = first + '-' + rest;
      }
      
      // Si tiene el formato correcto, reformatearlo automáticamente
      if (/^[0-9]{4,4}$/.test(soloNumeros)) {
        // Si tiene 4 dígitos, añadir el guion automáticamente
        this.usuarioForm.telefono = soloNumeros + '-';
      } else if (/^[0-9]{8,8}$/.test(soloNumeros)) {
        // Si tiene 8 dígitos sin guion, formatearlo
        this.usuarioForm.telefono = soloNumeros.substring(0, 4) + '-' + soloNumeros.substring(4);
      }
      
      // Validación final
      const regex = /^([0-9]{4}-?[0-9]{4}|[0-9]{0,8})$/;
      if (!this.usuarioForm.telefono) {
        this.validationErrors.telefono = "El teléfono es obligatorio";
        return false;
      } else if (!regex.test(this.usuarioForm.telefono)) {
        this.validationErrors.telefono = "Formato válido: 9988-7766 o 99887766";
        return false;
      } else if (this.usuarioForm.telefono.length < 8 && this.usuarioForm.telefono.length > 0) {
        this.validationErrors.telefono = "El número debe tener 8 dígitos";
        return false;
      } else {
        this.validationErrors.telefono = "";
        return true;
      }
    },

    // Validación de la dirección (solo permitir ciertos caracteres especiales comunes en direcciones)
    validarDireccion() {
      // Permite letras, números, espacios y caracteres especiales comunes en direcciones
      const regex = /^[a-zA-Z0-9áéíóúüÁÉÍÓÚÜñÑ\s,.#\-()]+$/;
      if (!this.usuarioForm.direccion) {
        this.validationErrors.direccion = "La dirección es obligatoria";
        return false;
      } else if (!regex.test(this.usuarioForm.direccion)) {
        this.validationErrors.direccion = "La dirección contiene caracteres no permitidos";
        return false;
      } else {
        this.validationErrors.direccion = "";
        return true;
      }
    },

    // Validación de contraseña (si está en modo edición de contraseña)
    validarPassword() {
      if (!this.isPassEdit) return true;
      
      // Requiere al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      
      if (!this.usuarioForm.password) {
        this.validationErrors.password = "La contraseña es obligatoria";
        return false;
      } else if (!regex.test(this.usuarioForm.password)) {
        this.validationErrors.password = "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un símbolo";
        return false;
      } else if (this.usuarioForm.password !== this.usuarioForm.confirmPassword) {
        this.validationErrors.confirmPassword = "Las contraseñas no coinciden";
        return false;
      } else {
        this.validationErrors.password = "";
        this.validationErrors.confirmPassword = "";
        return true;
      }
    },

    // Validar que los códigos de mochila y GPS sean únicos
    validarCodigosMochilasGPS() {
      let isValid = true;
      
      // Validar que el código de mochila no esté vacío
      if (!this.usuarioForm.codigo_mochila) {
        this.validationErrors.codigo_mochila = "El código de mochila es obligatorio";
        isValid = false;
      } else {
        // Validar que el código de mochila sea único
        const existeMochila = this.empleados.some(
          e => 
            e.codigo_mochila.toLowerCase() === this.usuarioForm.codigo_mochila.toLowerCase() && 
            (!this.isEditing || e.id_usuario !== this.usuarioForm.id_usuario)
        );
        
        if (existeMochila) {
          this.validationErrors.codigo_mochila = "Este código de mochila ya está en uso";
          isValid = false;
        } else {
          this.validationErrors.codigo_mochila = "";
        }
      }

      // Validar que el código GPS no esté vacío
      if (!this.usuarioForm.gps_asignado) {
        this.validationErrors.gps_asignado = "El código GPS es obligatorio";
        isValid = false;
      } else {
        // Validar que el código GPS sea único
        const existeGPS = this.empleados.some(
          e => 
            e.gps_asignado.toLowerCase() === this.usuarioForm.gps_asignado.toLowerCase() && 
            (!this.isEditing || e.id_usuario !== this.usuarioForm.id_usuario)
        );
        
        if (existeGPS) {
          this.validationErrors.gps_asignado = "Este código GPS ya está en uso";
          isValid = false;
        } else {
          this.validationErrors.gps_asignado = "";
        }
      }

      return isValid;
    },

    // Extraer nombres y apellidos desde el nombre completo
    extraerNombresApellidos() {
      // Dividir el nombre completo en partes
      const partes = this.usuarioForm.nombre_completo.trim().split(/\s+/);
      
      if (partes.length === 0) return { nombre: '', apellido: '' };
      
      // Si solo hay una palabra, es el nombre
      if (partes.length === 1) {
        return { 
          nombre: partes[0], 
          apellido: '' 
        };
      }
      
      // Si hay dos o más palabras, la primera es el nombre y la segunda es el apellido
      const nombre = partes[0];
      const apellido = partes.slice(1).join(' ');
      
      return { nombre, apellido };
    },
    
    // Método que ejecuta todas las validaciones
    validarFormulario() {
      const nombreValido = this.validarNombreCompleto();
      const correoValido = this.validarCorreo();
      const telefonoValido = this.validarTelefono();
      const direccionValida = this.validarDireccion();
      const passwordValido = this.validarPassword();
      const codigosValidos = this.validarCodigosMochilasGPS();
      
      return nombreValido && correoValido && telefonoValido && 
             direccionValida && passwordValido && codigosValidos;
    },
    
    openModal() {
      this.isModalOpen = true;
      this.validationErrors = {
        nombre_completo: '',
        correo: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: '',
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
        nombre_completo: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        codigo_mochila: "",
        gps_asignado: ""
      };
      this.isEditing = false;
      this.editIndex = null;
      this.isPassEdit = true;
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.validationErrors = {
        nombre_completo: '',
        correo: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: '',
        codigo_mochila: '',
        gps_asignado: ''
      };
    },
    
    editarPassword() {
      this.isPassEdit = true;
    },
    
    guardarUsuario() {
      // Ejecutar todas las validaciones
      if (!this.validarFormulario()) {
        // Si hay errores de validación, no continuar
        return;
      }

      // Simulación de guardado
      this.isLoading = true;
      
      // Extraer nombre y apellido desde nombre completo para compatibilidad interna
      const { nombre, apellido } = this.extraerNombresApellidos();
      
      setTimeout(() => {
        if (this.isEditing) {
          // Actualizar empleado existente
          const empleadoActualizado = {
            ...this.usuarioForm,
            nombre: nombre,
            apellido: apellido
          };
          this.empleados[this.editIndex] = empleadoActualizado;
          alert("Repartidor actualizado correctamente");
        } else {
          // Crear email a partir del nombre completo si no está editando
          if (!this.usuarioForm.correo) {
            const nombreLimpio = nombre.toLowerCase().replace(/\s+/g, '');
            const apellidoLimpio = apellido.toLowerCase().replace(/\s+/g, '');
            this.usuarioForm.correo = `${nombreLimpio}.${apellidoLimpio}@lavamatic.com`;
          }

          // Agregar nuevo empleado
          const newId = Math.max(...this.empleados.map(e => e.id_usuario), 0) + 1;
          const newRepartidorId = Math.max(...this.empleados.map(e => e.id_repartidor || 0), 100) + 1;
          this.empleados.push({
            ...this.usuarioForm,
            id_usuario: newId,
            id_repartidor: newRepartidorId,
            nombre: nombre,
            apellido: apellido
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
      
      // Copiar los datos del empleado al formulario
      this.usuarioForm = { 
        ...empleado,
        // Si el empleado ya tiene nombre_completo, usarlo. Si no, construirlo a partir de nombre y apellido
        nombre_completo: empleado.nombre_completo || `${empleado.nombre} ${empleado.apellido}`
      };
      
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