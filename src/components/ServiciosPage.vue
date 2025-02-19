<template>
    <div class="contenedor-principal">
      <div class="tarjeta-contenido">
        <h1 class="titulo-bienvenida">Bienvenido, a continuación podrás ver los servicios que brindamos</h1>
      
        <div class="contenedor-servicios">
          <h2>SERVICIOS DISPONIBLES</h2>
          <div class="grid-servicios">
            <!-- Servicios -->
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
              <span>${{ (item.precio * item.cantidad).toFixed(2) }}</span>
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
          <div class="fila-doble">
            <div class="grupo-input">
              <label>Tipo de recolección</label>
              <select v-model="tipoRecoleccion">
                <option value="">Seleccionar</option>
                <option value="domicilio">A domicilio</option>
                <option value="sucursal">En sucursal</option>
              </select>
            </div>
            <div class="grupo-input">
              <label>Tipo de entrega</label>
              <select v-model="tipoEntrega">
                <option value="">Seleccionar</option>
                <option value="domicilio">A domicilio</option>
                <option value="sucursal">En sucursal</option>
              </select>
            </div>
          </div>
          
          <div class="fila-doble">
            <div class="grupo-input">
              <label>Hora de recolección</label>
              <select v-model="horaRecoleccion">
                <option value="">Seleccionar</option>
                <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                  {{ hora }}
                </option>
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
  
          <div class="botones">
            <button class="btn-cancelar" @click="cancelarOrden">Cancelar</button>
            <button class="btn-enviar" @click="enviarOrden" :disabled="!formularioValido">Enviar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ServiciosPage',
    data() {
      return {
        servicios: [
          { tipo: 'LAVADO NORMAL', precio: 50.00, descripcion: 'Lavado estándar para ropa cotidiana' },
          { tipo: 'LAVADO ESPECIAL', precio: 75.00, descripcion: 'Lavado para prendas que requieren cuidado adicional' },
          { tipo: 'LAVADO ETIQUETA', precio: 100.00, descripcion: 'Lavado profesional para prendas formales y delicadas' }
        ],
        serviciosSeleccionados: [],
        tipoRecoleccion: '',
        tipoEntrega: '',
        horaRecoleccion: '',
        horaEntrega: '',
        horasDisponibles: [
          '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
          '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
        ]
      };
    },
    computed: {
      formularioValido() {
        return this.serviciosSeleccionados.length > 0 &&
               this.tipoRecoleccion !== '' &&
               this.tipoEntrega !== '' &&
               this.horaRecoleccion !== '' &&
               this.horaEntrega !== '';
      }
    },
    methods: {
      seleccionarServicio(servicio) {
        // Verificar si el servicio ya está seleccionado
        const index = this.serviciosSeleccionados.findIndex(s => s.tipo === servicio.tipo);
        if (index === -1) {
          // Agregar el servicio si no está en la lista
          this.serviciosSeleccionados.push({
            tipo: servicio.tipo,
            precio: servicio.precio,
            cantidad: 1
          });
        } else {
          // Incrementar cantidad si ya está en la lista
          this.incrementarCantidad(index);
        }
      },
      verServicio(servicio) {
        alert(`${servicio.tipo}\nPrecio: $${servicio.precio.toFixed(2)}\n${servicio.descripcion}`);
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
          // Eliminar el servicio si la cantidad llega a 0
          this.serviciosSeleccionados.splice(index, 1);
        }
      },
      calcularSubtotal() {
        return this.serviciosSeleccionados.reduce((total, item) => {
          return total + (item.precio * item.cantidad);
        }, 0);
      },
      calcularTotal() {
        // Por ahora el total es igual al subtotal, pero aquí se podrían agregar impuestos o descuentos
        return this.calcularSubtotal();
      },
      cancelarOrden() {
        if (confirm('¿Estás seguro de cancelar la orden? Se perderán los datos ingresados.')) {
          this.serviciosSeleccionados = [];
          this.tipoRecoleccion = '';
          this.tipoEntrega = '';
          this.horaRecoleccion = '';
          this.horaEntrega = '';
        }
      },
      enviarOrden() {
        if (this.formularioValido) {
          // Aquí iría la lógica para enviar la orden al backend
          const ordenData = {
            servicios: this.serviciosSeleccionados,
            subtotal: this.calcularSubtotal(),
            total: this.calcularTotal(),
            recoleccion: {
              tipo: this.tipoRecoleccion,
              hora: this.horaRecoleccion
            },
            entrega: {
              tipo: this.tipoEntrega,
              hora: this.horaEntrega
            }
          };
          
          console.log('Enviando orden:', ordenData);
          alert('Orden enviada con éxito');
          this.cancelarOrden();
        } else {
          alert('Por favor complete todos los campos requeridos');
        }
      }
    }
  };
  </script>
  
  <style src="@/assets/css/serviciosPageStyle.css" scoped></style>