import grpc
from concurrent import futures
import stock_pb2
import stock_pb2_grpc
from models import db, Usuario, Tienda, Producto
from app import app
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# servicios de Stock
class StockearteService(stock_pb2_grpc.StockearteServiceServicer):

    def CrearUsuario(self, request, context):
        logging.debug("Received CrearUsuario request: %s", request)
        print("Datos recibidos en el servidor:", request)  # <-- Agregar este log
        print("Codigo de Tienda:", request.tienda)  # <-- Verificar el campo de la tienda
        try:
            with app.app_context():
                # Busca la tienda por código
                tienda = Tienda.query.filter_by(codigo=request.tienda).first()
                if not tienda:
                    logging.error("Tienda con código %s no encontrada", request.tienda)
                    context.set_details("Tienda no encontrada")
                    context.set_code(grpc.StatusCode.NOT_FOUND)
                    return stock_pb2.UsuarioResponse(mensaje="Tienda no encontrada")
                
                # Crear nuevo usuario con la tienda encontrada
                nuevo_usuario = Usuario(
                    nombre_usuario=request.nombre_usuario,
                    contrasena=request.contrasena,
                    nombre=request.nombre,
                    apellido=request.apellido,
                    tienda=tienda  
                )
                db.session.add(nuevo_usuario)
                db.session.commit()
                logging.info("Usuario creado exitosamente: %s", request.nombre_usuario)
                return stock_pb2.UsuarioResponse(mensaje="Usuario creado exitosamente")
        except Exception as e:
            logging.error("Error al crear usuario: %s", str(e))
            context.set_details("Error al crear usuario")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.UsuarioResponse(mensaje="Error interno del servidor")


    # def AutenticarUsuario(self, request, context):
    #     logging.debug("Received AutenticarUsuario request: %s", request)
    #     try:
    #         with app.app_context():
    #             usuario = Usuario.query.filter_by(nombre_usuario=request.nombre_usuario, contrasena=request.contrasena).first()
    #             if usuario:
    #                 logging.info("Autenticación exitosa para usuario: %s", request.nombre_usuario)
    #                 return stock_pb2.LoginResponse(mensaje="Autenticación exitosa")
    #             logging.warning("Autenticación fallida para usuario: %s", request.nombre_usuario)
    #             return stock_pb2.LoginResponse(mensaje="Autenticación fallida")
    #     except Exception as e:
    #         logging.error("Error al autenticar usuario: %s", str(e))
    #         context.set_details("Error al autenticar usuario")
    #         context.set_code(grpc.StatusCode.INTERNAL)
    #         return stock_pb2.LoginResponse(mensaje="Error interno del servidor")
        def AutenticarUsuario(self, request, context):
            logging.debug("Received AutenticarUsuario request: %s", request)
            try:
                with app.app_context():
                    usuario = Usuario.query.filter_by(nombre_usuario=request.nombre_usuario, contrasena=request.contrasena).first()
                    if usuario:
                        logging.info("Autenticación exitosa para usuario: %s", request.nombre_usuario)
                        return stock_pb2.LoginResponse(mensaje="Autenticación exitosa", exito=True)
                    logging.warning("Autenticación fallida para usuario: %s", request.nombre_usuario)
                    return stock_pb2.LoginResponse(mensaje="Autenticación fallida", exito=False)
            except Exception as e:
                logging.error("Error al autenticar usuario: %s", str(e))
                context.set_details("Error al autenticar usuario")
                context.set_code(grpc.StatusCode.INTERNAL)
                return stock_pb2.LoginResponse(mensaje="Error interno del servidor", exito=False)



    def CrearTienda(self, request, context):
        logging.debug("Received CrearTienda request: %s", request)
        try:
            with app.app_context():
                nueva_tienda = Tienda(
                    codigo=request.codigo,
                    direccion=request.direccion,
                    ciudad=request.ciudad,
                    provincia=request.provincia,
                    habilitada=request.habilitada
                )
                db.session.add(nueva_tienda)
                db.session.commit()
                logging.info("Tienda creada exitosamente: %s", request.codigo)
                return stock_pb2.TiendaResponse(mensaje="Tienda creada exitosamente")
        except Exception as e:
            logging.error("Error al crear tienda: %s", str(e))
            context.set_details("Error al crear tienda")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.TiendaResponse(mensaje="Error interno del servidor")

    def ModificarTienda(self, request, context):
        logging.debug("Received ModificarTienda request: %s", request)
        try:
            with app.app_context():
                tienda = Tienda.query.filter_by(codigo=request.codigo).first()
                if tienda:
                    tienda.direccion = request.direccion
                    tienda.ciudad = request.ciudad
                    tienda.provincia = request.provincia
                    tienda.habilitada = request.habilitada
                    db.session.commit()
                    logging.info("Tienda modificada exitosamente: %s", request.codigo)
                    return stock_pb2.TiendaResponse(mensaje="Tienda modificada exitosamente")
                logging.warning("Tienda no encontrada: %s", request.codigo)
                return stock_pb2.TiendaResponse(mensaje="Tienda no encontrada")
        except Exception as e:
            logging.error("Error al modificar tienda: %s", str(e))
            context.set_details("Error al modificar tienda")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.TiendaResponse(mensaje="Error interno del servidor")

    def AlternarHabilitadaTienda(self, request, context):
        logging.debug("Received AlternarHabilitadaTienda request: %s", request)
        try:
            with app.app_context():
                tienda = Tienda.query.filter_by(codigo=request.codigo).first()
                if tienda:
                    # Alternar el estado de habilitada
                    tienda.habilitada = not tienda.habilitada
                    db.session.commit()
                    estado = "habilitada" if tienda.habilitada else "deshabilitada"
                    logging.info("Tienda %s cambiada a: %s", request.codigo, estado)
                    return stock_pb2.TiendaResponse(mensaje=f"Tienda {estado} exitosamente")
                logging.warning("Tienda no encontrada: %s", request.codigo)
                return stock_pb2.TiendaResponse(mensaje="Tienda no encontrada")
        except Exception as e:
            logging.error("Error al alternar habilitada de la tienda: %s", str(e))
            context.set_details("Error al alternar habilitada de la tienda")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.TiendaResponse(mensaje="Error interno del servidor")


    def CrearProducto(self, request, context):
        logging.debug("Received CrearProducto request: %s", request)
        try:
            with app.app_context():
                # Comprobar si el producto ya existe según su código
                producto_existente = Producto.query.filter_by(codigo=request.codigo).first()
                if producto_existente:
                    context.set_details("Producto con ese código ya existe")
                    context.set_code(grpc.StatusCode.ALREADY_EXISTS)
                    return stock_pb2.ProductoResponse(mensaje="El producto ya existe")

                # Crear un nuevo producto con los datos del request
                nuevo_producto = Producto(
                    nombre=request.nombre,
                    codigo=request.codigo,
                    talle=request.talle,
                    color=request.color,
                    stock=request.stock
                )
                db.session.add(nuevo_producto)
                db.session.commit()

                logging.info("Producto creado exitosamente: %s", request.codigo)
                
                return stock_pb2.ProductoResponse(
                    mensaje="Producto creado exitosamente",
                    codigo=request.codigo
                )
        except Exception as e:
            logging.error("Error al crear producto: %s", str(e), exc_info=True)
            context.set_details("Error interno del servidor: " + str(e))
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.ProductoResponse(mensaje="Error interno del servidor")


    def ModificarProducto(self, request, context):
        logging.debug("Received ModificarProducto request: %s", request)
        try:
            with app.app_context():
                producto = Producto.query.filter_by(codigo=request.codigo).first()
                if producto:
                    producto.nombre = request.nombre
                    producto.talle = request.talle
                    producto.color = request.color
                    producto.stock = request.stock
                    db.session.commit()
                    logging.info("Producto modificado exitosamente: %s", request.codigo)
                    return stock_pb2.ProductoResponse(mensaje="Producto modificado exitosamente")
                logging.warning("Producto no encontrado: %s", request.codigo)
                return stock_pb2.ProductoResponse(mensaje="Producto no encontrado")
        except Exception as e:
            logging.error("Error al modificar producto: %s", str(e))
            context.set_details("Error al modificar producto")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.ProductoResponse(mensaje="Error interno del servidor")

    def EliminarProducto(self, request, context):
        logging.debug("Received EliminarProducto request: %s", request)
        try:
            with app.app_context():
                producto = Producto.query.filter_by(codigo=request.codigo).first()
                if producto:
                    db.session.delete(producto)
                    db.session.commit()
                    logging.info("Producto eliminado exitosamente: %s", request.codigo)
                    return stock_pb2.ProductoResponse(mensaje="Producto eliminado exitosamente")
                logging.warning("Producto no encontrado: %s", request.codigo)
                return stock_pb2.ProductoResponse(mensaje="Producto no encontrado")
        except Exception as e:
            logging.error("Error al eliminar producto: %s", str(e))
            context.set_details("Error al eliminar producto")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.ProductoResponse(mensaje="Error interno del servidor")


    def BuscarProductos(self, request, context):
        logging.debug("Received BuscarProductos request: %s", request)
        try:
            with app.app_context():
                productos = Producto.query.filter(Producto.nombre.ilike(f'%{request.nombre}%')).all()
                respuesta = stock_pb2.BuscarProductosResponse()
                for producto in productos:
                    producto_proto = stock_pb2.Producto(
                        nombre=producto.nombre,
                        codigo=producto.codigo,
                        talle=producto.talle,
                        color=producto.color,
                        stock=producto.stock
                    )
                    respuesta.productos.append(producto_proto)
                logging.info("Productos encontrados: %d", len(productos))
                return respuesta
        except Exception as e:
            logging.error("Error al buscar productos: %s", str(e))
            context.set_details("Error al buscar productos")
            context.set_code(grpc.StatusCode.INTERNAL)
            return stock_pb2.BuscarProductosResponse()

# para iniciar el servidor gRPC
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    stock_pb2_grpc.add_StockearteServiceServicer_to_server(StockearteService(), server)
    server.add_insecure_port('[::]:50051')
    logging.info("Servidor gRPC corriendo en el puerto 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
