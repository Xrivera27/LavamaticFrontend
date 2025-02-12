<template>
    <div class="empleados-wrapper">
      <ModalLoading :isLoading="isLoading" />
      <PageHeader :titulo="titulo" />
  
      <div class="opciones">
        <button
          id="btnAdd"
          class="btn btn-primary"
          @click="openModal"
          style="width: 200px; white-space: nowrap"
        >
          Agregar Usuario
        </button>
  
        <div class="search-bar">
          <input
            class="busqueda"
            type="text"
            v-model="searchQuery"
            placeholder="Buscar empleado..."
          />
        </div>
  
        <div class="registros" v-if="sucursales.length > 1">
          <span>
            <select class="custom-select" v-model="searchSucursal">
              <option value="default" selected>Todas</option>
              <option
                v-for="(sucursal, index) in this.sucursales"
                :key="index"
                :value="sucursal.id_sucursal"
              >
                {{ sucursal.nombre_administrativo }}
              </option>
            </select>
          </span>
        </div>
      </div>
  
      <div class="table-container">
        <div v-if="isLoading" class="loading-indicator">
          Cargando empleados...
        </div>
  
        <div v-else-if="paginatedEmpleados.length === 0" class="no-data">
          No se encontraron empleados para mostrar.
        </div>
  
        <table v-else class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Nombre Usuario</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Rol</th>
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
              <td data-label="Nombre Usuario">{{ empleado.nombre_usuario }}</td>
              <td data-label="Teléfono">{{ empleado.telefono }}</td>
              <td data-label="Email">{{ empleado.correo }}</td>
              <td data-label="Rol">{{ getRol(empleado.id_rol) }}</td>
              <td data-label="Acciones">
                <button
                  id="btnEditar"
                  class="btn btn-warning"
                  @click="editEmpleado(empleado)"
                >
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button
                  id="btnEliminar"
                  class="btn btn-danger"
                  @click="deleteUsuariol(empleado)"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="pagination-wrapper">
          <div class="pagination-info">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} a
            {{ Math.min(currentPage * pageSize, filteredEmpleados.length) }} de
            {{ filteredEmpleados.length }} registros
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
            <p>¿Estás seguro de que quieres eliminar este usuario?</p>
          </div>
          <div class="modal-footer">
            <div class="action-buttons">
              <btnGuardarModal
                texto="Sí, eliminar"
                style="background-color: red"
                @click="deleteUsuariol(empleado)"
              />
              <btnCerrarModal texto="No, regresar" @click="cancelDelete" />
            </div>
          </div>
        </div>
      </div>
  
      <div v-if="isModalOpen" class="modal">
        <div class="modal-usuario">
          <div class="modal-header">
            <h2 class="h2-modal-content">
              {{ isEditing ? "Editar Usuario" : "Agregar Usuario" }}
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
                <label>Nombre de Usuario:</label>
                <input
                  v-model="usuarioForm.nombre_usuario"
                  type="text"
                  required
                />
              </div>
  
              <div class="form-group">
                <label>Correo:</label>
                <input v-model="usuarioForm.correo" type="text" required />
              </div>
  
              <div class="form-group">
                <label for="rol">Selecciona rol:</label>
                <select
                  class="form-select"
                  id="rol"
                  name="rol"
                  value="default"
                  v-model="usuarioForm.rol"
                  required
                >
                  <option value="" disabled selected>Selecciona un rol</option>
                  <option
                    v-for="(rol, index) in roles"
                    :key="index"
                    :value="rol.id_rol"
                  >
                    {{ rol.cargo }}
                  </option>
                </select>
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
                    <i
                      :class="
                        showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'
                      "
                    ></i>
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
                    <i
                      :class="
                        showConfirmPassword
                          ? 'bi bi-eye-slash-fill'
                          : 'bi bi-eye-fill'
                      "
                    ></i>
                  </button>
                </div>
              </div>
  
              <div class="form-group">
                <label>Teléfono:</label>
                <div class="phone-input-container">
                  <select
                    v-model="selectedCountry"
                    @change="updatePhoneValidation"
                    class="select-phone"
                  >
                    <option value="">País</option>
                    <option
                      v-for="(country, code) in countryData"
                      :key="code"
                      :value="code"
                    >
                      {{ country.emoji }} {{ country.code }}
                    </option>
                  </select>
                  <input
                    v-model="usuarioForm.telefono"
                    type="text"
                    class="input-phone"
                    :placeholder="'Número (' + phoneLength + ' dígitos)'"
                    required
                  />
                </div>
              </div>
  
              <div class="form-group">
                <label>Dirección:</label>
                <input v-model="usuarioForm.direccion" type="text" required />
              </div>
  
              <div class="form-group" v-if="sucursales.length > 1">
                <label for="sucursal">Selecciona sucursal:</label>
                <select
                  class="form-select"
                  id="sucursal"
                  name="sucursal"
                  value="default"
                  v-model="usuarioForm.sucursal"
                  required
                >
                  <option value="" disabled selected>
                    Selecciona una sucursal
                  </option>
                  <option
                    v-for="(sucursal, index) in sucursales"
                    :key="index"
                    :value="sucursal.id_sucursal"
                  >
                    {{ sucursal.nombre_administrativo }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="action-buttons">
              <btnGuardarModal
                :texto="isEditing ? 'Guardar Cambios' : 'Agregar Usuario'"
                @click="guardarUsuario"
                type="submit"
              >
              </btnGuardarModal>
              <btnCerrarModal
                :texto="'Cerrar'"
                @click="closeModal"
              ></btnCerrarModal>
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
  </template>
  
  <script>
  import btnGuardarModal from "../components/botones/modales/btnGuardar.vue";
  import btnCerrarModal from "../components/botones/modales/btnCerrar.vue";
  import solicitudes from "../../services/solicitudes.js";
  import { notis } from "../../services/notificaciones.js";
  const {
    esCeo,
    getUsuariosEmpresa,
    getRolesUsuarioPage,
    getUsuariosSucrusal,
  } = require("../../services/usuariosSolicitudes");
  import PageHeader from "@/components/PageHeader.vue";
  import { getSucursalesbyEmmpresaSumm } from "../../services/sucursalesSolicitudes.js";
  import { COUNTRY_CODES } from "../../services/countrySelector.js";
  import { validacionesUsuario } from "../../services/validarCampos.js";
  import ModalLoading from "@/components/ModalLoading.vue";
  import { setPageTitle } from "@/components/pageMetadata";
  
  export default {
    name: "AdministrarEmpleados",
    components: {
      btnGuardarModal,
      btnCerrarModal,
      PageHeader,
      ModalLoading,
    },
    data() {
      return {
        showConfirmModal: false,
        empleadoToDelete: null,
        titulo: "Usuarios",
        isLoading: false,
        showTooltip: false,
        searchQuery: "",
        searchSucursal: "default",
        id_usuario: 0,
        isModalOpen: false,
        isEditing: false,
        isPassEdit: true,
        showPassword: false,
        showConfirmPassword: false,
        selectedCountry: "HN",
        countryData: COUNTRY_CODES,
        phoneLength: 8,
        editIndex: null,
        currentPage: 1,
        pageSize: 10,
        sucursales: [],
        esCeo: false,
        roles: [],
        usuarioForm: {
          id_usuario: 0,
          nombre: "",
          apellido: "",
          nombre_usuario: "",
          correo: "",
          telefono: "",
          direccion: "",
          sucursal: "",
          password: "",
          confirmPassword: "",
          rol: "",
        },
        empleados: [],
      };
    },
    computed: {
      filteredEmpleados() {
        return this.empleados
          .filter(
            (empleado) =>
              empleado.sucursales == this.searchSucursal ||
              this.searchSucursal === "default"
          )
          .filter(
            (empleado) =>
              empleado.nombre
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              empleado.apellido
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase()) ||
              empleado.nombre_usuario
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
        return Math.ceil(this.filteredEmpleados.length / this.pageSize);
      },
    },
    methods: {
      updatePhoneValidation() {
        if (this.selectedCountry && this.countryData[this.selectedCountry]) {
          this.phoneLength = this.countryData[this.selectedCountry].length;
        }
      },
      openModal() {
        this.isModalOpen = true;
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
          id_usuario: "",
          nombre: "",
          apellido: "",
          nombre_usuario: "",
          correo: "",
          telefono: "",
          direccion: "",
          sucursal: "",
          password: "",
          confirmPassword: "",
          rol: "",
        };
        this.isEditing = false;
        this.editIndex = null;
        this.isPassEdit = true;
        this.showPassword = false;
        this.showConfirmPassword = false;
      },
      getRol(id_rol) {
        const rol = this.roles.find((rol) => rol.id_rol === id_rol);
        return rol ? rol.cargo : "Desconocido";
      },
      async getUsuarios(sucursales) {
        try {
          if (sucursales.length === 1) {
            this.empleados = await getUsuariosSucrusal(
              this.id_usuario,
              sucursales[0].id_sucursal
            );
            this.searchSucursal = sucursales[0].id_sucursal;
            this.usuarioForm.sucursal = sucursales[0].id_sucursal;
          } else {
            this.empleados = await getUsuariosEmpresa(this.id_usuario);
          }
        } catch (error) {
          notis("error", "Error al obtener usuarios.");
        }
      },
      editarPassword() {
        this.isPassEdit = true;
      },
      async guardarUsuario() {
        if (
          !(await validacionesUsuario.validarCampos(
            this.usuarioForm,
            this.isPassEdit,
            this.selectedCountry,
            this.isEditing
          ))
        ) {
          return;
        }
  
        this.isLoading = true;
  
        try {
          let response;
          let parametros;
  
          if (this.isEditing) {
            parametros = `/usuario/actualizar/${
              this.empleados[this.editIndex].id_usuario
            }`;
            response = await solicitudes.patchRegistro(
              parametros,
              this.limpiarForm(this.usuarioForm)
            );
  
            if (response === true) {
              notis("success", "Actualizando datos del usuario...");
              Object.assign(this.empleados[this.editIndex], this.usuarioForm);
            } else {
              notis("error", response);
            }
          } else {
            parametros = `/usuario/crear`;
            response = await solicitudes.postRegistro(
              parametros,
              this.limpiarForm(this.usuarioForm)
            );
  
            if (response.length > 0) {
              notis("success", "Usuario guardado correctamente...");
              this.empleados.push(response[0]);
            } else {
              throw response;
            }
          }
  
          this.closeModal();
        } catch (error) {
          notis("error", error.message);
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
      async deleteUsuariol(empleado) {
        if (!this.showConfirmModal) {
          this.empleadoToDelete = empleado;
          this.showConfirmModal = true;
          return;
        }
  
        this.isLoading = true;
        try {
          const parametros = `/usuario/desactivar/${this.empleadoToDelete.id_usuario}`;
          const response = await solicitudes.desactivarRegistro(parametros, {
            estado: false,
          });
  
          if (response === true) {
            const index = this.empleados.findIndex(
              (e) => e.id_usuario === this.empleadoToDelete.id_usuario
            );
            if (index !== -1) {
              this.empleados.splice(index, 1);
            }
            notis("success", "Usuario eliminado correctamente");
          }
        } catch (error) {
          notis("error", error.message);
        } finally {
          this.isLoading = false;
          this.showConfirmModal = false;
          this.empleadoToDelete = null;
        }
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
        this.usuarioForm.sucursal = empleado.sucursales;
        this.usuarioForm.rol = empleado.id_rol;
        this.isEditing = true;
        this.isPassEdit = false;
        this.openModal();
      },
  
      limpiarForm(formulario) {
        return {
          nombre: formulario.nombre,
          apellido: formulario.apellido,
          nombre_usuario: formulario.nombre_usuario,
          correo: formulario.correo,
          telefono: formulario.telefono,
          direccion: formulario.direccion,
          id_sucursal: formulario.sucursal,
          contraseña: formulario.password,
          id_rol: formulario.rol,
        };
      },
  
      changeFavicon(iconPath) {
        const link =
          document.querySelector("link[rel*='icon']") ||
          document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "icon";
        link.href = iconPath;
        document.getElementsByTagName("head")[0].appendChild(link);
      },
    },
    watch: {
      searchQuery() {
        this.currentPage = 1;
      },
      searchSucursal() {
        this.currentPage = 1;
      },
    },
    async mounted() {
      this.isLoading = true;
      setPageTitle("Usuarios");
  
      try {
        this.id_usuario = await solicitudes.solicitarUsuarioToken();
        this.esCeo = await esCeo(this.id_usuario);
        this.sucursales = await getSucursalesbyEmmpresaSumm(this.id_usuario);
        await this.getUsuarios(this.sucursales);
        this.roles = await getRolesUsuarioPage();
      } catch (error) {
        notis("error", error.message);
      } finally {
        this.isLoading = false;
      }
    },
  };
  </script>

<style src="@/assets/css/crearRepartidorStyle.css" scoped></style>  