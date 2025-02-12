<template>
    <div>
      <LoginForm v-if="!isRegistering" @switch-to-register="toggleForm" />
      <RegisterForm v-else @switch-to-login="toggleForm" />
    </div>
  </template>
  
  <script>
  import LoginForm from './LoginForm.vue'
  import RegisterForm from './RegisterForm.vue'
  import '@/assets/css/loginStyle.css'  // Añade esta línea
  
  export default {
    name: 'AuthPage',
    components: {
      LoginForm,
      RegisterForm
    },
    data() {
      return {
        isRegistering: false,
      };
    },
    methods: {
      toggleForm() {
        this.isRegistering = !this.isRegistering;
      },
    },
  };
  </script>
  
  <style src="@/assets/css/loginStyle.css"></style>