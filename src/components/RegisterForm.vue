<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Crear Cuenta</h2>
      <input 
        type="text" 
        v-model="form.nombre" 
        placeholder="Nombre completo" 
        required
      />

      <input 
        type="email" 
        v-model="form.email" 
        placeholder="Correo electrónico" 
        required
      />

      <div class="password-container">
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="form.password" 
          placeholder="Contraseña" 
          required
        />
        <button 
          type="button" 
          class="toggle-password"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? '🔒' : '👁️' }}
        </button>
      </div>

      <input 
        type="tel" 
        v-model="form.telefono" 
        placeholder="Teléfono" 
        required
      />

      <input  
        v-model="form.direccion" 
        placeholder="Dirección completa"
        rows="3"
        required
      >
      <button @click="register" :disabled="loading || !isFormValid" class="register-button">
        {{ loading ? 'Procesando...' : 'Registrarse' }}
      </button>
      <p>¿Ya tienes una cuenta? <router-link to="/login">Inicia Sesión</router-link></p>
    </div>
  </div>
</template>

<script>
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: 'RegisterForm',
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      form: {
        nombre: "",
        email: "",
        password: "",
        telefono: "",
        direccion: "",
      },
      showPassword: false,
      loading: false
    };
  },
  computed: {
    isFormValid() {
      return this.form.nombre && 
             this.form.email && 
             this.form.password && 
             this.form.telefono && 
             this.form.direccion;
    }
  },
  methods: {
    async register() {
      if (!this.isFormValid) {
        this.toast.error("Por favor, complete todos los campos");
        return;
      }

      this.loading = true;

      try {
        // Validaciones básicas de formato
        if (!this.validateEmail(this.form.email)) {
          this.toast.error("Email inválido");
          this.loading = false;
          return;
        }

        if (this.form.password.length < 6) {
          this.toast.error("La contraseña debe tener al menos 6 caracteres");
          this.loading = false;
          return;
        }

        // Creamos el objeto de datos a enviar
        const userData = {
          ...this.form,
          id_rol: 2, // Rol de cliente
          activo: true
        };

        // Enviamos la solicitud al backend
        await api.auth.register(userData);
        
        // Mostramos mensaje de éxito
        this.toast.success("Registro exitoso. Ya puedes iniciar sesión");
        
        // Redireccionamos al login después de un breve delay
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      } catch (error) {
        console.error('Error en registro:', error);
        
        // Extraer el mensaje de error
        let errorMsg = "Error al registrar usuario";
        
        if (error.response && error.response.data) {
          errorMsg = error.response.data.error || errorMsg;
        } else if (error.error) {
          errorMsg = error.error;
        }
        
        this.toast.error(errorMsg);
      } finally {
        this.loading = false;
      }
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  },
};
</script>

<style src="@/assets/css/loginStyle.css" scoped></style>