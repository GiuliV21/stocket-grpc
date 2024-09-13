import grpc

import sys
import os

# Añadir el directorio 'generated' al PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), '../generated'))

import stock_pb2
import stock_pb2_grpc


def run():
    # Establece la conexión con el servidor gRPC
    channel = grpc.insecure_channel('localhost:50051')
    
    # Crea un stub (cliente) para el servicio StockearteService
    stub = stock_pb2_grpc.StockearteServiceStub(channel)

    # Llama al método CrearUsuario
    request = stock_pb2.UsuarioRequest(
        nombre_usuario='usuario123',
        contrasena='contraseña123',
        nombre='Juan',
        apellido='Pérez',
        tienda='Tienda A'
    )
    response = stub.CrearUsuario(request)
    
    # Imprime la respuesta del servidor
    print("Response from CrearUsuario:", response.mensaje)

if __name__ == '__main__':
    run()