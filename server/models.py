from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Tienda(db.Model):
    __tablename__ = 'tiendas'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(10), unique=True, nullable=False)
    direccion = db.Column(db.String(100), nullable=False)
    ciudad = db.Column(db.String(50), nullable=False)
    provincia = db.Column(db.String(50), nullable=False)
    habilitada = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Tienda {self.codigo}>'
    




class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre_usuario = db.Column(db.String(80), unique=True, nullable=False)
    contrasena = db.Column(db.String(120), nullable=False)
    nombre = db.Column(db.String(80), nullable=False)
    apellido = db.Column(db.String(80), nullable=False)
    tienda_id = db.Column(db.Integer, db.ForeignKey('tiendas.id'), nullable=True)
    tienda = db.relationship('Tienda', backref=db.backref('usuarios', lazy=True))

    def __repr__(self):
        return f'<Usuario {self.nombre_usuario}>'


class Producto(db.Model):
    __tablename__ = 'productos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(10), unique=True, nullable=False)
    talle = db.Column(db.String(10), nullable=False)
    color = db.Column(db.String(30), nullable=False)
    stock = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<Producto {self.nombre}>'
