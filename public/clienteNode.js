const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './proto/stock.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const stock_proto = grpc.loadPackageDefinition(packageDefinition).stock;

const client = new stock_proto.StockearteService('localhost:50051', grpc.credentials.createInsecure());

function crearTienda() {
    const tienda = {
        codigo: document.getElementById('tiendaCodigo').value,
        direccion: document.getElementById('tiendaDireccion').value,
        ciudad: document.getElementById('tiendaCiudad').value,
        provincia: document.getElementById('tiendaProvincia').value,
        habilitada: true
    };
    client.CrearTienda(tienda, (err, response) => {
        if (err) {
            console.error("Error creando tienda:", err.details);
            return;
        }
        alert(response.mensaje);
    });
}

function crearUsuario() {
    const usuario = {
        nombre_usuario: document.getElementById('usuarioNombre').value,
        contrasena: document.getElementById('usuarioContrasena').value,
        nombre: document.getElementById('usuarioNombreReal').value,
        apellido: document.getElementById('usuarioApellido').value,
        tienda: document.getElementById('usuarioTienda').value
    };
    client.CrearUsuario(usuario, (err, response) => {
        if (err) {
            console.error("Error creando usuario:", err.details);
            return;
        }
        alert(response.mensaje);
    });
}

function crearProducto() {
    const producto = {
        nombre: document.getElementById('productoNombre').value,
        codigo: document.getElementById('productoCodigo').value,
        talle: document.getElementById('productoTalle').value,
        color: document.getElementById('productoColor').value,
        stock: parseInt(document.getElementById('productoStock').value)
    };
    client.CrearProducto(producto, (err, response) => {
        if (err) {
            console.error("Error creando producto:", err.details);
            return;
        }
        alert(response.mensaje);
    });
}

function buscarProductos() {
    const nombre = document.getElementById('busquedaProducto').value;
    client.BuscarProductos({ nombre: nombre }, (err, response) => {
        if (err) {
            console.error("Error buscando productos:", err.details);
            return;
        }
        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = "<h2>Resultados:</h2>";
        response.productos.forEach(producto => {
            resultadosDiv.innerHTML += `<p>Producto: ${producto.nombre}, Código: ${producto.codigo}, Stock: ${producto.stock}</p>`;
        });
    });
}
