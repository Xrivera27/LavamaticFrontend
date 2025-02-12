<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Iniciar Sesión</h2>
      <input type="email" v-model="loginEmail" placeholder="Correo electrónico" />
      <input type="password" v-model="loginPassword" placeholder="Contraseña" />
      <button @click="login">Iniciar Sesión</button>
      <p>¿No tienes una cuenta? <a href="#" @click.prevent="$emit('switch-to-register')">Regístrate</a></p>
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
    };
  },
  methods: {
    login() {
      alert(`Iniciando sesión con: ${this.loginEmail}`);
    },
  },
};
</script>

<style src="@/assets/css/loginStyle.css" scoped></style>