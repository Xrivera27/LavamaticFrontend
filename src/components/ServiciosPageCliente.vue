<template>
  <div class="page-layout">
    <Sidebarcliente @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="contenedor-principal">

        <div class="tarjeta-contenido">
          <h1 class="titulo-bienvenida">Bienvenido, a continuación podrás ver los servicios que brindamos</h1>
        
          <div class="contenedor-servicios">
            <h2>SERVICIOS DISPONIBLES</h2>
            <div v-if="isLoading" class="loading-indicator">
              <div class="spinner"></div>
              <p>Cargando servicios...</p>
            </div>
            <div v-else class="grid-servicios">
              <div class="servicio-card" v-for="(servicio, index) in servicios" :key="index" @click="seleccionarServicio(servicio)">
                <div class="texto-servicio">
                  <span>{{ servicio.nombre.split(' ')[0] }}</span>
                  <span>{{ servicio.nombre.split(' ').slice(1).join(' ') }}</span>
                </div>
                <div class="acciones-servicio">
                  <button class="btn-accion" @click.stop="verServicio(servicio)">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                  <button class="btn-accion" @click.stop="agregarServicio(servicio)">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="seccion detalles-orden">
            <h2>DETALLES DE LA ORDEN</h2>
            <div class="tabla-encabezados">
              <span>Tipo de servicio</span>
              <span>Cantidad</span>
              <span>Precio</span>
            </div>
            <div v-if="serviciosSeleccionados.length === 0" class="sin-servicios">
              No hay servicios seleccionados
            </div>
            <div v-else class="lista-servicios">
              <div class="fila-servicio" v-for="(item, index) in serviciosSeleccionados" :key="index">
                <span>{{ item.nombre }}</span>
                <div class="control-cantidad">
                  <button @click="decrementarCantidad(index)">-</button>
                  <span>{{ item.cantidad }}</span>
                  <button @click="incrementarCantidad(index)">+</button>
                </div>
                <span>L.{{ formatearPrecio(item.precio * item.cantidad) }}</span>
              </div>
            </div>
          </div>

          <div class="seccion cargos">
            <h2>CARGOS</h2>
            <div class="fila-cargo">
              <span>Subtotal</span>
              <span>L.{{ formatearPrecio(calcularSubtotal()) }}</span>
            </div>
            <div class="fila-cargo total">
              <span>Total</span>
              <span>L.{{ formatearPrecio(calcularTotal()) }}</span>
            </div>
          </div>

          <div class="seccion domicilio">
            <h2>DETALLES DEL SERVICIO</h2>

            <!-- Fecha y hora para el servicio -->
            <div class="fila-doble">
              <div class="grupo-input">
                <label>Fecha del servicio</label>
                <input 
                  type="date" 
                  v-model="fechaServicio"
                  :min="fechaMinima"
                  :max="fechaMaxima"
                  :class="{ 'input-error': validacionErrores.fechaServicio && !fechaServicio }"
                />
                <span v-if="validacionErrores.fechaServicio && !fechaServicio" class="mensaje-error">
                  Debe seleccionar una fecha para el servicio
                </span>
              </div>
              <div class="grupo-input">
                <label>Hora del servicio</label>
                <select 
                  v-model="horaServicio"
                  :class="{ 'input-error': validacionErrores.horaServicio && !horaServicio }"
                >
                  <option value="">Seleccionar</option>
                  <option v-for="horario in horarios" :key="horario.id_horario" :value="horario.id_horario">
                    {{ horario.hora_inicio }} - {{ horario.hora_fin }}
                  </option>
                </select>
                <span v-if="validacionErrores.horaServicio && !horaServicio" class="mensaje-error">
                  Debe seleccionar una hora para el servicio
                </span>
              </div>
            </div>
            
            <!-- Entrega -->
            <div class="fila-completa">
              <div class="grupo-input">
                <label>
                  Tipo de entrega
                  <i class="fa-solid fa-circle-info info-icon" @click="mostrarInfoEntrega"></i>
                </label>
                <select v-model="tipoEntrega" @change="cambiarTipoEntrega">
                  <option value="sucursal">En sucursal</option>
                  <option value="domicilio">A domicilio</option>
                </select>
              </div>
            </div>
            
            <!-- Mostrar solo el campo de barrio/colonia si es entrega a domicilio -->
            <div v-if="tipoEntrega === 'domicilio'" class="fila-completa">
              <div class="grupo-input">
                <label>Barrio/Colonia de entrega</label>
                <input 
                  type="text" 
                  v-model="barrioEntrega" 
                  placeholder="Seleccione o escriba el barrio/colonia"
                  list="barrios-list"
                  :class="{ 'input-error': validacionErrores.barrioEntrega && !barrioEntrega }"
                />
                <datalist id="barrios-list">
                  <option v-for="barrio in barriosColonias" :key="barrio" :value="barrio"></option>
                </datalist>
                <span v-if="validacionErrores.barrioEntrega && !barrioEntrega" class="mensaje-error">
                  El barrio/colonia de entrega es obligatorio
                </span>
              </div>
            </div>

            <div class="botones">
              <button class="btn-cancelar" @click="cancelarOrden">Cancelar</button>
              <button 
                class="btn-enviar" 
                @click="enviarOrden" 
                :disabled="!formularioValido || isSubmitting"
              >
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin"></i> Procesando...
                </span>
                <span v-else>Enviar Pedido</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Detalle de Servicio -->
    <div class="modal" v-if="showModal" @click="cerrarModal">
      <div class="modal-contenido" @click.stop>
        <div class="modal-header">
          <h3>{{ servicioSeleccionado.nombre }}</h3>
          <button class="btn-cerrar" @click="cerrarModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detalle-precio">
            <span>Precio:</span>
            <span class="precio">L.{{ formatearPrecio(servicioSeleccionado.precio) }}</span>
          </div>
          <div class="detalle-descripcion">
            <p>{{ servicioSeleccionado.descripcion }}</p>
          </div>
          <div class="detalle-info">
            <div class="info-item">
              <i class="fa-regular fa-clock"></i>
              <span>Tiempo estimado: {{ servicioSeleccionado.tiempo_estimado || '24 horas' }}</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-shirt"></i>
              <span>Categoría: {{ servicioSeleccionado.categoria || 'General' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-agregar" @click="agregarServicioDesdeModal">
            Agregar a la orden
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de Información de Tipo de Entrega -->
    <div class="modal" v-if="showInfoModal" @click="cerrarInfoModal">
      <div class="modal-contenido modal-info" @click.stop>
        <div class="modal-header">
          <h3>Información sobre tipo de entrega</h3>
          <button class="btn-cerrar" @click="cerrarInfoModal">×</button>
        </div>
        <div class="modal-body">
          <div class="info-content">
            <p>Esta es la manera en la cual volveremos a dejar su producto una vez finalizado el servicio:</p>
            
            <div class="info-option">
              <h4><i class="fa-solid fa-store"></i> En sucursal</h4>
              <p>El producto estará disponible para recogerlo en nuestra tienda física. Usted debe visitar nuestra sucursal para retirar sus prendas.</p>
            </div>
            
            <div class="info-option">
              <h4><i class="fa-solid fa-truck"></i> A domicilio</h4>
              <p>Nuestro repartidor llevará el producto directamente a la dirección que usted especifique. Es necesario indicar el barrio o colonia para la entrega.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-entendido" @click="cerrarInfoModal">
            Entendido
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de Carga y Éxito -->
    <div class="modal-overlay" v-if="showSuccessModal">
      <div class="modal-success">
        <div class="modal-success-content">
          <div v-if="isRedirecting" class="success-loading">
            <div class="spinner"></div>
            <h3>Procesando...</h3>
            <p>Estamos registrando tu pedido</p>
          </div>
          <div v-else class="success-message">
            <i class="fas fa-check-circle"></i>
            <h3>¡Pedido creado con éxito!</h3>
            <p>Redirigiendo a la página de pedidos...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebarcliente from './Sidebarcliente.vue';
import api from '@/services/apiService';
import { useToast } from "vue-toastification";

export default {
  name: 'ClienteNuevoPedido',
  components: {
    Sidebarcliente
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      isSidebarExpanded: false,
      isLoading: true,
      isSubmitting: false,
      userName: sessionStorage.getItem('userName') || 'Cliente',
      notificaciones: 0,
      
      // Datos de servicios
      servicios: [],
      serviciosSeleccionados: [],
      
      // Fecha y hora
      fechaServicio: '',
      horaServicio: '',
      horarios: [],
      
      // Tipo de entrega
      tipoEntrega: 'sucursal', // Por defecto en sucursal
      
      // Solo barrio/colonia para entrega a domicilio
      barrioEntrega: '',
      
      // Modal
      showModal: false,
      showInfoModal: false,
      servicioSeleccionado: {
        id_servicio: null,
        nombre: '',
        precio: 0,
        descripcion: '',
        tiempo_estimado: '',
        categoria: ''
      },
      
      // Modal de éxito
      showSuccessModal: false,
      isRedirecting: false,
      
      // Validación
      validacionErrores: {
        fechaServicio: false,
        horaServicio: false,
        barrioEntrega: false
      },
      
      // Lista de barrios y colonias de La Ceiba
      barriosColonias: [
        "Barrio Alvarado",
        "Barrio El Centro",
        "Barrio Inglés",
        "Barrio La Isla",
        "Barrio Mejía",
        "Barrio Solares Nuevos",
        "Colonia El Naranjal",
        "Colonia Luisiana",
        "Colonia San José",
        "Colonia Suyapa",
        "Colonia Los Laureles",
        "Colonia Miramar",
        "Colonia Atlántida",
        "Colonia Gracias a Dios",
        "Colonia Los Fuertes",
        "Colonia San Isidro",
        "Colonia San Judas",
        "Colonia Toronjal",
        "Colonia Irías",
        "Colonia Los Bomberos"
      ]
    };
  },
  computed: {
    fechaMinima() {
      const hoy = new Date();
      return hoy.toISOString().split('T')[0];
    },
    fechaMaxima() {
      const maxFecha = new Date();
      maxFecha.setDate(maxFecha.getDate() + 30); // 30 días en el futuro
      return maxFecha.toISOString().split('T')[0];
    },
    formularioValido() {
      // Verificar que haya servicios seleccionados
      const hayServicios = this.serviciosSeleccionados.length > 0;
      
      // Verificar fecha y hora del servicio
      const fechaHoraValida = this.fechaServicio !== '' && this.horaServicio !== '';
      
      // Verificar barrio solo si es entrega a domicilio
      let entregaValida = true;
      if (this.tipoEntrega === 'domicilio') {
        entregaValida = this.barrioEntrega.trim() !== '';
      }
      
      return hayServicios && fechaHoraValida && entregaValida;
    }
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    
    async cargarServicios() {
      try {
        this.isLoading = true;
        const response = await api.servicioCliente.getServicios();
        this.servicios = response.data;
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        this.toast.error('No se pudieron cargar los servicios disponibles');
      } finally {
        this.isLoading = false;
      }
    },
    
    async cargarHorarios() {
      try {
        const response = await api.servicioCliente.getHorarios();
        this.horarios = response.data;
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        this.toast.error('No se pudieron cargar los horarios disponibles');
      }
    },
    
    cambiarTipoEntrega() {
      // Si cambia a sucursal, limpiar campo de barrio
      if (this.tipoEntrega === 'sucursal') {
        this.barrioEntrega = '';
        // También resetear error de validación
        this.validacionErrores.barrioEntrega = false;
      }
    },
    
    formatearPrecio(precio) {
      // Verificar si el precio es un número válido
      return precio !== undefined && precio !== null && !isNaN(precio) 
        ? Number(precio).toFixed(2) 
        : '0.00';
    },
    
    seleccionarServicio(servicio) {
      const index = this.serviciosSeleccionados.findIndex(s => s.id_servicio === servicio.id_servicio);
      if (index === -1) {
        this.serviciosSeleccionados.push({
          id_servicio: servicio.id_servicio,
          nombre: servicio.nombre,
          precio: Number(servicio.precio),
          cantidad: 1
        });
      } else {
        this.incrementarCantidad(index);
      }
    },
    
    verServicio(servicio) {
      this.servicioSeleccionado = {
        id_servicio: servicio.id_servicio,
        nombre: servicio.nombre,
        precio: Number(servicio.precio), // Asegurando que sea número
        descripcion: servicio.descripcion || '',
        tiempo_estimado: servicio.tiempo_estimado || '24 horas',
        categoria: servicio.categoria || 'General'
      };
      this.showModal = true;
    },
    
    cerrarModal() {
      this.showModal = false;
    },
    
    mostrarInfoEntrega() {
      this.showInfoModal = true;
    },
    
    cerrarInfoModal() {
      this.showInfoModal = false;
    },
    
    agregarServicioDesdeModal() {
      this.agregarServicio(this.servicioSeleccionado);
      this.cerrarModal();
    },
    
    agregarServicio(servicio) {
      this.seleccionarServicio(servicio);
    },
    
    incrementarCantidad(index) {
      this.serviciosSeleccionados[index].cantidad++;
    },
    
    decrementarCantidad(index) {
      if (this.serviciosSeleccionados[index].cantidad > 1) {
        this.serviciosSeleccionados[index].cantidad--;
      } else {
        this.serviciosSeleccionados.splice(index, 1);
      }
    },
    
    calcularSubtotal() {
      return this.serviciosSeleccionados.reduce((total, item) => {
        return total + (Number(item.precio) * item.cantidad);
      }, 0);
    },
    
    calcularTotal() {
      return this.calcularSubtotal();
    },
    
    validarCampos() {
      // Resetear errores
      this.validacionErrores = {
        fechaServicio: false,
        horaServicio: false,
        barrioEntrega: false
      };
      
      // Validar fecha y hora del servicio
      if (!this.fechaServicio) {
        this.validacionErrores.fechaServicio = true;
      }
      
      if (!this.horaServicio) {
        this.validacionErrores.horaServicio = true;
      }
      
      // Validar barrio solo si es entrega a domicilio
      if (this.tipoEntrega === 'domicilio') {
        if (!this.barrioEntrega.trim()) {
          this.validacionErrores.barrioEntrega = true;
        }
      }
      
      // Retornar si hay errores
      return !Object.values(this.validacionErrores).some(valor => valor);
    },
    
    cancelarOrden() {
      if (confirm('¿Estás seguro de cancelar la orden? Se perderán los datos ingresados.')) {
        this.resetearFormulario();
      }
    },
    
    resetearFormulario() {
      this.serviciosSeleccionados = [];
      this.fechaServicio = '';
      this.horaServicio = '';
      this.tipoEntrega = 'sucursal';
      this.barrioEntrega = '';
      this.validacionErrores = {
        fechaServicio: false,
        horaServicio: false,
        barrioEntrega: false
      };
    },
    
    async enviarOrden() {
      if (!this.validarCampos()) {
        this.toast.error('Por favor complete todos los campos requeridos');
        return;
      }
      
      if (this.formularioValido) {
        try {
          this.isSubmitting = true;
          
          // Preparar servicios para la API
          const serviciosFormateados = this.serviciosSeleccionados.map(servicio => ({
            id_servicio: servicio.id_servicio,
            cantidad: servicio.cantidad
          }));
          
          // Preparar dirección de entrega según el tipo seleccionado
          let direccionEntrega = '';
          if (this.tipoEntrega === 'domicilio') {
            // Si es a domicilio, incluir el barrio/colonia en la dirección de entrega
            direccionEntrega = this.barrioEntrega;
          } else {
            // Si es en sucursal, guardar "En sucursal"
            direccionEntrega = 'En sucursal';
          }
          
          // Preparar objeto para enviar a la API
          const ordenData = {
            servicios: serviciosFormateados,
            fecha: this.fechaServicio,
            id_horario: this.horaServicio,
            direccion_recogida: 'En sucursal', // Siempre en sucursal
            direccion_entrega: direccionEntrega,
            barrio: this.tipoEntrega === 'domicilio' ? this.barrioEntrega : ''
          };
          
          // Mostrar modal de carga
          this.isRedirecting = true;
          this.showSuccessModal = true;
          
          // Enviar pedido a la API
          await api.servicioCliente.crearPedido(ordenData);
          
          // Cambiar a mensaje de éxito
          this.isRedirecting = false;
          
          // Resetear formulario
          this.resetearFormulario();
          
          // Esperar 2 segundos antes de redireccionar
          setTimeout(() => {
            // Redirigir a la página de pedidos
            window.location.reload();
          }, 2000);
          
        } catch (error) {
          // Ocultar modal en caso de error
          this.showSuccessModal = false;
          
          console.error('Error al crear pedido:', error);
          this.toast.error('Error al crear el pedido: ' + (error.response?.data?.error || 'Inténtelo de nuevo más tarde'));
        } finally {
          this.isSubmitting = false;
        }
      } else {
        this.toast.error('Por favor complete todos los campos requeridos');
      }
    }
  },
  created() {
    this.cargarServicios();
    this.cargarHorarios();
  }
};
</script>


<style src="@/assets/css/serviciosPageStyle.css" scoped></style>