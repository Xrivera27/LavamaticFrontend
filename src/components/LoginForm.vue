<template>
  <div>
    <!-- Vista de Login -->
    <div v-if="!isRecoveryMode" class="auth-container">
      <div class="auth-form">
        <h2>Iniciar Sesión</h2>
        <div class="input-group">
          <input 
            type="email" 
            v-model="loginEmail" 
            placeholder="Correo electrónico" 
          />
          
          <div class="password-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginPassword" 
              placeholder="Contraseña" 
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🔒' : '👁️' }}
            </button>
          </div>
        </div>

        <button @click="login" class="login-button" :disabled="loading">
          {{ loading ? 'Cargando...' : 'Iniciar Sesión' }}
        </button>
        <div class="links-container">
          <a href="#" class="forgot-password" @click.prevent="switchToRecovery">¿Olvidaste tu contraseña?</a>
          <p class="register-text">¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link></p>
        </div>
      </div>
    </div>

    <!-- Vista de Recuperación -->
    <div v-else class="auth-container same-position">
      <div class="auth-form">
        <h2>Recuperar Contraseña</h2>
        <div class="input-group">
          <p class="recovery-text">Ingresa tu correo electrónico para recibir un enlace de recuperación</p>
          <input 
            type="email" 
            v-model="recoveryEmail" 
            placeholder="Correo electrónico" 
          />
        </div>

        <button @click="sendRecoveryEmail" class="login-button" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar enlace' }}
        </button>
        <div class="links-container">
          <a href="#" class="back-to-login" @click.prevent="switchToLogin">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/authService';
import { useToast } from "vue-toastification";

export default {
  name: 'LoginForm',
  setup() {
    // Usar el toast a través del composable
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      loginEmail: "",
      loginPassword: "",
      showPassword: false,
      isRecoveryMode: false,
      recoveryEmail: "",
      loading: false
    };
  },
  methods: {
    async login() {
      this.loading = true;
      
      try {
        if (!this.loginEmail || !this.loginPassword) {
          this.toast.error("Por favor, completa todos los campos");
          this.loading = false;
          return;
        }

        const response = await AuthService.login(this.loginEmail, this.loginPassword);
        console.log('Login exitoso:', response);
        
        // Notificación de éxito
        this.toast.success("Inicio de sesión exitoso");
        
        // Redireccionar según el rol
        if (response.user && response.user.id_rol) {
          const role = response.user.id_rol;
          console.log('Rol del usuario:', role);
          
          try {
            if (role === 1) {
              console.log('Redirigiendo a admin/dashboard');
              this.$router.push('/admin/dashboard');
            } else if (role === 2) {
              console.log('Redirigiendo a dashboard');
              this.$router.push('/dashboard');
            } else if (role === 3) {
              console.log('Redirigiendo a repartidor/pedidos');
              this.$router.push('/repartidor/pedidos');
            }
          } catch (routerError) {
            console.error('Error de navegación:', routerError);
            this.toast.error("Error de navegación: " + routerError.message);
            
            // Plan B: usar navegación directa si el router falla
            if (role === 1) {
              window.location.href = '/admin/dashboard';
            } else if (role === 2) {
              window.location.href = '/dashboard';
            } else if (role === 3) {
              window.location.href = '/repartidor/pedidos';
            }
          }
        } else {
          this.toast.error("La respuesta del servidor no incluye información del usuario o su rol");
        }
      } catch (error) {
        console.error('Error durante el login:', error);
        
        // Extraer el mensaje de error de diferentes posibles estructuras
        let errorMsg = "Error en la autenticación. Intenta de nuevo.";
        
        if (error) {
          if (typeof error === 'string') {
            errorMsg = error;
          } else if (error.error) {
            errorMsg = error.error;
          } else if (error.message) {
            errorMsg = error.message;
          } else if (error.response && error.response.data) {
            errorMsg = error.response.data.error || "Error en el servidor";
          }
        }
        
        // Mostrar la notificación de error
        this.toast.error(errorMsg);
      } finally {
        this.loading = false;
      }
    },
    switchToRecovery() {
      this.isRecoveryMode = true;
      this.recoveryEmail = this.loginEmail;
    },
    switchToLogin() {
      this.isRecoveryMode = false;
    },
    async sendRecoveryEmail() {
      this.loading = true;
      
      try {
        if (!this.recoveryEmail) {
          this.toast.error('Por favor, ingresa tu correo electrónico');
          this.loading = false;
          return;
        }
        
        const response = await AuthService.resetPassword(this.recoveryEmail);
        this.toast.success(response.message || "Se ha enviado un enlace de recuperación a tu correo");
        
        // Volvemos al login después de 3 segundos
        setTimeout(() => {
          this.switchToLogin();
        }, 3000);
      } catch (error) {
        console.error('Error de recuperación:', error);
        
        // Extraer el mensaje de error
        let errorMsg = "Error al solicitar recuperación de contraseña";
        
        if (error) {
          if (typeof error === 'string') {
            errorMsg = error;
          } else if (error.error) {
            errorMsg = error.error;
          } else if (error.message) {
            errorMsg = error.message;
          } else if (error.response && error.response.data) {
            errorMsg = error.response.data.error || "Error en el servidor";
          }
        }
        
        this.toast.error(errorMsg);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style src="@/assets/css/loginStyle.css" scoped></style>