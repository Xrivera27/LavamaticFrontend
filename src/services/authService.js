// src/services/authService.js
import api from './apiService';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.data.token) {
        // Guardamos en sessionStorage para mantener consistencia
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userRole', response.data.user.id_rol);
        sessionStorage.setItem('userName', response.data.user.nombre || '');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error de login:', error);
      
      // Manejo específico para respuestas de error del servidor
      if (error.response) {
        // Si el servidor respondió con un código de error
        const errorData = error.response.data;
        console.log('Datos de error:', errorData);
        
        // El error puede venir en diferentes formatos según el backend
        if (typeof errorData === 'object') {
          throw errorData; // Si es un objeto, lo devolvemos tal cual
        } else {
          throw { error: errorData }; // Si es un string, lo convertimos a objeto
        }
      } else if (error.request) {
        // Si la petición fue hecha pero no se recibió respuesta
        throw { error: 'No se recibió respuesta del servidor' };
      } else {
        // Si ocurrió un error al configurar la petición
        throw { error: error.message || 'Error desconocido' };
      }
    }
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
  }

  async resetPassword(email) {
    try {
      const response = await api.auth.resetPassword(email);
      return response.data;
    } catch (error) {
      // Manejo similar al login para los errores
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          throw errorData;
        } else {
          throw { error: errorData };
        }
      } else if (error.request) {
        throw { error: 'No se recibió respuesta del servidor' };
      } else {
        throw { error: error.message || 'Error desconocido' };
      }
    }
  }

  getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('user'));
  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getUserRole() {
    return parseInt(sessionStorage.getItem('userRole'));
  }

  hasRole(roleId) {
    const userRole = this.getUserRole();
    return userRole === roleId;
  }
}

export default new AuthService();