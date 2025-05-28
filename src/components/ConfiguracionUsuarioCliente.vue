<template>
  <div class="page-layout">
    <SidebarDinamico @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">

      <div class="configuracion-container">
        <h1 class="page-title">Configuración de Usuario</h1>
        
        <div class="profile-section">
          <div class="profile-header">
            <div class="profile-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="profile-name">
              <h2>{{ usuario.nombre }}</h2>
              <p>{{ usuario.email }}</p>
            </div>
          </div>

          <div class="form-container">
            <h3>Información Personal</h3>
            <form @submit.prevent="guardarCambios">
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="usuario.nombre" 
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Correo electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="usuario.email" 
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input 
                  type="tel" 
                  id="telefono" 
                  v-model="usuario.telefono" 
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div class="form-group">
                <label for="direccion">Dirección</label>
                <textarea 
                  id="direccion" 
                  v-model="usuario.direccion" 
                  placeholder="Tu dirección completa"
                  rows="3"
                ></textarea>
              </div>

              <h3>Cambiar Contraseña</h3>
              
              <div class="form-group">
                <label for="currentPassword">Contraseña actual</label>
                <div class="password-input-container">
                  <input 
                    :type="showCurrentPassword ? 'text' : 'password'" 
                    id="currentPassword" 
                    v-model="passwordForm.currentPassword" 
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i class="fa-solid" :class="showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="newPassword">Nueva contraseña</label>
                <div class="password-input-container">
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    id="newPassword" 
                    v-model="passwordForm.newPassword" 
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i class="fa-solid" :class="showNewPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar contraseña</label>
                <div class="password-input-container">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    id="confirmPassword" 
                    v-model="passwordForm.confirmPassword" 
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button 
                    type="button" 
                    class="toggle-password" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i class="fa-solid" :class="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
                <span class="error-message" v-if="passwordError">{{ passwordError }}</span>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-cancelar" @click="resetForm">Cancelar</button>
                <button type="submit" class="btn-guardar">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarDinamico from './SidebarDinamico.vue'
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: 'ConfiguracionUsuario',
  components: {
    SidebarDinamico
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      isSidebarExpanded: false,
      isLoading: true,
      isSaving: false,
      isChangingPassword: false,
      isDeactivating: false,
      showDesactivarModal: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      notificaciones: 0,
      usuario: {
        id_usuario: null,
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        id_rol: null
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordError: '',
      formOriginal: null
    }
  },
  computed: {
    rolUsuario() {
      const roles = {
        1: 'Administrador',
        2: 'Cliente',
        3: 'Repartidor'
      };
      return roles[this.usuario.id_rol] || 'Usuario';
    }
  },
  mounted() {
    this.cargarDatosUsuario();
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    async cargarDatosUsuario() {
      this.isLoading = true;
      try {
        const response = await api.config.getProfile();
        if (response && response.data) {
          this.usuario = response.data;
          // Guardar una copia del estado original del formulario para posible cancelación
          this.formOriginal = JSON.parse(JSON.stringify(this.usuario));
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        this.toast.error('No se pudo cargar la información del usuario');
      } finally {
        this.isLoading = false;
      }
    },
    
    async guardarCambios() {
      this.isSaving = true;
      try {
        const { nombre, email, telefono, direccion } = this.usuario;
        const response = await api.config.updateProfile({ 
          nombre, 
          email, 
          telefono, 
          direccion 
        });
        
        if (response && response.data) {
          this.usuario = response.data.user;
          this.formOriginal = JSON.parse(JSON.stringify(this.usuario));
          this.toast.success('Perfil actualizado correctamente');
        }
        
        // Si se ingresaron datos de contraseña, intentar cambiarla también
        if (this.passwordForm.currentPassword && this.passwordForm.newPassword) {
          await this.cambiarPassword();
        }
      } catch (error) {
        console.error('Error al guardar cambios:', error);
        const errorMsg = error.response?.data?.error || 'Error al actualizar perfil';
        this.toast.error(errorMsg);
      } finally {
        this.isSaving = false;
      }
    },
    
    async cambiarPassword() {
      // Validar contraseñas
      if (!this.passwordForm.currentPassword) {
        this.passwordError = 'Debes ingresar tu contraseña actual';
        return;
      }
      
      if (!this.passwordForm.newPassword) {
        this.passwordError = 'Debes ingresar una nueva contraseña';
        return;
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = 'Las contraseñas no coinciden';
        return;
      }
      
      if (this.passwordForm.newPassword.length < 6) {
        this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }
      
      this.isChangingPassword = true;
      this.passwordError = '';
      
      try {
        const response = await api.config.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        });
        
        if (response) {
          this.resetPasswordForm();
          this.toast.success('Contraseña actualizada correctamente');
        }
      } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        const errorMsg = error.response?.data?.error || 'Error al cambiar contraseña';
        this.passwordError = errorMsg;
        this.toast.error(errorMsg);
      } finally {
        this.isChangingPassword = false;
      }
    },
    
    resetForm() {
      // Restaurar el formulario a su estado original
      this.usuario = JSON.parse(JSON.stringify(this.formOriginal));
      this.resetPasswordForm();
    },
    
    resetPasswordForm() {
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.passwordError = '';
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
    },
    
    mostrarConfirmacionDesactivar() {
      this.showDesactivarModal = true;
    },
    
    async desactivarCuenta() {
      this.isDeactivating = true;
      try {
        const response = await api.config.deactivateAccount();
        
        if (response && response.data) {
          this.toast.success('Cuenta desactivada correctamente');
          
          // Si debe cerrar sesión, redirigir al login
          if (response.data.shouldLogout) {
            setTimeout(() => {
              // Limpiar datos de sesión
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('user');
              sessionStorage.removeItem('userRole');
              // Redirigir al login
              this.$router.push('/login');
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error al desactivar cuenta:', error);
        const errorMsg = error.response?.data?.error || 'Error al desactivar cuenta';
        this.toast.error(errorMsg);
        this.showDesactivarModal = false;
      } finally {
        this.isDeactivating = false;
      }
    }
  }
};
</script>

<style src="@/assets/css/ConfiguserCliente.css" scoped>
/* Agrega estos estilos dentro de tu archivo CSS o aquí mismo */

</style>