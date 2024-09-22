const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Ruta al archivo proto
const PROTO_PATH = path.join(__dirname, '../proto/stock.proto');

// Cargar el archivo proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Cargar el paquete gRPC generado a partir del proto
const stockProto = grpc.loadPackageDefinition(packageDefinition).stock;

// Crear el cliente gRPC
const client = new stockProto.StockearteService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Función para crear una tienda
const crearTienda = () => {
  const tiendaRequest = {
    codigo: 'T1',
    direccion: 'Calle Falsa 123',
    ciudad: 'Ciudad Ejemplo',
    provincia: 'Provincia Ejemplo',
    habilitada: true,
  };

  client.CrearTienda(tiendaRequest, (error, response) => {
    if (error) {
      console.error('Error al crear tienda:', error);
    } else {
      console.log('Respuesta de CrearTienda:', response.mensaje);
      // Crear usuario después de que la tienda se crea exitosamente
      crearUsuario();
    }
  });
};

// Función para crear un usuario
const crearUsuario = () => {
  const usuarioRequest = {
    nombre_usuario: 'usuario123',
    contrasena: 'contraseña123',
    nombre: 'Juan',
    apellido: 'Pérez',
    tienda: 'T1',  // Se asigna la tienda creada
  };

  client.CrearUsuario(usuarioRequest, (error, response) => {
    if (error) {
      console.error('Error al crear usuario:', error);
    } else {
      console.log('Respuesta de CrearUsuario:', response.mensaje);
      // Autenticar usuario después de que se crea exitosamente
      autenticarUsuario();
    }
  });
};

// Función para autenticar usuario
const autenticarUsuario = () => {
  const loginRequest = {
    nombre_usuario: 'usuario123',
    contrasena: 'contraseña123',
  };

  client.AutenticarUsuario(loginRequest, (error, response) => {
    if (error) {
      console.error('Error al autenticar:', error);
    } else {
      console.log('Respuesta de AutenticarUsuario:', response.mensaje);
    }
  });
};

// Ejecutar el flujo para crear una tienda y un usuario
crearTienda();
