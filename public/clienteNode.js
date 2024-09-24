const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Carga del archivo .proto
const PROTO_PATH = './proto/stock.proto';
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

// Ruta principal para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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

// Ruta para crear usuario
app.post('/crear-usuario', (req, res) => {
  const usuario = req.body;
  client.CrearUsuario(usuario, (err, response) => {
    console.log(usuario)
    if (err) {
      console.error("Error creando usuario:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send({ mensaje: response.mensaje });
  });
});

// Ruta para crear producto
app.post('/crear-producto', (req, res) => {
  const producto = req.body;
  client.CrearProducto(producto, (err, response) => {
    if (err) {
      console.error("Error creando producto:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send({ mensaje: response.mensaje });
  });
});

// Ruta para modificar producto
app.put('/modificar-producto', (req, res) => {
  const producto = req.body;
  client.ModificarProducto(producto, (err, response) => {
    if (err) {
      console.error("Error modificando producto:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send({ mensaje: response.mensaje });
  });
});

// Ruta para eliminar producto
app.delete('/eliminar-producto/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  client.EliminarProducto({ codigo }, (err, response) => {
    if (err) {
      console.error("Error eliminando producto:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send({ mensaje: response.mensaje });
  });
});

// Ruta para buscar productos
app.get('/buscar-productos', (req, res) => {
  const nombre = req.query.nombre;
  client.BuscarProductos({ nombre }, (err, response) => {
    if (err) {
      console.error("Error buscando productos:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send(response.productos);
  });
});

// Ruta para alternar estado habilitada de la tienda
app.put('/alternar-habilitada-tienda/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  client.AlternarHabilitadaTienda({ codigo }, (err, response) => {
    if (err) {
      console.error("Error alternando habilitada de la tienda:", err.details);
      res.status(500).send(err.details);
      return;
    }
    res.send({ mensaje: response.mensaje });
  });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
