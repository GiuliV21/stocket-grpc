const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Cargar archivo proto
const PROTO_PATH = '../proto/stock.proto';  // Asegúrate de colocar el archivo .proto en esta ruta
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const stock_proto = grpc.loadPackageDefinition(packageDefinition).stock;

// Crear cliente gRPC
const client = new stock_proto.StockearteService('localhost:50051', grpc.credentials.createInsecure());

// Función para crear tienda
function crearTienda(tienda, callback) {
  client.CrearTienda(tienda, (err, response) => {
    if (err) {
      console.error("Error creando tienda:", err.details);
      return;
    }
    console.log("Tienda creada:", response.mensaje);
    callback();
  });
}

// Función para crear usuario
function crearUsuario(usuario, callback) {
  client.CrearUsuario(usuario, (err, response) => {
    if (err) {
      console.error("Error creando usuario:", err.details);
      return;
    }
    console.log("Usuario creado:", response.mensaje);
    callback();
  });
}

// Función para crear producto
function crearProducto(producto, callback) {
  client.CrearProducto(producto, (err, response) => {
    if (err) {
      console.error("Error creando producto:", err.details);
      return;
    }
    console.log("Producto creado:", response.mensaje);
    callback();
  });
}

// Función para buscar productos
function buscarProductos(callback) {
  client.BuscarProductos({ nombre: 'Camiseta' }, (err, response) => {
    if (err) {
      console.error("Error buscando productos:", err.details);
      return;
    }
    console.log("Productos encontrados:");
    response.productos.forEach(producto => {
      console.log(`Producto: ${producto.nombre}, Código: ${producto.codigo}, Stock: ${producto.stock}`);
    });
    callback();
  });
}

// Función para modificar producto
function modificarProducto(producto, callback) {
  client.ModificarProducto(producto, (err, response) => {
    if (err) {
      console.error("Error modificando producto:", err.details);
      return;
    }
    console.log("Producto modificado:", response.mensaje);
    callback();
  });
}

// Función para eliminar producto
function eliminarProducto(codigo, callback) {
  client.EliminarProducto({ codigo }, (err, response) => {
    if (err) {
      console.error("Error eliminando producto:", err.details);
      return;
    }
    console.log("Producto eliminado:", response.mensaje);
    callback();
  });
}

// Nueva función para alternar habilitada de la tienda
function alternarHabilitadaTienda(codigo, callback) {
  client.AlternarHabilitadaTienda({ codigo }, (err, response) => {
    if (err) {
      console.error("Error alternando habilitada de la tienda:", err.details);
      return;
    }
    console.log("Estado de la tienda alternado:", response.mensaje);
    callback();
  });
}

// Ejecutar las pruebas en orden
const tienda = {
  codigo: 'T001',
  direccion: 'Calle 123',
  ciudad: 'Ciudad XYZ',
  provincia: 'Provincia ABC',
  habilitada: true
};

const usuario = {
  nombre_usuario: 'usuario1',
  contrasena: 'password123',
  nombre: 'Juan',
  apellido: 'Perez',
  tienda: 'T001' // El código de la tienda creada
};

const producto1 = {
  nombre: 'Camiseta',
  codigo: 'P001',
  talle: 'M',
  color: 'Rojo',
  stock: 100
};

const producto2 = {
  nombre: 'Pantalón',
  codigo: 'P002',
  talle: 'L',
  color: 'Negro',
  stock: 50
};


crearTienda(tienda, () => {
  crearUsuario(usuario, () => {
    client.AutenticarUsuario({
      nombre_usuario: 'usuario1',
      contrasena: 'password123'
    }, (err, response) => {
      if (err) {
        console.error("Error autenticando usuario:", err.details);
        return;
      }
      console.log("Autenticación:", response.mensaje);
      crearProducto(producto1, () => {
        crearProducto(producto2, () => {
          modificarProducto({
            nombre: 'Camiseta',
            codigo: 'P001',  // El código del producto existente
            talle: 'L',      // Modificación del talle
            color: 'Azul',   // Modificación del color
            stock: 120       // Modificación del stock
          }, () => {
            buscarProductos(() => {
              alternarHabilitadaTienda('T001', () => {
                eliminarProducto('P001', () => {
                  console.log("Pruebas completadas.");
                });
              });
            });
          });
        });
      });
    });
  });
});