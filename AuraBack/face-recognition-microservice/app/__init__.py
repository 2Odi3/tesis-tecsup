# app/__init__.py

from flask import Flask

def create_app():
    app = Flask(__name__)

    # Importar el blueprint y registrar las rutas
    from app.routes import recognition_bp
    app.register_blueprint(recognition_bp, url_prefix='/api')

    return app