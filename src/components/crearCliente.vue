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
                placeholder="Buscar cliente..."
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
                  <th>Nombre</th>
                  <th>Apellido</th>
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
                  <td data-label="Nombre">{{ cliente.nombre }}</td>
                  <td data-label="Apellido">{{ cliente.apellido }}</td>
                  <td data-label="Email">{{ cliente.correo }}</td>
                  <td data-label="Teléfono">{{ cliente.telefono }}</td>
                  <td data-label="Dirección">{{ cliente.direccion }}</td>
                  <td data-label="Acciones">
                    <button  style="margin-bottom: 1rem; color: white;"
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
                    <label>Nombre:</label>
                    <input
                      ref="nombreInput"
                      v-model="clienteForm.nombre"
                      type="text"
                      required
                    />
                  </div>
      
                  <div class="form-group">
                    <label>Apellido:</label>
                    <input v-model="clienteForm.apellido" type="text" required />
                  </div>
      
                  <div class="form-group">
                    <label>Correo:</label>
                    <input v-model="clienteForm.correo" type="email" required />
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
                        v-model="clienteForm.telefono"
                        type="text"
                        class="input-phone"
                        placeholder="Número de teléfono"
                        required
                      />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Dirección:</label>
                    <input v-model="clienteForm.direccion" type="text" required />
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
                        v-model="clienteForm.password"
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
                        v-model="clienteForm.confirmPassword"
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
                </div>
              </div>
              <div class="modal-footer">
                <div class="action-buttons">
                  <button 
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
        validationErrors: {},
        clienteForm: {
          id_usuario: 0,
          nombre: "",
          apellido: "",
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
            correo: "carlos@example.com",
            telefono: "99112233",
            direccion: "Colonia Palmira, Calle Principal"
          },
          {
            id_usuario: 2,
            nombre: "Ana",
            apellido: "Martínez",
            correo: "ana@example.com",
            telefono: "88223344",
            direccion: "Colonia El Prado, Av. República"
          },
          {
            id_usuario: 3,
            nombre: "Roberto",
            apellido: "Mendoza",
            correo: "roberto@example.com",
            telefono: "95123456",
            direccion: "Residencial Maya, Bloque 5"
          },
          {
            id_usuario: 4,
            nombre: "Sofía",
            apellido: "Hernández",
            correo: "sofia@example.com",
            telefono: "96789012",
            direccion: "Colonia Lomas, Calle Principal"
          }
        ],
      };
    },
    computed: {
      filteredClientes() {
        return this.clientes.filter(
          (cliente) =>
            cliente.nombre
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            cliente.apellido
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            cliente.correo
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            cliente.telefono
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            cliente.direccion
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
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
        this.clienteForm = {
          id_usuario: 0,
          nombre: "",
          apellido: "",
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
        this.validationErrors = {};
      },
      editarPassword() {
        this.isPassEdit = true;
      },
      validarFormulario() {
        let isValid = true;
        this.validationErrors = {};
  
        // Validar campos obligatorios
        if (!this.clienteForm.nombre.trim()) {
          this.validationErrors.nombre = "El nombre es obligatorio";
          isValid = false;
        }
        
        if (!this.clienteForm.apellido.trim()) {
          this.validationErrors.apellido = "El apellido es obligatorio";
          isValid = false;
        }
        
        if (!this.clienteForm.correo.trim()) {
          this.validationErrors.correo = "El correo es obligatorio";
          isValid = false;
        } else if (!this.validarEmail(this.clienteForm.correo)) {
          this.validationErrors.correo = "El formato del correo no es válido";
          isValid = false;
        }
        
        // Validar que el correo sea único (excepto para el cliente actual en edición)
        const existeEmail = this.clientes.some(
          c => 
            c.correo.toLowerCase() === this.clienteForm.correo.toLowerCase() && 
            (!this.isEditing || c.id_usuario !== this.clienteForm.id_usuario)
        );
        
        if (existeEmail) {
          this.validationErrors.correo = "Este correo ya está registrado";
          isValid = false;
        }
        
        // Validar contraseña solo si está en modo edición de contraseña o creando nuevo cliente
        if ((this.isPassEdit || !this.isEditing) && !this.clienteForm.password) {
          this.validationErrors.password = "La contraseña es obligatoria";
          isValid = false;
        }
        
        if ((this.isPassEdit || !this.isEditing) && 
            this.clienteForm.password !== this.clienteForm.confirmPassword) {
          this.validationErrors.confirmPassword = "Las contraseñas no coinciden";
          isValid = false;
        }
  
        return isValid;
      },
      validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      },
      guardarCliente() {
        // Validar formulario
        if (!this.validarFormulario()) {
          // Mostrar primer error
          const primerError = Object.values(this.validationErrors)[0];
          alert(primerError);
          return;
        }
  
        // Combinar prefijo y número de teléfono
        this.clienteForm.telefono = this.selectedCountryCode + this.clienteForm.telefono.replace(/^\+\d+/, '');
        
        // Simulación de guardado
        this.isLoading = true;
        
        setTimeout(() => {
          if (this.isEditing) {
            // Actualizar cliente existente
            const index = this.clientes.findIndex(c => c.id_usuario === this.clienteForm.id_usuario);
            if (index !== -1) {
              // Si la contraseña está vacía y no está en modo edición de contraseña, no la actualizamos
              if (!this.isPassEdit) {
                const passwordOriginal = this.clientes[index].password;
                this.clienteForm.password = passwordOriginal;
              }
              
              this.clientes.splice(index, 1, { ...this.clienteForm });
            }
            alert("Cliente actualizado correctamente");
          } else {
            // Crear nuevo cliente
            const newId = Math.max(...this.clientes.map(c => c.id_usuario), 0) + 1;
            const nuevoCliente = { 
              ...this.clienteForm, 
              id_usuario: newId
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
        // Separar el prefijo y número de teléfono
        const telefonoCompleto = cliente.telefono || '';
        const prefijos = ['+504', '+1', '+52', '+34'];
        let prefijoEncontrado = prefijos.find(prefijo => telefonoCompleto.startsWith(prefijo));
        
        this.selectedCountryCode = prefijoEncontrado || '+504';
        const numeroSinPrefijo = telefonoCompleto.replace(this.selectedCountryCode, '');
        
        // Clonar el cliente
        this.clienteForm = { 
          ...cliente,
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