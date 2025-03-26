<template>
  <div class="admin-layout">
    <!-- Modal de carga -->
    <div v-if="cargando" class="loading-modal">
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    </div>
    
    <SidebarAdmin />
    <div class="main-content">
      <div class="reports-container">
        <h1>Reportes del Sistema</h1>
        
        <!-- Sección de filtros con soporte para modo compacto -->
        <div class="reports-filters" :class="{ 'filters-compact': filtersCompact }">
          <div class="filter-section">
            <div class="filter-header">
              <h2>Filtros <span v-if="filtersCompact" class="filter-info">{{ getReportTitle() }} ({{ formatDate(startDate) }} - {{ formatDate(endDate) }})</span></h2>
            </div>
            
            <!-- Filtros detallados que se ocultan en modo compacto -->
            <div class="filter-details" v-show="!filtersCompact">
              <div class="filter-container">
                <div class="filter-row">
                  <div class="filter-col">
                    <div class="filter-label">Tipo de Reporte:</div>
                    <select v-model="reportType" @change="resetFilters" class="form-control">
                      <option value="pedidos">Pedidos</option>
                      <option value="repartidores">Repartidores</option>
                      <option value="clientes">Clientes</option>
                      <option value="equipos">Uso de Equipos</option>
                      <option value="servicios">Servicios Vendidos</option>
                    </select>
                  </div>
                  <div class="filter-col">
                    <div class="filter-label">Rango de Fechas:</div>
                    <div class="date-inputs">
                      <input type="date" v-model="startDate" :max="endDate" class="form-control date-input">
                      <span class="date-separator">hasta</span>
                      <input type="date" v-model="endDate" :min="startDate" class="form-control date-input">
                    </div>
                  </div>
                </div>
                
                <div class="filter-row" v-if="reportType === 'pedidos'">
                  <div class="filter-col">
                    <div class="filter-label">Filtrar por Repartidor:</div>
                    <div class="search-input-container">
                      <input 
                        type="text" 
                        class="form-control search-input" 
                        placeholder="Buscar repartidor..." 
                        v-model="repartidorSearchText"
                        @input="handleRepartidorSearch"
                        list="repartidores-list"
                      >
                      <datalist id="repartidores-list">
                        <option value="">Todos los repartidores</option>
                        <option v-for="repartidor in repartidores" :key="repartidor.id_repartidor" :data-id="repartidor.id_repartidor">
                          {{ repartidor.nombre }}
                        </option>
                      </datalist>
                      <button 
                        v-if="selectedRepartidor" 
                        class="clear-button" 
                        @click="clearRepartidorFilter"
                        title="Limpiar filtro"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div class="filter-col">
                    <div class="filter-label">Estado del Pedido:</div>
                    <div class="search-input-container">
                      <input 
                        type="text" 
                        class="form-control search-input" 
                        placeholder="Buscar estado..." 
                        v-model="estadoSearchText"
                        @input="handleEstadoSearch"
                        list="estados-list"
                      >
                      <datalist id="estados-list">
                        <option value="">Todos los estados</option>
                        <option v-for="estado in estados" :key="estado.id_estado" :data-id="estado.id_estado">
                          {{ estado.nombre_estado }}
                        </option>
                      </datalist>
                      <button 
                        v-if="selectedEstado" 
                        class="clear-button" 
                        @click="clearEstadoFilter"
                        title="Limpiar filtro"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="filter-row" v-if="reportType === 'clientes'">
                  <div class="filter-col">
                    <div class="filter-label">Filtrar por Cliente:</div>
                    <div class="search-input-container">
                      <input 
                        type="text" 
                        class="form-control search-input" 
                        placeholder="Buscar cliente..." 
                        v-model="clienteSearchText"
                        @input="handleClienteSearch"
                        list="clientes-list"
                      >
                      <datalist id="clientes-list">
                        <option value="">Todos los clientes</option>
                        <option v-for="cliente in clientes" :key="cliente.id_usuario" :data-id="cliente.id_usuario">
                          {{ cliente.nombre }}
                        </option>
                      </datalist>
                      <button 
                        v-if="selectedCliente" 
                        class="clear-button" 
                        @click="clearClienteFilter"
                        title="Limpiar filtro"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div class="filter-col">
                    <!-- Columna vacía para mantener el diseño -->
                  </div>
                </div>
              </div>
            </div>
            
            <div class="filter-actions">
              <button class="btn btn-primary" @click="generateReport">
                 Generar Reporte
              </button>
              <button class="btn btn-secondary" @click="resetFilters">
                 Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
        
        <!-- Resultados del Reporte -->
        <div class="reports-result" v-if="allReportData.length > 0">
          <!-- Tabla de resultados para Pedidos -->
          <div class="report-table-container" v-if="reportType === 'pedidos'">
            <div class="report-header">
              <h2>Resultados del Reporte</h2>
              <div class="export-buttons">
                <button class="btn export-btn" @click="exportToExcel">
                  <i class="fas fa-file-excel"></i> Exportar a Excel
                </button>
                <button class="btn export-btn" @click="exportToPDF">
                  <i class="fas fa-file-pdf"></i> Exportar a PDF
                </button>
              </div>
            </div>
            
            <table class="report-table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Cliente</th>
                  <th>Repartidor</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedData" :key="item.id_pedido">
                  <td>{{ item.id_pedido }}</td>
                  <td>{{ item.nombre_cliente }}</td>
                  <td>{{ item.nombre_repartidor }}</td>
                  <td>
                    <span class="estado-badge" :class="getEstadoClass(item.nombre_estado)">
                      {{ item.nombre_estado }}
                    </span>
                  </td>
                  <td>{{ formatDate(item.fecha_creacion) }}</td>
                  <td>{{ item.total }} Lps.</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right"><strong>Total:</strong></td>
                  <td><strong>{{ calculateTotal() }} Lps.</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <!-- Controles de paginación -->
            <div class="pagination-controls" v-if="totalPages > 1">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1" 
                @click="prevPage"
              >
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              
              <div class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }}
              </div>
              
              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages" 
                @click="nextPage"
              >
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <!-- Tabla de resultados para Repartidores -->
          <div class="report-table-container" v-if="reportType === 'repartidores'">
            <div class="report-header">
              <h2>Resultados del Reporte</h2>
              <div class="export-buttons">
                <button class="btn export-btn" @click="exportToExcel">
                  <i class="fas fa-file-excel"></i> Exportar a Excel
                </button>
                <button class="btn export-btn" @click="exportToPDF">
                  <i class="fas fa-file-pdf"></i> Exportar a PDF
                </button>
              </div>
            </div>
            
            <table class="report-table">
              <thead>
                <tr>
                  <th>Repartidor</th>
                  <th>Pedidos Completados</th>
                  <th>Pedidos en Proceso</th>
                  <th>Total Pedidos</th>
                  <th>Promedio Diario</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedData" :key="item.id_repartidor">
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.pedidos_completados }}</td>
                  <td>{{ item.pedidos_en_proceso }}</td>
                  <td>{{ item.total_pedidos }}</td>
                  <td>{{ item.promedio_diario.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
            
            <!-- Controles de paginación -->
            <div class="pagination-controls" v-if="totalPages > 1">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1" 
                @click="prevPage"
              >
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              
              <div class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }}
                <span class="pagination-details">
                  (Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a 
                  {{ Math.min(currentPage * itemsPerPage, allReportData.length) }} 
                  de {{ allReportData.length }} registros)
                </span>
              </div>
              
              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages" 
                @click="nextPage"
              >
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <!-- Tabla de resultados para Clientes -->
          <div class="report-table-container" v-if="reportType === 'clientes'">
            <div class="report-header">
              <h2>Resultados del Reporte</h2>
              <div class="export-buttons">
                <button class="btn export-btn" @click="exportToExcel">
                  <i class="fas fa-file-excel"></i> Exportar a Excel
                </button>
                <button class="btn export-btn" @click="exportToPDF">
                  <i class="fas fa-file-pdf"></i> Exportar a PDF
                </button>
              </div>
            </div>
            
            <table class="report-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Total Pedidos</th>
                  <th>Servicios Favoritos</th>
                  <th>Gasto Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedData" :key="item.id_usuario">
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.total_pedidos }}</td>
                  <td>{{ item.servicios_favoritos }}</td>
                  <td>{{ item.gasto_total }} Lps.</td>
                </tr>
              </tbody>
            </table>
            
            <!-- Controles de paginación -->
            <div class="pagination-controls" v-if="totalPages > 1">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1" 
                @click="prevPage"
              >
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              
              <div class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }}
                <span class="pagination-details">
                  (Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a 
                  {{ Math.min(currentPage * itemsPerPage, allReportData.length) }} 
                  de {{ allReportData.length }} registros)
                </span>
              </div>
              
              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages" 
                @click="nextPage"
              >
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <!-- Tabla de resultados para Equipos -->
          <div class="report-table-container" v-if="reportType === 'equipos'">
            <div class="report-header">
              <h2>Resultados del Reporte</h2>
              <div class="export-buttons">
                <button class="btn export-btn" @click="exportToExcel">
                  <i class="fas fa-file-excel"></i> Exportar a Excel
                </button>
                <button class="btn export-btn" @click="exportToPDF">
                  <i class="fas fa-file-pdf"></i> Exportar a PDF
                </button>
              </div>
            </div>
            
            <table class="report-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Total Usos</th>
                  <th>Horas de Uso</th>
                  <th>Mantenimientos</th>
                  <th>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedData" :key="item.id_equipo">
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.total_usos }}</td>
                  <td>{{ item.horas_uso }}</td>
                  <td>{{ item.mantenimientos }}</td>
                  <td>{{ item.disponibilidad }}%</td>
                </tr>
              </tbody>
            </table>
            
            <!-- Controles de paginación -->
            <div class="pagination-controls" v-if="totalPages > 1">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1" 
                @click="prevPage"
              >
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              
              <div class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }}
                <span class="pagination-details">
                  (Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a 
                  {{ Math.min(currentPage * itemsPerPage, allReportData.length) }} 
                  de {{ allReportData.length }} registros)
                </span>
              </div>
              
              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages" 
                @click="nextPage"
              >
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <!-- Tabla de resultados para Servicios -->
          <div class="report-table-container" v-if="reportType === 'servicios'">
            <div class="report-header">
              <h2>Resultados del Reporte</h2>
              <div class="export-buttons">
                <button class="btn export-btn" @click="exportToExcel">
                  <i class="fas fa-file-excel"></i> Exportar a Excel
                </button>
                <button class="btn export-btn" @click="exportToPDF">
                  <i class="fas fa-file-pdf"></i> Exportar a PDF
                </button>
              </div>
            </div>
            
            <table class="report-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Cantidad Vendida</th>
                  <th>Ingresos</th>
                  <th>Popularidad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedData" :key="item.id_servicio">
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.cantidad_vendida }}</td>
                  <td>{{ item.ingresos }} Lps.</td>
                  <td>{{ item.popularidad }}%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="text-right"><strong>Total:</strong></td>
                  <td><strong>{{ calculateTotalIngresos() }} Lps.</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            
            <!-- Controles de paginación -->
            <div class="pagination-controls" v-if="totalPages > 1">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1" 
                @click="prevPage"
              >
                <i class="fas fa-chevron-left"></i> Anterior
              </button>
              
              <div class="pagination-info">
                Página {{ currentPage }} de {{ totalPages }}
                <span class="pagination-details">
                  (Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a 
                  {{ Math.min(currentPage * itemsPerPage, allReportData.length) }} 
                  de {{ allReportData.length }} registros)
                </span>
              </div>
              
              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages" 
                @click="nextPage"
              >
                Siguiente <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="no-results" v-else-if="showNoResults">
          <p>No se encontraron resultados para los filtros seleccionados.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarAdmin from './SidebarAdmin.vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from 'vue-toastification';
