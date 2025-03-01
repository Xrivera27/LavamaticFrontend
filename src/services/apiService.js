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
    getById: (id) => apiClient.get(`/clients/${id}`),
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
  },
  equipos: {
    getAll: () => apiClient.get('/equipos'),
    getById: (id) => apiClient.get(`/equipos/${id}`),
    create: (equipoData) => apiClient.post('/equipos', equipoData),
    update: (id, equipoData) => apiClient.put(`/equipos/${id}`, equipoData),
    delete: (id) => apiClient.delete(`/equipos/${id}`)
  },

  servicios: {
    getAll: () => apiClient.get('/servicios'),
    getById: (id) => apiClient.get(`/servicios/${id}`),
    create: (servicioData) => apiClient.post('/servicios', servicioData),
    update: (id, servicioData) => apiClient.put(`/servicios/${id}`, servicioData),
    delete: (id) => apiClient.delete(`/servicios/${id}`)
  },
  mantenimientos: {
    getAll: () => apiClient.get('/mantenimientos'),
    getById: (id) => apiClient.get(`/mantenimientos/${id}`),
    create: (mantenimientoData) => apiClient.post('/mantenimientos', mantenimientoData),
    update: (id, mantenimientoData) => apiClient.put(`/mantenimientos/${id}`, mantenimientoData),
    delete: (id) => apiClient.delete(`/mantenimientos/${id}`)
  },
  pedidos: {
    getAll: (filtros = {}) => {
      let queryParams = '';
      if (filtros.fechaInicio && filtros.fechaFin) {
        queryParams += `?fechaInicio=${filtros.fechaInicio.toISOString()}&fechaFin=${filtros.fechaFin.toISOString()}`;
      }
      if (filtros.estado) {
        queryParams += queryParams ? `&estado=${filtros.estado}` : `?estado=${filtros.estado}`;
      }
      return apiClient.get(`/pedidos${queryParams}`);
    },
    getPendientes: () => apiClient.get('/pedidos/pendientes'),
    asignarRepartidor: (id_pedido, id_repartidor) => 
      apiClient.put(`/pedidos/${id_pedido}/asignar`, { id_repartidor }),
    volverAEspera: (id_pedido) => apiClient.put(`/pedidos/${id_pedido}/espera`),
    cambiarEstado: (id_pedido, id_estado) => 
      apiClient.put(`/pedidos/${id_pedido}/estado`, { id_estado })
  },
  config: {
    getProfile: () => apiClient.get('/config/profile'),
    updateProfile: (profileData) => apiClient.put('/config/profile', profileData),
    changePassword: (passwordData) => apiClient.put('/config/change-password', passwordData),
    deactivateAccount: () => apiClient.post('/config/deactivate')
  },
  repartidor: {
    // Obtener todos los pedidos asignados al repartidor
    getPedidos: () => apiClient.get('/repartidor/pedidos'),
    
    // Obtener el detalle de un pedido específico
    getPedidoDetalle: (id_pedido) => apiClient.get(`/repartidor/pedidos/${id_pedido}`),
    
    // Actualizar el estado de un pedido
    actualizarEstado: (id_pedido, data) => apiClient.put(`/repartidor/pedidos/${id_pedido}/estado`, data),
    
    // Obtener el historial de entregas
    getHistorial: () => apiClient.get('/repartidor/pedidos/entregas')
  },
  servicioCliente: {
    // Obtener todos los servicios disponibles
    getServicios: () => apiClient.get('/cliente/servicios'),
    
    // Obtener detalle de un servicio específico
    getServicioDetalle: (id) => apiClient.get(`/cliente/servicios/${id}`),
    
    // Obtener horarios disponibles
    getHorarios: () => apiClient.get('/cliente/horarios'),
    
    // Verificar disponibilidad
    verificarDisponibilidad: (data) => apiClient.post('/cliente/disponibilidad', data),
    
    // Crear un nuevo pedido
    crearPedido: (pedidoData) => apiClient.post('/cliente/pedidos', pedidoData),
    
    // Obtener historial de pedidos
    getHistorialPedidos: (estado = '') => {
      let queryParams = estado ? `?estado=${estado}` : '';
      return apiClient.get(`/cliente/pedidos${queryParams}`);
    }
  },
};

// Exportamos tanto la instancia de axios configurada como los servicios agrupados
export { apiClient };
export default api;