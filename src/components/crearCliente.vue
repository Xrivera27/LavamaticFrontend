<template>
  <div class="admin-layout" id="gestc">
    <SidebarAdmin @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="clientes-wrapper">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
        
        <div class="header-section">
          <h1 class="page-title">Gestión de Clientes</h1>
        </div>
    
        <div class="opciones">
          <button
            id="btnAdd"
            class="btn btn-primary"
            @click="openModal"
            style="width: 200px; white-space: nowrap"
          >
            Agregar Cliente
          </button>
    
          <div class="search-bar">
            <input
              class="busqueda"
              type="text"
              v-model="searchQuery"
              placeholder="Buscar por nombre, correo, teléfono..."
            />
          </div>
        </div>
    
        <div class="table-container">
          <div v-if="isLoading" class="loading-indicator">
            Cargando clientes...
          </div>
    
          <div v-else-if="paginatedClientes.length === 0" class="no-data">
            No se encontraron clientes para mostrar.
          </div>
    
          <table v-else class="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cliente, index) in paginatedClientes" :key="index">
                <td data-label="#">
                  {{ (currentPage - 1) * pageSize + index + 1 }}
                </td>
                <td data-label="Nombre Completo">{{ cliente.nombre_completo || `${cliente.nombre} ${cliente.apellido}` }}</td>
                <td data-label="Email">{{ cliente.correo }}</td>
                <td data-label="Teléfono">{{ cliente.telefono }}</td>
                <td data-label="Dirección">{{ cliente.direccion }}</td>
                <td data-label="Acciones">
  <div class="btn-group" role="group">
    <button
      id="btnEditar"
      class="btn btn-warning"
      @click="editCliente(cliente)"
    >
      <i class="fa-solid fa-pencil" style="color: white;"></i>
    </button>
    <button
      id="btnEliminar"
      class="btn btn-danger"
      @click="deleteCliente(cliente)"
    >
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
</td>
              </tr>
            </tbody>
          </table>
    
          <div class="pagination-wrapper" v-if="totalPages > 0">
  <div class="pagination-info">
    Mostrando {{ paginatedClientes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
    {{ Math.min(currentPage * pageSize, filteredClientes.length) }} de
    {{ filteredClientes.length }} registros
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
    
        <div class="modal" v-if="showConfirmModal">
          <div class="modal-confirm">
            <div class="modal-header">
              <h2>Confirmación</h2>
            </div>
            <div class="modal-body-confirm">
              <p>¿Estás seguro de que quieres eliminar este cliente?</p>
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
    
        <div v-if="isModalOpen" class="modal">
          <div class="modal-usuario">
            <div class="modal-header">
              <h2 class="h2-modal-content">
                {{ isEditing ? "Editar Cliente" : "Agregar Cliente" }}
              </h2>
            </div>
    
            <div class="modal-body">
              <div class="contenedor contenedor-izquierdo">
                <div class="form-group">
                  <label>Nombre Completo:</label>
                  <input
                    ref="nombreInput"
                    v-model="clienteForm.nombre_completo"
                    type="text"
                    placeholder="Ej: Carlos Roberto González Martínez"
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
                    v-model="clienteForm.correo" 
                    type="email" 
                    placeholder="Ej: carlos.gonzalez@example.com"
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
                      v-model="clienteForm.telefono"
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
                    v-model="clienteForm.direccion" 
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
                      v-model="clienteForm.password"
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
                      v-model="clienteForm.confirmPassword"
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
              </div>
            </div>
            <div class="modal-footer">
              <div class="action-buttons">
                <button style="margin-bottom: 1rem;"
                  class="btn btn-primary"
                  @click="guardarCliente"
                >
                  {{ isEditing ? 'Guardar Cambios' : 'Agregar Cliente' }}
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
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: "crearCliente",
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
      clienteToDelete: null,
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
      pageSize: 4,
      validationErrors: {
        nombre_completo: '',
        correo: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: ''
      },
      clienteForm: {
        id_usuario: 0,
        nombre_completo: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        id_rol: 2 // Siempre será cliente (rol 2)
      },
      clientes: []
    };
  },
  computed: {
    filteredClientes() {
      return this.clientes.filter(
        (cliente) => {
          const nombreCompleto = cliente.nombre_completo || cliente.nombre || '';
          const correo = cliente.correo || cliente.email || '';
          const telefono = cliente.telefono || '';
          const direccion = cliente.direccion || '';
          
          return nombreCompleto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            correo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            telefono.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            direccion.toLowerCase().includes(this.searchQuery.toLowerCase());
        }
      );
    },
    paginatedClientes() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredClientes.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredClientes.length / this.pageSize) || 1;
    },
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    // Cargar clientes desde el backend
    async cargarClientes() {
      this.isLoading = true;
      try {
        const response = await api.clients.getAll();
        console.log("Datos de clientes recibidos:", response.data);
        
        // Procesar los datos del servidor
        this.clientes = response.data.map(cliente => {
          return {
            id_usuario: cliente.id_usuario,
            nombre_completo: cliente.nombre || '',
            nombre: cliente.nombre || '',
            correo: cliente.email || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || ''
          };
        });
        
        if (this.clientes.length > 0) {
          this.toast.success("Clientes cargados correctamente");
        } else {
          this.toast.info("No hay clientes registrados");
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        this.toast.error("Error al cargar clientes");
      } finally {
        this.isLoading = false;
      }
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
    
    // Validación del nombre completo (solo letras, espacios y acentos)
    validarNombreCompleto() {
      // Bloquear caracteres no permitidos inmediatamente al escribir
      const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s]*$/;
      if (!regex.test(this.clienteForm.nombre_completo)) {
        // Eliminar caracteres no permitidos
        this.clienteForm.nombre_completo = this.clienteForm.nombre_completo.replace(/[^a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s]/g, '');
        this.validationErrors.nombre_completo = "El nombre solo debe contener letras y espacios";
        return false;
      }
      
      if (!this.clienteForm.nombre_completo) {
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
      if (!this.clienteForm.correo) {
        this.validationErrors.correo = "El correo es obligatorio";
        return false;
      } else if (!regex.test(this.clienteForm.correo)) {
        this.validationErrors.correo = "Formato de correo no válido";
        return false;
      } else {
        // Validar que el correo sea único (excepto para el cliente actual en edición)
        const existeEmail = this.clientes.some(
          c => 
            (c.correo || c.email).toLowerCase() === this.clienteForm.correo.toLowerCase() && 
            (!this.isEditing || c.id_usuario !== this.clienteForm.id_usuario)
        );
        
        if (existeEmail) {
          this.validationErrors.correo = "Este correo ya está registrado";
          return false;
        } else {
          this.validationErrors.correo = "";
          return true;
        }
      }
    },

    // Validación del teléfono (formato ###-#### o ########)
    validarTelefono() {
      // Restringir a solo números y guiones
      const input = this.clienteForm.telefono;
      const soloNumeros = input.replace(/[^0-9-]/g, '');
      
      if (soloNumeros !== input) {
        this.clienteForm.telefono = soloNumeros;
      }
      
      // Si hay más de un guion o está en posición incorrecta, corregirlo
      if (soloNumeros.split('-').length > 2) {
        // Mantener solo el primer guion
        const parts = soloNumeros.split('-');
        const first = parts[0];
        const rest = parts.slice(1).join('');
        this.clienteForm.telefono = first + '-' + rest;
      }
      
      // Si tiene el formato correcto, reformatearlo automáticamente
      if (/^[0-9]{4,4}$/.test(soloNumeros)) {
        // Si tiene 4 dígitos, añadir el guion automáticamente
        this.clienteForm.telefono = soloNumeros + '-';
      } else if (/^[0-9]{8,8}$/.test(soloNumeros)) {
        // Si tiene 8 dígitos sin guion, formatearlo
        this.clienteForm.telefono = soloNumeros.substring(0, 4) + '-' + soloNumeros.substring(4);
      }
      
      // Validación final
      const regex = /^([0-9]{4}-?[0-9]{4}|[0-9]{0,8})$/;
      if (!this.clienteForm.telefono) {
        this.validationErrors.telefono = "El teléfono es obligatorio";
        return false;
      } else if (!regex.test(this.clienteForm.telefono)) {
        this.validationErrors.telefono = "Formato válido: 9988-7766 o 99887766";
        return false;
      } else if (this.clienteForm.telefono.length < 8 && this.clienteForm.telefono.length > 0) {
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
      if (!this.clienteForm.direccion) {
        this.validationErrors.direccion = "La dirección es obligatoria";
        return false;
      } else if (!regex.test(this.clienteForm.direccion)) {
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
      
      if (!this.clienteForm.password) {
        this.validationErrors.password = "La contraseña es obligatoria";
        return false;
      } else if (!regex.test(this.clienteForm.password)) {
        this.validationErrors.password = "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un símbolo";
        return false;
      } else if (this.clienteForm.password !== this.clienteForm.confirmPassword) {
        this.validationErrors.confirmPassword = "Las contraseñas no coinciden";
        return false;
      } else {
        this.validationErrors.password = "";
        this.validationErrors.confirmPassword = "";
        return true;
      }
    },
    
    // Método que ejecuta todas las validaciones
    validarFormulario() {
      const nombreValido = this.validarNombreCompleto();
      const correoValido = this.validarCorreo();
      const telefonoValido = this.validarTelefono();
      const direccionValida = this.validarDireccion();
      const passwordValido = this.validarPassword();
      
      return nombreValido && correoValido && telefonoValido && 
             direccionValida && passwordValido;
    },
    
    openModal() {
      this.isModalOpen = true;
      this.validationErrors = {
        nombre_completo: '',
        correo: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: ''
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
      this.clienteForm = {
        id_usuario: 0,
        nombre_completo: "",
        correo: "",
        telefono: "",
        direccion: "",
        password: "",
        confirmPassword: "",
        id_rol: 2 // Siempre será cliente (rol 2)
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
        confirmPassword: ''
      };
    },
    
    editarPassword() {
      this.isPassEdit = true;
    },
    
    async guardarCliente() {
      // Ejecutar todas las validaciones
      if (!this.validarFormulario()) {
        return;
      }

      this.isLoading = true;

      try {
        // Preparar datos según el formato esperado por el backend
        const datosEnvio = {
          nombre: this.clienteForm.nombre_completo,
          email: this.clienteForm.correo,
          telefono: this.clienteForm.telefono,
          direccion: this.clienteForm.direccion
        };
        
        if (this.isEditing) {
          // Actualización de cliente
          if (this.isPassEdit && this.clienteForm.password) {
            datosEnvio.password = this.clienteForm.password;
          }
          
          console.log("Actualizando cliente:", datosEnvio);
          
          await api.clients.update(this.clienteForm.id_usuario, datosEnvio);
          this.toast.success("Cliente actualizado correctamente");
        } else {
          // Creación de nuevo cliente
          datosEnvio.password = this.clienteForm.password;
          datosEnvio.id_rol = 2; // Cliente
          
          console.log("Creando cliente:", datosEnvio);
          
          await api.clients.create(datosEnvio);
          this.toast.success("Cliente agregado correctamente");
        }
        
        // Recargar lista de clientes
        await this.cargarClientes();
        
        // Cerrar modal y limpiar formulario
        this.closeModal();
      } catch (error) {
        console.error("Error al guardar cliente:", error);
        let errorMsg = "Error al guardar cliente";
        
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
    
    deleteCliente(cliente) {
      this.clienteToDelete = cliente;
      this.showConfirmModal = true;
    },
    
    async confirmDelete() {
      this.isLoading = true;
      
      try {
        await api.clients.delete(this.clienteToDelete.id_usuario);
        this.toast.success("Cliente eliminado correctamente");
        
        // Eliminar de la lista local
        const index = this.clientes.findIndex(c => c.id_usuario === this.clienteToDelete.id_usuario);
        if (index !== -1) {
          this.clientes.splice(index, 1);
        }
        
        this.showConfirmModal = false;
        this.clienteToDelete = null;
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        let errorMsg = "Error al eliminar cliente";
        
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
      this.clienteToDelete = null;
    },
    
    editCliente(cliente) {
      // Preparar el formulario para edición
      console.log("Editando cliente:", cliente);
      
      this.clienteForm = { 
        id_usuario: cliente.id_usuario,
        nombre_completo: cliente.nombre_completo || cliente.nombre || '',
        correo: cliente.correo || cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        password: "",
        confirmPassword: "",
        id_rol: 2
      };
      
      this.isEditing = true;
      this.isPassEdit = false;
      this.openModal();
    }
  },
  
  mounted() {
    // Cargar datos de clientes
    this.cargarClientes();
  }
};
</script>
  
  <style src="@/assets/css/CrearCliente.css" scoped></style>