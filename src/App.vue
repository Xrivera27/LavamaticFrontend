<template>
  <div id="app">
    <AuthPage />
  </div>
</template>

<script>
import AuthPage from './components/AuthPage.vue';

export default {
  name: 'App',
  components: {
    AuthPage
  }
}
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}
</style>