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
      <button @click="register" :disabled="!isFormValid">Registrarse</button>
      <p>¿Ya tienes una cuenta? <a href="#" @click.prevent="$emit('switch-to-login')">Inicia Sesión</a></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        nombre: "",
        email: "",
        password: "",
        telefono: "",
        direccion: "",
      },
      showPassword: false
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
    register() {
      if (!this.isFormValid) {
        alert('Por favor, complete todos los campos');
        return;
      }

      const userData = {
        ...this.form,
        id_rol: 2,
        activo: true,
        fecha_creacion: new Date().toISOString()
      };

      console.log('Datos de registro:', userData);
      alert(`Registrando usuario: ${this.form.nombre} con email: ${this.form.email}`);
    },
  },
};
</script>



<style src="@/assets/css/loginStyle.css" scoped></style>