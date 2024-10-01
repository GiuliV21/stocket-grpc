const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const express = require('express');

// Carga del archivo .proto
const PROTO_PATH = path.join(__dirname, 'proto', 'stock.proto'); 
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const stock_proto = grpc.loadPackageDefinition(packageDefinition).stock;

// Creación del cliente gRPC
const client = new stock_proto.StockearteService('localhost:50051', grpc.credentials.createInsecure());

// Creación de la aplicación Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Ruta principal para servir el archivo login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html')); // Sirve el archivo login.html
});

// Ruta para servir el archivo index.html después de iniciar sesión
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html')); // Sirve el archivo index.html
});

// Ruta para crear tienda
app.post('/crear-tienda', (req, res) => {
  const tienda = req.body;
  client.CrearTienda(tienda, (err, response) => {
    if (err) {
      console.error("Error creando tienda:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send({ mensaje: response.mensaje });
  });
});

app.post('/crear-usuario', (req, res) => {
  const usuario = req.body;
  client.CrearUsuario(usuario, (err, response) => {
    if (err) {
      console.error("Error creando usuario:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.redirect('/login'); // Redirige al login después de crear usuario
  });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  client.AutenticarUsuario({ nombre_usuario: username, contrasena: password }, (err, response) => {
    if (err) {
      console.error("Error iniciando sesión:", err.details);
      res.status(500).send(err.details);
      return;
    }
    if (response.exito) {
      res.redirect('/index'); // Redirige al index si el login es exitoso
    } else {
      res.status(401).send({ mensaje: response.mensaje }); // Muestra el mensaje de error si falló
    }
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cliente escuchando en http://localhost:${PORT}`);
});
