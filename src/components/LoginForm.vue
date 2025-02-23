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

        <button @click="login" class="login-button">Iniciar Sesión</button>
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

        <button @click="sendRecoveryEmail" class="login-button">Enviar enlace</button>
        <div class="links-container">
          <a href="#" class="back-to-login" @click.prevent="switchToLogin">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      loginEmail: "",
      loginPassword: "",
      showPassword: false,
      isRecoveryMode: false,
      recoveryEmail: ""
    };
  },
  methods: {
    login() {
      // Simulamos autenticación básica
      let user = null;
      
      // Usuarios para pruebas:
      const users = [
        { email: "admin@lavamatic.com", password: "admin123", id_rol: 1, nombre: "Administrador" },
        { email: "cliente@lavamatic.com", password: "cliente123", id_rol: 2, nombre: "Gerson Rivera" },
        { email: "repartidor@lavamatic.com", password: "repartidor123", id_rol: 3, nombre: "Juan Repartidor" }
      ];
      
      // Buscar el usuario
      user = users.find(u => u.email === this.loginEmail && u.password === this.loginPassword);
      
      if (user) {
        // Guardar información del usuario
        localStorage.setItem('token', 'token-simulado-123');
        localStorage.setItem('userRole', user.id_rol);
        localStorage.setItem('userName', user.nombre);
        
        // Redireccionar según el rol
        if (user.id_rol === 1) {
          this.$router.push('/admin/dashboard');
        } else if (user.id_rol === 2) {
          this.$router.push('/dashboard');
        } else if (user.id_rol === 3) {
          this.$router.push('/repartidor/pedidos'); // Redirige a la vista de pedidos
        }
      } else {
        alert("Credenciales incorrectas. Intenta de nuevo.");
      }
    },
    switchToRecovery() {
      this.isRecoveryMode = true;
      this.recoveryEmail = this.loginEmail;
    },
    switchToLogin() {
      this.isRecoveryMode = false;
      this.recoveryEmail = "";
    },
    sendRecoveryEmail() {
      if (!this.recoveryEmail) {
        alert('Por favor, ingresa tu correo electrónico');
        return;
      }
      alert(`Se enviará un enlace de recuperación a: ${this.recoveryEmail}`);
      this.switchToLogin();
    }
  },
};
</script>

<style src="@/assets/css/loginStyle.css" scoped></style>