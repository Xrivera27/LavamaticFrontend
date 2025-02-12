import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importamos el router

const app = createApp(App)
app.use(router) // Usamos el router
app.mount('#app')