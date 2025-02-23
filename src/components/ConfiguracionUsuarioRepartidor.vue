<template>
    <div class="page-layout">
      <Sidebarcliente @sidebar-toggle="handleSidebarToggle" />
      <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
        <div class="header">
          <div class="logo">
            <i class="fa-solid fa-shirt"></i>
            <span>Lavamatic</span>
          </div>
          <div class="notifications">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </div>
          <div class="user-info">
            <span>Gerson Rivera</span>
            <span class="user-role">Cliente</span>
          </div>
        </div>
  
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
                  <input 
                    type="password" 
                    id="currentPassword" 
                    v-model="passwordForm.currentPassword" 
                    placeholder="Ingresa tu contraseña actual"
                  />
                </div>
  
                <div class="form-group">
                  <label for="newPassword">Nueva contraseña</label>
                  <input 
                    type="password" 
                    id="newPassword" 
                    v-model="passwordForm.newPassword" 
                    placeholder="Ingresa tu nueva contraseña"
                  />
                </div>
  
                <div class="form-group">
                  <label for="confirmPassword">Confirmar contraseña</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    v-model="passwordForm.confirmPassword" 
                    placeholder="Confirma tu nueva contraseña"
                  />
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
  import Sidebarcliente from './SidebarRepartidor.vue'
  
  export default {
    name: 'ConfiguracionUsuario',
    components: {
      Sidebarcliente
    },
    data() {
      return {
        isSidebarExpanded: false,
        usuario: {
          nombre: 'Gerson Rivera',
          email: 'gerson.rivera@ejemplo.com',
          telefono: '9876-5432',
          direccion: 'Colonia Las Brisas, Calle Principal, Casa #123, Tegucigalpa, Honduras'
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
    mounted() {
      // Guardar una copia del estado original del formulario para posible cancelación
      this.formOriginal = JSON.parse(JSON.stringify(this.usuario));
    },
    methods: {
      handleSidebarToggle(expanded) {
        this.isSidebarExpanded = expanded;
      },
      guardarCambios() {
        // Validar contraseñas si el usuario está intentando cambiarlas
        if (this.passwordForm.newPassword || this.passwordForm.confirmPassword) {
          if (!this.passwordForm.currentPassword) {
            this.passwordError = 'Debes ingresar tu contraseña actual';
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
        }
        
        // Aquí iría la lógica para enviar los datos al backend
        alert('Cambios guardados exitosamente');
        
        // Actualizar el estado original del formulario
        this.formOriginal = JSON.parse(JSON.stringify(this.usuario));
        
        // Limpiar formulario de contraseña
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.passwordError = '';
      },
      resetForm() {
        // Restaurar el formulario a su estado original
        this.usuario = JSON.parse(JSON.stringify(this.formOriginal));
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.passwordError = '';
      }
    }
  };
  </script>
  
  <style src="@/assets/css/ConfiguserRepartidor.css" scoped></style>