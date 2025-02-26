<template>
  <div class="page-layout">
    <Sidebarcliente @sidebar-toggle="handleSidebarToggle" />
    <div class="main-content" :class="{ 'content-expanded': isSidebarExpanded }">
      <div class="contenedor-principal">
        <div class="header">
          <div class="logo">
            <i class="fa-solid fa-shirt"></i>
            <span>Lavamatic</span>
          </div>
          <div class="notifications">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </div>
          <div class="user-info">
            <span>Gerson Rivera</span>
            <span class="user-role">Cliente</span>
          </div>
        </div>

        <div class="tarjeta-contenido">
          <h1 class="titulo-bienvenida">Bienvenido, a continuación podrás ver los servicios que brindamos</h1>
        
          <div class="contenedor-servicios">
            <h2>SERVICIOS DISPONIBLES</h2>
            <div class="grid-servicios">
              <div class="servicio-card" v-for="(servicio, index) in servicios" :key="index" @click="seleccionarServicio(servicio)">
                <div class="texto-servicio">
                  <span>{{ servicio.tipo.split(' ')[0] }}</span>
                  <span>{{ servicio.tipo.split(' ')[1] }}</span>
                </div>
                <div class="acciones-servicio">
                  <button class="btn-accion" @click.stop="verServicio(servicio)">
                    <i class="icono-ojo"></i>
                  </button>
                  <button class="btn-accion" @click.stop="agregarServicio(servicio)">
                    <i class="icono-agregar"></i>
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
                <span>{{ item.tipo }}</span>
                <div class="control-cantidad">
                  <button @click="decrementarCantidad(index)">-</button>
                  <span>{{ item.cantidad }}</span>
                  <button @click="incrementarCantidad(index)">+</button>
                </div>
                <span>L.{{ (item.precio * item.cantidad).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="seccion cargos">
            <h2>CARGOS</h2>
            <div class="fila-cargo">
              <span>Subtotal</span>
              <span>L.{{ calcularSubtotal().toFixed(2) }}</span>
            </div>
            <div class="fila-cargo total">
              <span>Total</span>
              <span>L.{{ calcularTotal().toFixed(2) }}</span>
            </div>
          </div>

          <div class="seccion domicilio">
            <h2>SERVICIO A DOMICILIO Y ENTREGA</h2>

            <!-- Fecha única para el servicio -->
            <div class="fila-completa">
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
            </div>
            
            <!-- Recolección -->
            <div class="fila-doble">
              <div class="grupo-input">
                <label>Tipo de recolección</label>
                <select v-model="tipoRecoleccion" @change="resetDireccionRecoleccion">
                  <option value="">Seleccionar</option>
                  <option value="domicilio">A domicilio</option>
                  <option value="sucursal">En sucursal</option>
                </select>
              </div>
              <div class="grupo-input">
                <label>Hora de recolección</label>
                <select v-model="horaRecoleccion">
                  <option value="">Seleccionar</option>
                  <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                    {{ hora }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="fila-completa" v-if="tipoRecoleccion === 'domicilio'">
              <div class="grupo-input">
                <label>Dirección de recolección</label>
                <input 
                  type="text" 
                  v-model="direccionRecoleccion" 
                  placeholder="Ingrese la dirección de recolección"
                  :class="{ 'input-error': validacionErrores.direccionRecoleccion && !direccionRecoleccion }"
                />
                <span v-if="validacionErrores.direccionRecoleccion && !direccionRecoleccion" class="mensaje-error">
                  La dirección de recolección es obligatoria
                </span>
              </div>
            </div>
            
            <!-- Entrega -->
            <div class="fila-doble">
              <div class="grupo-input">
                <label>Tipo de entrega</label>
                <select v-model="tipoEntrega" @change="resetDireccionEntrega">
                  <option value="">Seleccionar</option>
                  <option value="domicilio">A domicilio</option>
                  <option value="sucursal">En sucursal</option>
                </select>
              </div>
              <div class="grupo-input">
                <label>Hora de entrega</label>
                <select v-model="horaEntrega">
                  <option value="">Seleccionar</option>
                  <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                    {{ hora }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="fila-completa" v-if="tipoEntrega === 'domicilio'">
              <div class="grupo-input">
                <label>Dirección de entrega</label>
                <input 
                  type="text" 
                  v-model="direccionEntrega" 
                  placeholder="Ingrese la dirección de entrega"
                  :class="{ 'input-error': validacionErrores.direccionEntrega && !direccionEntrega }"
                />
                <span v-if="validacionErrores.direccionEntrega && !direccionEntrega" class="mensaje-error">
                  La dirección de entrega es obligatoria
                </span>
              </div>
            </div>

            <div class="botones">
              <button class="btn-cancelar" @click="cancelarOrden">Cancelar</button>
              <button class="btn-enviar" @click="enviarOrden" :disabled="!formularioValido">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Detalle de Servicio -->
    <div class="modal" v-if="showModal" @click="cerrarModal">
      <div class="modal-contenido" @click.stop>
        <div class="modal-header">
          <h3>{{ servicioSeleccionado.tipo }}</h3>
          <button class="btn-cerrar" @click="cerrarModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detalle-precio">
            <span>Precio:</span>
            <span class="precio">L.{{ servicioSeleccionado.precio?.toFixed(2) }}</span>
          </div>
          <div class="detalle-descripcion">
            <p>{{ servicioSeleccionado.descripcion }}</p>
          </div>
          <div class="detalle-info">
            <div class="info-item">
              <i class="fa-regular fa-clock"></i>
              <span>Tiempo estimado: 24 horas</span>
            </div>
            <div class="info-item">
              <i class="fa-solid fa-shirt"></i>
              <span>Incluye: Lavado, secado y planchado</span>
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
  </div>
</template>

<script>
import Sidebarcliente from './Sidebarcliente.vue'

export default {
  name: 'ServiciosPage',
  components: {
    Sidebarcliente
  },
  data() {
    return {
      isSidebarExpanded: false,
      servicios: [
        { tipo: 'LAVADO NORMAL', precio: 50.00, descripcion: 'Lavado estándar para ropa cotidiana. Ideal para prendas de uso diario que no requieren tratamientos especiales.' },
        { tipo: 'LAVADO ESPECIAL', precio: 75.00, descripcion: 'Lavado para prendas que requieren cuidado adicional como ropa deportiva, jeans y prendas con manchas difíciles.' },
        { tipo: 'LAVADO ETIQUETA', precio: 100.00, descripcion: 'Lavado profesional para prendas formales y delicadas como trajes, vestidos, sedas y lanas finas.' }
      ],
      serviciosSeleccionados: [],
      fechaServicio: '',
      tipoRecoleccion: '',
      tipoEntrega: '',
      horaRecoleccion: '',
      horaEntrega: '',
      direccionRecoleccion: '',
      direccionEntrega: '',
      horasDisponibles: [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
      ],
      // Modal
      showModal: false,
      servicioSeleccionado: {},
      // Validación
      validacionErrores: {
        fechaServicio: false,
        direccionRecoleccion: false,
        direccionEntrega: false
      }
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
      
      // Verificar fecha del servicio
      const fechaValida = this.fechaServicio !== '';
      
      // Verificar campos de recolección
      const recoleccionValida = this.tipoRecoleccion !== '' && this.horaRecoleccion !== '';
      
      // Si es a domicilio, verificar dirección de recolección
      const direccionRecoleccionValida = this.tipoRecoleccion !== 'domicilio' || 
                                        (this.tipoRecoleccion === 'domicilio' && this.direccionRecoleccion.trim() !== '');
      
      // Verificar campos de entrega
      const entregaValida = this.tipoEntrega !== '' && this.horaEntrega !== '';
      
      // Si es a domicilio, verificar dirección de entrega
      const direccionEntregaValida = this.tipoEntrega !== 'domicilio' || 
                                    (this.tipoEntrega === 'domicilio' && this.direccionEntrega.trim() !== '');
      
      return hayServicios && fechaValida && recoleccionValida && direccionRecoleccionValida && 
             entregaValida && direccionEntregaValida;
    }
  },
  methods: {
    handleSidebarToggle(expanded) {
      this.isSidebarExpanded = expanded;
    },
    seleccionarServicio(servicio) {
      const index = this.serviciosSeleccionados.findIndex(s => s.tipo === servicio.tipo);
      if (index === -1) {
        this.serviciosSeleccionados.push({
          tipo: servicio.tipo,
          precio: servicio.precio,
          cantidad: 1
        });
      } else {
        this.incrementarCantidad(index);
      }
    },
    verServicio(servicio) {
      this.servicioSeleccionado = servicio;
      this.showModal = true;
    },
    cerrarModal() {
      this.showModal = false;
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
        return total + (item.precio * item.cantidad);
      }, 0);
    },
    calcularTotal() {
      return this.calcularSubtotal();
    },
    resetDireccionRecoleccion() {
      if (this.tipoRecoleccion !== 'domicilio') {
        this.direccionRecoleccion = '';
        this.validacionErrores.direccionRecoleccion = false;
      }
    },
    resetDireccionEntrega() {
      if (this.tipoEntrega !== 'domicilio') {
        this.direccionEntrega = '';
        this.validacionErrores.direccionEntrega = false;
      }
    },
    validarCampos() {
      // Resetear errores
      this.validacionErrores = {
        fechaServicio: false,
        direccionRecoleccion: false,
        direccionEntrega: false
      };
      
      // Validar fecha del servicio
      if (!this.fechaServicio) {
        this.validacionErrores.fechaServicio = true;
      }
      
      // Validar dirección de recolección si es a domicilio
      if (this.tipoRecoleccion === 'domicilio' && !this.direccionRecoleccion.trim()) {
        this.validacionErrores.direccionRecoleccion = true;
      }
      
      // Validar dirección de entrega si es a domicilio
      if (this.tipoEntrega === 'domicilio' && !this.direccionEntrega.trim()) {
        this.validacionErrores.direccionEntrega = true;
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
      this.tipoRecoleccion = '';
      this.tipoEntrega = '';
      this.horaRecoleccion = '';
      this.horaEntrega = '';
      this.direccionRecoleccion = '';
      this.direccionEntrega = '';
      this.validacionErrores = {
        fechaServicio: false,
        direccionRecoleccion: false,
        direccionEntrega: false
      };
    },
    enviarOrden() {
      if (!this.validarCampos()) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }
      
      if (this.formularioValido) {
        const ordenData = {
          servicios: this.serviciosSeleccionados,
          subtotal: this.calcularSubtotal(),
          total: this.calcularTotal(),
          fecha: this.fechaServicio,
          recoleccion: {
            tipo: this.tipoRecoleccion,
            hora: this.horaRecoleccion,
            direccion: this.direccionRecoleccion || 'En sucursal'
          },
          entrega: {
            tipo: this.tipoEntrega,
            hora: this.horaEntrega,
            direccion: this.direccionEntrega || 'En sucursal'
          }
        };
        
        console.log('Enviando orden:', ordenData);
        alert('Orden enviada con éxito');
        this.resetearFormulario();
      } else {
        alert('Por favor complete todos los campos requeridos');
      }
    }
  }
};
</script>


<style src="@/assets/css/serviciosPageStyle.css" scoped></style>