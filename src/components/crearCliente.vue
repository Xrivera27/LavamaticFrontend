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
                  <button style="margin-bottom: 1rem; color: white;"
                    id="btnEditar"
                    class="btn btn-warning"
                    @click="editCliente(cliente)"
                  >
                    <i class="fa-solid fa-pencil"></i>
                  </button>
                  <button
                    id="btnEliminar"
                    class="btn btn-danger"
                    @click="deleteCliente(cliente)"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
    
          <div class="pagination-wrapper">
            <div class="pagination-info">
              Mostrando {{ paginatedClientes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0 }} a
              {{ Math.min(currentPage * pageSize, filteredClientes.length) }} de
              {{ filteredClientes.length }} registros
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

export default {
  name: "crearCliente",
  components: {
    SidebarAdmin
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
      pageSize: 10,
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
      clientes: [
        {
          id_usuario: 1,
          nombre: "Carlos",
          apellido: "González",
          nombre_completo: "Carlos González",
          correo: "carlos@example.com",
          telefono: "9911-2233",
          direccion: "Colonia Palmira, Calle Principal"
        },
        {
          id_usuario: 2,
          nombre: "Ana",
          apellido: "Martínez",
          nombre_completo: "Ana Martínez",
          correo: "ana@example.com",
          telefono: "8822-3344",
          direccion: "Colonia El Prado, Av. República"
        },
        {
          id_usuario: 3,
          nombre: "Roberto",
          apellido: "Mendoza",
          nombre_completo: "Roberto Mendoza",
          correo: "roberto@example.com",
          telefono: "9512-3456",
          direccion: "Residencial Maya, Bloque 5"
        },
        {
          id_usuario: 4,
          nombre: "Sofía",
          apellido: "Hernández",
          nombre_completo: "Sofía Hernández",
          correo: "sofia@example.com",
          telefono: "9678-9012",
          direccion: "Colonia Lomas, Calle Principal"
        }
      ],
    };
  },
  computed: {
    filteredClientes() {
      return this.clientes.filter(
        (cliente) => {
          const nombreCompleto = cliente.nombre_completo || `${cliente.nombre} ${cliente.apellido}` || '';
          return nombreCompleto.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            cliente.correo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            cliente.telefono.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            cliente.direccion.toLowerCase().includes(this.searchQuery.toLowerCase());
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
            c.correo.toLowerCase() === this.clienteForm.correo.toLowerCase() && 
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

    // Extraer nombres y apellidos desde el nombre completo
    extraerNombresApellidos() {
      // Dividir el nombre completo en partes
      const partes = this.clienteForm.nombre_completo.trim().split(/\s+/);
      
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
    
    guardarCliente() {
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
          // Actualizar cliente existente
          const clienteActualizado = {
            ...this.clienteForm,
            nombre: nombre,
            apellido: apellido
          };
          
          const index = this.clientes.findIndex(c => c.id_usuario === this.clienteForm.id_usuario);
          if (index !== -1) {
            // Si la contraseña está vacía y no está en modo edición de contraseña, no la actualizamos
            if (!this.isPassEdit) {
              const passwordOriginal = this.clientes[index].password;
              clienteActualizado.password = passwordOriginal;
            }
            
            this.clientes.splice(index, 1, clienteActualizado);
          }
          alert("Cliente actualizado correctamente");
        } else {
          // Crear nuevo cliente
          const newId = Math.max(...this.clientes.map(c => c.id_usuario), 0) + 1;
          
          // Crear email a partir del nombre completo si no está editando
          if (!this.clienteForm.correo) {
            const nombreLimpio = nombre.toLowerCase().replace(/\s+/g, '');
            const apellidoLimpio = apellido.toLowerCase().replace(/\s+/g, '');
            this.clienteForm.correo = `${nombreLimpio}.${apellidoLimpio}@example.com`;
          }
          
          const nuevoCliente = { 
            ...this.clienteForm,
            id_usuario: newId,
            nombre: nombre,
            apellido: apellido
          };
          
          this.clientes.push(nuevoCliente);
          alert("Cliente agregado correctamente");
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
    
    deleteCliente(cliente) {
      this.clienteToDelete = cliente;
      this.showConfirmModal = true;
    },
    
    confirmDelete() {
      this.isLoading = true;
      
      setTimeout(() => {
        const index = this.clientes.findIndex(c => c.id_usuario === this.clienteToDelete.id_usuario);
        if (index !== -1) {
          this.clientes.splice(index, 1);
        }
        
        alert("Cliente eliminado correctamente");
        
        this.isLoading = false;
        this.showConfirmModal = false;
        this.clienteToDelete = null;
      }, 1000);
    },
    
    cancelDelete() {
      this.showConfirmModal = false;
      this.clienteToDelete = null;
    },
    
    editCliente(cliente) {
      // Preparar el formulario para edición
      const nombreCompleto = cliente.nombre_completo || `${cliente.nombre} ${cliente.apellido}`;
      
      // Separar el prefijo y número de teléfono
      const telefonoCompleto = cliente.telefono || '';
      const prefijos = ['+504', '+1', '+52', '+34'];
      let prefijoEncontrado = prefijos.find(prefijo => telefonoCompleto.startsWith(prefijo));
      
      this.selectedCountryCode = prefijoEncontrado || '+504';
      const numeroSinPrefijo = telefonoCompleto.replace(this.selectedCountryCode, '');
      
      // Clonar el cliente
      this.clienteForm = { 
        ...cliente,
        nombre_completo: nombreCompleto,
        telefono: numeroSinPrefijo,
        confirmPassword: '' 
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
  
  <style src="@/assets/css/CrearCliente.css" scoped></style>