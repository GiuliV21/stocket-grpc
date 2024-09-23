const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta al archivo proto
const PROTO_PATH = path.join(__dirname, './proto/stock.proto');

// Cargar el archivo proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const stockProto = grpc.loadPackageDefinition(packageDefinition).stock;
const client = new stockProto.StockearteService('localhost:50051', grpc.credentials.createInsecure());

app.post('/crear-usuario', (req, res) => {
  const usuarioRequest = {
    nombre_usuario: req.body.nombre_usuario,
    contrasena: req.body.contrasena,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tienda: req.body.tienda,
  };

  client.CrearUsuario(usuarioRequest, (error, response) => {
    if (error) {
      return res.status(500).json({ mensaje: 'Error al crear usuario: ' + error.message });
    }
    res.json({ mensaje: response.mensaje });
  });
});

app.post('/autenticar-usuario', (req, res) => {
  const loginRequest = {
    nombre_usuario: req.body.nombre_usuario,
    contrasena: req.body.contrasena,
  };

  client.AutenticarUsuario(loginRequest, (error, response) => {
    if (error) {
      return res.status(500).json({ mensaje: 'Error al autenticar: ' + error.message });
    }
    res.json({ mensaje: response.mensaje });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
