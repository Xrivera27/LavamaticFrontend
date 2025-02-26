// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importamos el router
import '@fortawesome/fontawesome-free/css/all.css'

// Importar Toast
import Toast from "vue-toastification";
// Importar los estilos base del toast
import "vue-toastification/dist/index.css";
// Importar nuestros estilos personalizados para los toast
import "@/assets/css/toast.css";

// Opciones del toast personalizado
const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: true,
  icon: true,
  rtl: false,
  maxToasts: 3,
  transition: {
    enter: 'Vue-Toastification__fade-enter',
    leave: 'Vue-Toastification__fade-leave',
    move: 'Vue-Toastification__move'
  }
};

const app = createApp(App)
app.use(router) // Usamos el router
app.use(Toast, toastOptions); // Usamos Toast con opciones personalizadas

app.mount('#app')