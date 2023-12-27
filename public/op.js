const app = Vue.createApp({
  data() {
    return {
      /* páginas */
      page: "productos",
      pagePorcentaje: "aumento",
      pageInicio: "iniciar",
      /* ingresar producto */
      db: null,
      productos: [],
      productosFiltrados: [],
      comprobacion: true,
      comprobacionCampos: false,
      comprobarCodCarr: false,
      editarIconos: false,
      nombreProducto: null,
      codigo: "",
      categoria: "Seleccionar",
      categorias: [],
      refCategoria: [],
      descripcion: "",
      cantidad: "",
      precio: null,
      buscar: "",
      cat: "Seleccionar",
      checkedBuscar: false,
      /* función editar */
      editarNombre: "",
      editarCategoria: "",
      editarPrecio: "",
      editarDescripcion: "",
      editarCantidad: "",
      editarCodigo: "",
      /* Aumentos */
      historialAumentos: [],
      aumentarCategoria: "Seleccionar",
      aumentoPorcentaje: null,
      aumentarCodigo: "",
      nuevaCategoria: "",
      modificacion: [],
      /* login */
      usuario: null,
      contraseña: "",
      inicioSesion: true,
      usuarioLogueado: null,
      /* salida de producto */
      sCodigo: "",
      sCantidad: "",
      carrito: [],
      totalCarrito: null,
      /* paginacion */
      paginas: [],
      totalNoOfItems: null,
      noDePaginas: "",
      itemsToSkip: null,
      itemsPorPagina: 10,
      numeroPagina: 1,
      anterior: false,
      siguiente: true,
    };
  },
  created() {
    let bd = firebase.firestore();
    this.db = bd;
    this.getCategorias();
    this.getProductos();
  },
  methods: {
    iniciarSesion() {
      if (this.usuario != "" && this.contraseña != "") {
        firebase
          .auth()
          .signInWithEmailAndPassword(this.usuario, this.contraseña)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            this.usuario = user;
            this.contraseña = "";
            this.page = "productos";
            this.inicioSesion = true;
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
              },
            });
            Toast.fire({
              icon: "success",
              title: "Inicio Correcto",
            });
            // ...
          })
          .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
          });
      } else {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "error",
          title:
            "Por favor, ingrese con las credenciales correctas para iniciar el sistema",
        });
      }
    },
    addProductos() {
      this.comprobarCodigo();
      this.checkForm();
      if (this.comprobacionCampos === true) {
        if (this.comprobacion === true) {
          let producto = {
            producto: this.nombreProducto.toUpperCase(),
            codigo: this.codigo.toUpperCase(),
            cantidad: this.cantidad,
            descripcion: this.descripcion.toUpperCase(),
            precio: this.precio,
            categoria: this.categoria.toUpperCase(),
          };
          this.db
            .collection("productos")
            .doc(`${this.codigo}`)
            .set(producto)
            .then((docRef) => {
              this.getProductos();
              this.comprobacionCampos = false;
              this.comprobacion = true;
              this.page = "productos";
              this.nombreProducto = "";
              this.codigo = "";
              this.cantidad = "";
              this.descripcion = "";
              this.precio = "";
              this.categoria = "Seleccionar";
              const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.addEventListener("mouseenter", Swal.stopTimer);
                  toast.addEventListener("mouseleave", Swal.resumeTimer);
                },
              });
              Toast.fire({
                icon: "success",
                title: "Producto agregado con éxito",
              });
            })
            .catch((err) => console.log(err));
        } else {
          this.comprobacion = true;
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          Toast.fire({
            icon: "error",
            title: "El código ya existe",
          });
        }
      } else {
        this.comprobacionCampos = false;
      }
    },
    addCategorias() {
      if (this.nuevaCategoria === "") {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "error",
          title: "Compruebe que los campos esten completos",
        });
      } else {
        let categoria = {
          categoria: this.nuevaCategoria.toUpperCase(),
        };
        this.db
          .collection("categorias")
          .doc(`${this.nuevaCategoria}`)
          .set(categoria)
          .then((docRef) => {
            this.getCategorias();
            this.page = "categorias";
            this.nuevaCategoria = "";
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
              },
            });
            Toast.fire({
              icon: "success",
              title: "Categoría agregada con éxito",
            });
          })
          .catch((err) => console.log(err));
      }
    },
    getCategorias() {
      this.db
        .collection("categorias")
        .get()
        .then((query) => {
          this.categorias = [];
          query.forEach((doc) => {
            let aux = {
              id: doc.id,
              data: doc.data(),
            };
            this.categorias.push(aux);
          });
        });
    },
    getProductos() {
      this.db
        .collection("productos")
        .get()
        .then((query) => {
          this.productos = [];
          query.forEach((doc) => {
            let aux = {
              id: doc.id,
              data: doc.data(),
            };
            this.productos.push(aux);
          });
        });
    },
    comprobarCodigo() {
      this.productos.forEach((doc) => {
        if (this.codigo == doc.id) {
          this.comprobacion = false;
        }
      });
    },
    borrarProducto(producto) {
      Swal.fire({
        title: "¿Seguro?",
        text: "¡Esta acción es irreversible!",
        icon: "error",
        color: "#ffffff",
        background: "#000000",
        showCancelButton: true,
        confirmButtonColor: "#198754",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, Borrar!",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        this.getProductos();
        if (result.isConfirmed) {
          this.page = "productos";
          this.db
            .collection("productos")
            .doc(producto.id)
            .delete()
            .then((res) => {
              Swal.fire({
                title: "¡Borrado!",
                text: "El producto ha sido borrado.",
                icon: "success",
                color: "#ffffff",
                background: "#000000",
              });
            });
        }
      });
    },
    editarProducto(id, nombre, precio, categoria, descripcion, cantidad) {
      if (this.editarIconos === false) {
        this.editarIconos = true;
      } else {
        this.editarIconos = false;
        this.editarNombre = "";
        this.editarCantidad = "";
        this.editarDescripcion = "";
        this.editarPrecio = "";
        this.editarCategoria = "";
        this.editarCodigo = "";
      }
      this.editarNombre = nombre;
      this.editarPrecio = precio;
      this.editarDescripcion = descripcion;
      this.editarCategoria = categoria;
      this.editarCantidad = cantidad;
      this.editarCodigo = id;
    },
    enviarEdit() {
      let ref = this.db.collection("productos").doc(`${this.editarCodigo}`);

      return ref
        .update({
          producto: this.editarNombre,
          cantidad: this.editarCantidad,
          descripcion: this.editarDescripcion,
          precio: this.editarPrecio,
          categoria: this.editarCategoria,
        })
        .then((res) => {
          this.getProductos();
          this.editarNombre = "";
          this.editarCantidad = "";
          this.editarDescripcion = "";
          this.editarPrecio = "";
          this.editarCategoria = "";
          this.editarCodigo = "";
          this.editarIconos = false;

          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          Toast.fire({
            icon: "success",
            title: "Producto editado con éxito",
          });
        })
        .catch((error) => {
          console.log("ERROR");
        });
    },
    editCategoria(id, categoria) {
      this.editarCategoria = categoria;
      this.editarCodigo = id;

      if (this.editarIconos === false) {
        this.editarIconos = true;
      } else {
        this.editarIconos = false;
        this.editarCategoria = "";
        this.editarCodigo = "";
      }
      this.refCategoria = this.productos.filter(
        (prod) => prod.data.categoria === this.editarCategoria
      );
    },
    enviarEditCategoria() {
      let ref = this.db.collection("categorias").doc(`${this.editarCodigo}`);
      let refCategoria = this.db.collection("productos").doc();
      return ref
        .update({
          categoria: this.editarCategoria,
        })
        .then((res) => {
          this.refCategoria.forEach((prod) => {
            this.db.collection("productos").doc(`${prod.data.codigo}`).update({
              categoria: this.editarCategoria,
            });
          });
          this.getCategorias();
          this.editarCategoria = "";
          this.editarCodigo = "";
          this.editarIconos = false;

          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          Toast.fire({
            icon: "success",
            title: "Categoria editado con éxito",
          });
        })
        .catch((error) => {
          console.log("ERROR");
        });
    },
    checkForm() {
      if (
        (this.nombreProducto && this.codigo && this.cantidad) ||
        (this.cantidad >= 0 && this.precio && this.categoria != "Seleccionar")
      ) {
        this.comprobacionCampos = true;
      } else {
        this.comprobacionCampos = false;
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "error",
          title: "Compruebe que los campos esten completos",
        });
      }
    },
    borrarCategoria(categoria) {
      const refCategoria = this.db.collection("categorias").doc(categoria.id);
      Swal.fire({
        title: "¿Seguro?",
        text: "¡Esta acción es irreversible!",
        icon: "error",
        color: "#ffffff",
        background: "#000000",
        showCancelButton: true,
        confirmButtonColor: "#0B5ED7",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, Borrar!",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          refCategoria.delete().then((res) => {
            this.page = "categorias";
            this.getCategorias();
            Swal.fire({
              title: "¡Borrado!",
              text: "La categoría ha sido borrado.",
              icon: "success",
              color: "#ffffff",
              background: "#000000",
            });
          });
        }
      });
    },
    agregarCarrito() {
      if (this.sCantidad && this.sCodigo) {
        let refFilter = this.productos.filter(
          (producto) => producto.id === `${this.sCodigo.toLowerCase()}`
        );
        let refCantidad = refFilter[0].data.cantidad;

        if (refCantidad - this.sCantidad < 0) {
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          Toast.fire({
            icon: "error",
            title: `No hay suficientes '${refFilter[0].data.producto}'`,
          });
        } else {
          this.comprobarRepetido();
          if (this.comprobarCodCarr == false) {
            refFilter.forEach((prop) => {
              let aux = {
                codigo: prop.data.codigo,
                producto: prop.data.producto,
                precio: prop.data.precio * this.sCantidad,
                cantidad: this.sCantidad,
              };
              this.carrito.push(aux);
              this.comprobarCodCarr = false;
              this.sCantidad = "";
              this.sCodigo = "";
            });
          }
        }
      } else {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "error",
          title: "Compruebe que los campos esten completos",
        });
      }
    },
    comprobarRepetido() {
      this.carrito.forEach((prod) => {
        if (prod.codigo == this.sCodigo) {
          this.comprobarCodCarr = true;
        }
      });
    },
    salidaProductos() {
      if (this.carrito.length >= 1) {
        this.carrito.forEach((prop) => {
          let refSalida = this.db.collection("productos").doc(`${prop.codigo}`);
          let refProducto = this.productos.filter(
            (producto) => producto.id === `${prop.codigo}`
          );
          let refCantidad = refProducto[0].data.cantidad;
          let refTotal = refCantidad - prop.cantidad;

          return refSalida.update({
            cantidad: refTotal,
          });
        });
        this.carrito = [];
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "success",
          title: "Venta realizada",
        });
      }
    },
    borrarCarrito(producto) {
      let refIndex = this.carrito.findIndex(
        (prod) => prod.codigo === producto.codigo
      );
      this.carrito.splice(refIndex, 1);
    },
    mostrarInfo() {
      this.modificacion = [];
      if (this.aumentarCategoria && this.aumentoPorcentaje) {
        let refFilter = this.productos.filter(
          (producto) => producto.data.categoria === this.aumentarCategoria
        );
        console.log(refFilter);

        refFilter.forEach((prop) => {
          let precioActual = prop.data.precio;
          let aux = {
            codigo: prop.data.codigo,
            producto: prop.data.producto,
            precio: prop.data.precio,
            cantidad: prop.data.cantidad,
            modificado: Math.round(
              precioActual + (this.aumentoPorcentaje / 100) * precioActual
            ),
          };
          this.modificacion.push(aux);
        });
      }
    },
    realizarAumento() {
      if (this.modificacion.length >= 1) {
        this.modificacion.forEach((prop) => {
          let ref = this.db.collection("productos").doc(`${prop.codigo}`);
          return ref.update({
            precio: prop.modificado,
          });
        });
        this.page = "porcentaje";
        this.pagePorcentaje = "aumento";
        this.modificacion = [];
        this.guardarHistorial();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });
        Toast.fire({
          icon: "success",
          title: "Aumento Realizado",
        });
      }
    },
    guardarHistorial() {
            // Obtener la fecha y hora actual
            var fechaHora = new Date();
            // Convertir la fecha y hora a un formato deseado
            var dia = fechaHora.getDate();
            var mes = fechaHora.getMonth() + 1; // Se suma 1 porque los meses en JavaScript comienzan en 0
            var año = fechaHora.getFullYear();
            var hora = fechaHora.getHours();
            var minutos = fechaHora.getMinutes();
            var segundos = fechaHora.getSeconds();
      
            // Formatear la fecha y hora en un string
            var fechaHoraFormateada =
              dia +
              "/" +
              mes +
              "/" +
              año +
              " " +
              hora +
              ":" +
              minutos +
              ":" +
              segundos;

      let historial = {
        fecha: fechaHoraFormateada,
        categoria: this.aumentarCategoria,
        porcentaje: this.aumentoPorcentaje,
      };
      this.db
        .collection("historial")
        .doc()
        .set(historial)
        .then((ref) => {
          this.aumentarCategoria = "";
          this.porcentajeAumento = "";
          this.page = "porcentaje";
        });
    },
    getHistorial() {
      this.db
        .collection("historial")
        .get()
        .then((query) => {
          this.historialAumentos = [];
          query.forEach((doc) => {
            let aux = {
              id: doc.id,
              data: doc.data(),
            };
            this.historialAumentos.push(aux);
          });
        });
    },
  },
  computed: {
    buscarProductos() {
      this.productosFiltrados = this.productos.filter((res) => {
        if (this.checkedBuscar) {
          return (
            res.data.codigo.includes(this.buscar.toUpperCase()) &&
            (this.cat === res.data.categoria || this.cat === "Seleccionar")
          );
        } else {
          return (
            res.data.producto.includes(this.buscar.toUpperCase()) &&
            (this.cat === res.data.categoria || this.cat === "Seleccionar")
          );
        }
      });
      this.noDePaginas = Math.ceil(this.totalNoOfItems / this.itemsPorPagina);
    },
    mantenerSesion() {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          let uid = user.uid;

          this.usuarioLogeado = user;

          this.inicioSesion = true;
          this.page = "productos";

          this.usuario = "";
          this.contraseña = "";
        }
      });
    },
    paginacion() {
      if (this.numeroPagina === this.noDePaginas) {
        this.siguiente = false;
      } else {
        this.siguiente = true;
      }

      if (this.numeroPagina === 1) {
        this.anterior = false;
      } else {
        this.anterior = true;
      }

      this.totalNoOfItems = this.productosFiltrados.length;
      this.itemsToSkip = Math.ceil(
        (this.numeroPagina - 1) * this.itemsPorPagina
      );
      this.paginas = this.productosFiltrados.slice(
        this.itemsToSkip,
        this.itemsPorPagina + this.itemsToSkip
      );
    },
    imprimirTotal() {
      if (this.carrito.length > 0) {
        let total = 0;
        this.carrito.forEach((a) => {
          total += a.precio;
        });
        this.totalCarrito = total;
      } else {
        this.totalCarrito = 0;
      }
    },
  },
}).mount("#app");
