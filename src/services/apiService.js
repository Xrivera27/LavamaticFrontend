// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Agregar interceptor para incluir token en cada solicitud
apiClient.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Agregar interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Error en la respuesta:', error);
    
    // Si recibimos un 401 (no autorizado), limpiamos el token y redirigimos a login
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userName');
      
      // Redireccionar a login si no estamos ya en esa página
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Objeto para agrupar los servicios de API
const api = {
  auth: {
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    resetPassword: (email) => apiClient.post('/auth/reset-password', { email }),
    register: (userData) => apiClient.post('/auth/register', userData)
  },
  clients: {
    getAll: () => apiClient.get('/clients'),
    create: (clientData) => apiClient.post('/clients/create', clientData),
    update: (id, clientData) => apiClient.put(`/clients/${id}`, clientData),
    delete: (id) => apiClient.delete(`/clients/${id}`)
  },
  repartidores: {
    getAll: () => apiClient.get('/repartidores'),
    getById: (id) => apiClient.get(`/repartidores/${id}`),
    create: (repartidorData) => apiClient.post('/repartidores', repartidorData),
    update: (id, repartidorData) => apiClient.put(`/repartidores/${id}`, repartidorData),
    delete: (id) => apiClient.delete(`/repartidores/${id}`)
  }
};

// Exportamos tanto la instancia de axios configurada como los servicios agrupados
export { apiClient };
export default api;