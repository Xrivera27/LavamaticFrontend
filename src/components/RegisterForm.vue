<template>
    <div class="auth-container">
      <div class="auth-form">
        <h2>Crear Cuenta</h2>
        <input type="text" v-model="registerName" placeholder="Nombre" />
        <input type="email" v-model="registerEmail" placeholder="Correo electrónico" />
        <input type="password" v-model="registerPassword" placeholder="Contraseña" />
        <button @click="register">Registrarse</button>
        <p>¿Ya tienes una cuenta? <a href="#" @click.prevent="$emit('switch-to-login')">Inicia Sesión</a></p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RegisterForm',
    data() {
      return {
        registerName: "",
        registerEmail: "",
        registerPassword: "",
      };
    },
    methods: {
      register() {
        alert(`Registrando usuario: ${this.registerName} con email: ${this.registerEmail}`);
      },
    },
  };
  </script>
  
  <style src="@/assets/css/loginStyle.css" scoped></style>