import api from '@/services/apiService';

export default {
  name: 'ReportesAdmin',
  components: {
    SidebarAdmin
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      reportType: 'pedidos',
      startDate: this.getFirstDayOfMonth(),
      endDate: this.getCurrentDate(),
      selectedRepartidor: '',
      selectedEstado: '',
      selectedCliente: '',
      reportData: [],
      showNoResults: false,
      cargando: false,
      
      // Datos para selectores
      repartidores: [],
      estados: [],
      clientes: [],
      
      // Propiedades para paginación
      currentPage: 1,
      itemsPerPage: 7,
      allReportData: [], // Almacena todos los datos para exportación
      
      // Nueva propiedad para filtros compactos
      filtersCompact: false,
      
      // Propiedades para búsqueda en datalists
      repartidorSearchText: '',
      estadoSearchText: '',
      clienteSearchText: ''
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.allReportData.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.allReportData.length / this.itemsPerPage);
    }
  },
  watch: {
    selectedRepartidor(newValue) {
      if (newValue) {
        const repartidor = this.repartidores.find(r => r.id_repartidor == newValue);
        if (repartidor && this.repartidorSearchText !== repartidor.nombre) {
          this.repartidorSearchText = repartidor.nombre;
        }
      } else if (this.repartidorSearchText) {
        this.repartidorSearchText = '';
      }
    },
    
    selectedEstado(newValue) {
      if (newValue) {
        const estado = this.estados.find(e => e.id_estado == newValue);
        if (estado && this.estadoSearchText !== estado.nombre_estado) {
          this.estadoSearchText = estado.nombre_estado;
        }
      } else if (this.estadoSearchText) {
        this.estadoSearchText = '';
      }
    },
    
    selectedCliente(newValue) {
      if (newValue) {
        const cliente = this.clientes.find(c => c.id_usuario == newValue);
        if (cliente && this.clienteSearchText !== cliente.nombre) {
          this.clienteSearchText = cliente.nombre;
        }
      } else if (this.clienteSearchText) {
        this.clienteSearchText = '';
      }
    }
  },
  mounted() {
    this.loadFilterData();
  },
  methods: {
    // Métodos para obtener nombres de filtros seleccionados
    getRepartidorNombre(id) {
      const repartidor = this.repartidores.find(r => r.id_repartidor == id);
      return repartidor ? repartidor.nombre : 'Todos';
    },
    
    getEstadoNombre(id) {
      const estado = this.estados.find(e => e.id_estado == id);
      return estado ? estado.nombre_estado : 'Todos';
    },
    
    getClienteNombre(id) {
      const cliente = this.clientes.find(c => c.id_usuario == id);
      return cliente ? cliente.nombre : 'Todos';
    },
    
    // Toggle filtros expandidos/compactos
    toggleFilters() {
      this.filtersCompact = !this.filtersCompact;
    },
    
    // Métodos para el filtro de repartidores
    handleRepartidorSearch() {
      if (!this.repartidorSearchText) {
        this.selectedRepartidor = '';
        return;
      }
      
      const foundRepartidor = this.repartidores.find(r => 
        r.nombre.toLowerCase() === this.repartidorSearchText.toLowerCase()
      );
      
      if (foundRepartidor) {
        this.selectedRepartidor = foundRepartidor.id_repartidor;
      }
    },
    
    clearRepartidorFilter() {
      this.selectedRepartidor = '';
      this.repartidorSearchText = '';
    },
    
    // Métodos para el filtro de estados
    handleEstadoSearch() {
      if (!this.estadoSearchText) {
        this.selectedEstado = '';
        return;
      }
      
      const foundEstado = this.estados.find(e => 
        e.nombre_estado.toLowerCase() === this.estadoSearchText.toLowerCase()
      );
      
      if (foundEstado) {
        this.selectedEstado = foundEstado.id_estado;
      }
    },
    
    clearEstadoFilter() {
      this.selectedEstado = '';
      this.estadoSearchText = '';
    },
    
    // Métodos para el filtro de clientes
    handleClienteSearch() {
      if (!this.clienteSearchText) {
        this.selectedCliente = '';
        return;
      }
      
      const foundCliente = this.clientes.find(c => 
        c.nombre.toLowerCase() === this.clienteSearchText.toLowerCase()
      );
      
      if (foundCliente) {
        this.selectedCliente = foundCliente.id_usuario;
      }
    },
    
    clearClienteFilter() {
      this.selectedCliente = '';
      this.clienteSearchText = '';
    },
    
    // Obtener la clase CSS para el estado basada en el nombre
    getEstadoClass(estadoNombre) {
      const estadoLower = estadoNombre.toLowerCase();
      if (estadoLower.includes('espera')) {
        return 'estado-1'; // En Espera - Azul
      } else if (estadoLower.includes('camino')) {
        return 'estado-2'; // En camino - Naranja
      } else if (estadoLower.includes('entregada')) {
        return 'estado-3'; // Entregada - Verde
      } else if (estadoLower.includes('recoger')) {
        return 'estado-4'; // Listo para recoger - Otra clase
      }
      return 'estado-1'; // Estado por defecto
    },
    
    // Cargar datos para los filtros
    loadFilterData() {
      this.cargando = true;
      
      // Uso de Promise.all para cargar todos los datos de filtros en paralelo
      Promise.all([
        api.reportes.getRepartidores(),
        api.reportes.getEstados(),
        api.reportes.getClientes()
      ])
      .then(responses => {
        this.repartidores = responses[0].data;
        this.estados = responses[1].data;
        this.clientes = responses[2].data;
      })
      .catch(error => {
        console.error('Error cargando datos de filtros:', error);
        this.toast.error('Error al cargar los datos de filtros');
      })
      .finally(() => {
        this.cargando = false;
      });
    },
    
    // Generar el reporte según los filtros
    generateReport() {
      this.cargando = true;
      this.reportData = [];
      this.allReportData = [];
      this.showNoResults = false;
      
      try {
        // Asegurarnos de que las fechas estén en el formato correcto para la API
        const startDateFormatted = this.formatDateForAPI(this.startDate);
        const endDateFormatted = this.formatDateForAPI(this.endDate);
        
        // Llamada a la API según el tipo de reporte
        switch (this.reportType) {
          case 'pedidos':
            api.reportes.getPedidosReport(
              startDateFormatted, 
              endDateFormatted, 
              this.selectedRepartidor || null, 
              this.selectedEstado || null
            )
            .then(this.handleReportSuccess)
            .catch(this.handleReportError);
            break;
            
          case 'repartidores':
            api.reportes.getRepartidoresReport(startDateFormatted, endDateFormatted)
              .then(this.handleReportSuccess)
              .catch(this.handleReportError);
            break;
            
          case 'clientes':
            api.reportes.getClientesReport(
              startDateFormatted, 
              endDateFormatted, 
              this.selectedCliente || null
            )
            .then(this.handleReportSuccess)
            .catch(this.handleReportError);
            break;
            
          case 'equipos':
            api.reportes.getEquiposReport(startDateFormatted, endDateFormatted)
              .then(this.handleReportSuccess)
              .catch(this.handleReportError);
            break;
            
          case 'servicios':
            api.reportes.getServiciosReport(startDateFormatted, endDateFormatted)
              .then(this.handleReportSuccess)
              .catch(this.handleReportError);
            break;
              
          default:
            this.cargando = false;
            this.toast.error('Tipo de reporte no válido');
            break;
        }
      } catch (error) {
        this.handleReportError(error);
      }
    },
    // Manejar respuesta exitosa del servidor
    handleReportSuccess(response) {
      this.allReportData = response.data; // Guardamos todos los datos para exportación
      this.showNoResults = this.allReportData.length === 0;
      this.cargando = false;
      this.currentPage = 1; // Resetear a primera página con nuevos datos
      
      // Si hay resultados, activar modo compacto para los filtros
      if (this.allReportData.length > 0) {
        this.filtersCompact = true;
        this.toast.success('Reporte generado con éxito');
      } else {
        this.filtersCompact = false;
        this.toast.info('No se encontraron resultados para los filtros seleccionados');
      }
    },
    
    // Manejar error en la generación del reporte
    handleReportError(error) {
      console.error('Error generando reporte:', error);
      this.reportData = [];
      this.allReportData = [];
      this.showNoResults = true;
      this.cargando = false;
      this.filtersCompact = false; // Desactivar modo compacto en caso de error
      
      // Extraer mensaje de error más específico si está disponible
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error desconocido';
      
      this.toast.error(`Error al generar el reporte: ${errorMessage}`);
    },
    
    // Método para cambiar de página
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    
    // Ir a la página anterior
    prevPage() {
      this.changePage(this.currentPage - 1);
    },
    
    // Ir a la página siguiente
    nextPage() {
      this.changePage(this.currentPage + 1);
    },
    
    // Exportar a Excel
    exportToExcel() {
      if (this.allReportData.length === 0) {
        this.toast.warning('No hay datos para exportar');
        return;
      }
      
      try {
        const reportTitle = this.getReportTitle();
        // Obtener los datos preparados
        const excelData = this.prepareExcelDataAll();
        
        // Crear el libro y la hoja de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        
        // Agregar filas para la cabecera de la empresa (filas vacías primero)
        XLSX.utils.sheet_add_aoa(ws, [
          [''], // A1
          [''], // A2
          ['LAVAMATIC CEIBEÑO'], // A3
          ['Dirección: LA CEIBA'], // A4
          ['Teléfono: 98457560'], // A5
          ['Correo: lavamaticceibeño@gmail.com'], // A6
          [''], // A7
          [reportTitle], // A8
          [`Período: ${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`], // A9
          [''] // A10
        ], { origin: 'A1' });
        
        // Agregar los datos reales comenzando desde la fila 11
        XLSX.utils.sheet_add_json(ws, excelData, { origin: 'A11', skipHeader: false });
        
        // Estilizar las celdas (lo que Excel permite en su formato)
        // Nota: Excel no permite un estilizado complejo al exportar con SheetJS
        // pero podemos ajustar algunas propiedades básicas
        
        // Añadir la hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, reportTitle);
        
        // Ajustar ancho de columnas (aproximado, Excel lo ajustará más precisamente)
        const cols = [];
        for (let i = 0; i < Object.keys(excelData[0] || {}).length; i++) {
          cols.push({ wch: 15 }); // Ancho aproximado para cada columna
        }
        ws['!cols'] = cols;
        
        // En caso de reportes con totales, agregar la fila de total al final
        if (this.reportType === 'pedidos' || this.reportType === 'servicios') {
          const totalRowIndex = excelData.length + 11; // +11 por las filas de cabecera
          const totalColumnIndex = this.reportType === 'pedidos' ? 5 : 2; // Ajustar según reporte
          const total = this.reportType === 'pedidos' ? this.calculateTotal() : this.calculateTotalIngresos();
          
          // Añadir la fila de total
          const totalRow = [];
          totalRow[totalColumnIndex - 1] = 'Total:';
          totalRow[totalColumnIndex] = `${total} Lps.`;
          
          // Agregar la fila al final
          XLSX.utils.sheet_add_aoa(ws, [totalRow], { origin: `A${totalRowIndex}` });
        }
        
        // Generar el archivo y descargarlo
        XLSX.writeFile(wb, `${reportTitle}_${this.formatDateForFileName(new Date())}.xlsx`);
        this.toast.success('Archivo Excel generado correctamente');
      } catch (error) {
        console.error('Error exportando a Excel:', error);
        this.toast.error('Error al generar el archivo Excel');
      }
    },
    
    // Preparar todos los datos para Excel
    prepareExcelDataAll() {
      return this.allReportData.map(item => {
        if (this.reportType === 'pedidos') {
          return {
            'ID Pedido': item.id_pedido,
            'Cliente': item.nombre_cliente,
            'Repartidor': item.nombre_repartidor,
            'Estado': item.nombre_estado,
            'Fecha': this.formatDate(item.fecha_creacion),
            'Total': `${item.total} Lps.`
          };
        } else if (this.reportType === 'repartidores') {
          return {
            'Repartidor': item.nombre,
            'Pedidos Completados': item.pedidos_completados,
            'Pedidos en Proceso': item.pedidos_en_proceso,
            'Total Pedidos': item.total_pedidos,
            'Promedio Diario': item.promedio_diario.toFixed(2)
          };
        } else if (this.reportType === 'clientes') {
          return {
            'Cliente': item.nombre,
            'Total Pedidos': item.total_pedidos,
            'Servicios Favoritos': item.servicios_favoritos,
            'Gasto Total': `${item.gasto_total} Lps.`
          };
        } else if (this.reportType === 'equipos') {
          return {
            'Equipo': item.nombre,
            'Total Usos': item.total_usos,
            'Horas de Uso': item.horas_uso,
            'Mantenimientos': item.mantenimientos,
            'Disponibilidad (%)': `${item.disponibilidad}%`
          };
        } else if (this.reportType === 'servicios') {
          return {
            'Servicio': item.nombre,
            'Cantidad Vendida': item.cantidad_vendida,
            'Ingresos': `${item.ingresos} Lps.`,
            'Popularidad (%)': `${item.popularidad}%`
          };
        }
        return item;
      });
    },
    
    // Exportar a PDF
    exportToPDF() {
      if (this.allReportData.length === 0) {
        this.toast.warning('No hay datos para exportar');
        return;
      }
      
      try {
        const reportTitle = this.getReportTitle();
        const doc = new jsPDF();
        
        // Información de la empresa - estilo cabecera
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Lavamatic Ceibeño', 100, 25, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Dirección: LA CEIBA', 100, 35, { align: 'center' });
        doc.text('Teléfono: 98457560', 100, 45, { align: 'center' });
        doc.text('Correo: lavamaticceibeño@gmail.com', 100, 55, { align: 'center' });
        
        // Título del reporte
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(reportTitle, 14, 75);
        
        // Período del reporte
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.text(`Período: ${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`, 14, 85);
        
        // Datos para la tabla
        const tableHeaders = this.getTableHeaders();
        const tableData = this.preparePDFDataAll();
        
        // Crear tabla automática
        doc.autoTable({
          startY: 95,
          head: [tableHeaders],
          body: tableData,
          theme: 'grid', // Cambiado a grid para que se parezca más al ejemplo
          styles: {
            fontSize: 10,
            cellPadding: 4
          },
          headStyles: {
            fillColor: [41, 128, 185], // Azul similar al ejemplo
            textColor: 255,
            halign: 'center'
          },
          columnStyles: {
            // Alinear las columnas numéricas a la derecha
            0: { halign: 'left' }, // Primera columna a la izquierda
            // Las demás columnas que tengan valores numéricos irán a la derecha
          }
        });
        
        // Agregar totales si es necesario (depende del tipo de reporte)
        if (this.reportType === 'pedidos' || this.reportType === 'servicios') {
          const total = this.reportType === 'pedidos' ? this.calculateTotal() : this.calculateTotalIngresos();
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total: ${total} Lps.`, 195, doc.autoTable.previous.finalY + 10, { align: 'right' });
        }
        
        // Información adicional
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generado el: ${this.formatDate(new Date())}`, 14, doc.autoTable.previous.finalY + 20);
        
        // Guardar PDF
        doc.save(`${reportTitle}_${this.formatDateForFileName(new Date())}.pdf`);
        this.toast.success('Archivo PDF generado correctamente');
      } catch (error) {
        console.error('Error exportando a PDF:', error);
        this.toast.error(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
      }
    },
    
    // Preparar todos los datos para PDF
    preparePDFDataAll() {
      return this.allReportData.map(item => {
        if (this.reportType === 'pedidos') {
          return [
            item.id_pedido,
            item.nombre_cliente,
            item.nombre_repartidor,
            item.nombre_estado,
            this.formatDate(item.fecha_creacion),
            `${item.total} Lps.`
          ];
        } else if (this.reportType === 'repartidores') {
          return [
            item.nombre,
            item.pedidos_completados,
            item.pedidos_en_proceso,
            item.total_pedidos,
            item.promedio_diario.toFixed(2)
          ];
        } else if (this.reportType === 'clientes') {
          return [
            item.nombre,
            item.total_pedidos,
            item.servicios_favoritos,
            `${item.gasto_total} Lps.`
          ];
        } else if (this.reportType === 'equipos') {
          return [
            item.nombre,
            item.total_usos,
            item.horas_uso,
            item.mantenimientos,
            `${item.disponibilidad}%`
          ];
        } else if (this.reportType === 'servicios') {
          return [
            item.nombre,
            item.cantidad_vendida,
            `${item.ingresos} Lps.`,
            `${item.popularidad}%`
          ];
        }
        return [];
      });
    },
    
    // Obtener el título del reporte
    getReportTitle() {
      const titles = {
        pedidos: 'Reporte de Pedidos',
        repartidores: 'Reporte de Desempeño de Repartidores',
        clientes: 'Reporte de Clientes',
        equipos: 'Reporte de Uso de Equipos',
        servicios: 'Reporte de Servicios Vendidos'
      };
      return titles[this.reportType] || 'Reporte';
    },
    
    // Obtener encabezados de tabla según el tipo de reporte
    getTableHeaders() {
      const headers = {
        pedidos: ['ID', 'Cliente', 'Repartidor', 'Estado', 'Fecha', 'Total'],
        repartidores: ['Repartidor', 'Pedidos Completados', 'Pedidos en Proceso', 'Total Pedidos', 'Promedio Diario'],
        clientes: ['Cliente', 'Total Pedidos', 'Servicios Favoritos', 'Gasto Total'],
        equipos: ['Equipo', 'Total Usos', 'Horas de Uso', 'Mantenimientos', 'Disponibilidad (%)'],
        servicios: ['Servicio', 'Cantidad Vendida', 'Ingresos', 'Popularidad (%)']
      };
      return headers[this.reportType] || [];
    },
    
    // Calcular el total de los pedidos
    calculateTotal() {
      if (this.reportType === 'pedidos' && this.allReportData.length > 0) {
        return this.allReportData.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(2);
      }
      return '0.00';
    },
    
    // Calcular el total de ingresos para servicios
    calculateTotalIngresos() {
      if (this.reportType === 'servicios' && this.allReportData.length > 0) {
        return this.allReportData.reduce((sum, item) => sum + parseFloat(item.ingresos), 0).toFixed(2);
      }
      return '0.00';
    },
    
    // Funciones auxiliares de fecha
    getCurrentDate() {
      return new Date().toISOString().split('T')[0];
    },
    
    getFirstDayOfMonth() {
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    // Formatear fecha para API
    formatDateForAPI(dateString) {
      if (!dateString) return '';
      // Asegurar formato YYYY-MM-DD para el backend
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },
    
    formatDateForFileName(date) {
      return date.toISOString().split('T')[0].replace(/-/g, '');
    },
    
    // Resetear filtros
    resetFilters() {
      this.startDate = this.getFirstDayOfMonth();
      this.endDate = this.getCurrentDate();
      this.selectedRepartidor = '';
      this.selectedEstado = '';
      this.selectedCliente = '';
      this.allReportData = [];
      this.showNoResults = false;
      this.currentPage = 1;
      this.filtersCompact = false; // Desactivar modo compacto al limpiar filtros
      
      // Limpiar textos de búsqueda
      this.repartidorSearchText = '';
      this.estadoSearchText = '';
      this.clienteSearchText = '';
    }
  }
};
</script>

<style scoped>
/* Estilos para los nuevos controles de datalist */
.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding-right: 30px; /* Espacio para el botón de limpieza */
  width: 100%;
}

.clear-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.clear-button:hover {
  color: #333;
  background-color: #f0f0f0;
}

@import url('@/assets/css/ReporteStyle.css');
</style>