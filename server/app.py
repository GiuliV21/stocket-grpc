from flask import Flask
from models import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:giuli123@localhost/stockearte'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Crea las tablas en la bd
with app.app_context():
    db.drop_all()  # Elimina todas las tablas
    db.create_all()  