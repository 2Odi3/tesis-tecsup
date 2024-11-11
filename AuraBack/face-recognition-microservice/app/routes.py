# app/routes.py

from flask import Blueprint, request, jsonify
from app.services import recognize_faces  # Importar la función del servicio

recognition_bp = Blueprint('recognition', __name__)

# http://127.0.0.1:5000/api/recognize_faces
@recognition_bp.route('/recognize_faces', methods=['POST'])
def handle_recognition():
    data = request.get_json()
    aula_code = data.get('aula', None)

    if not aula_code:
        return jsonify({"error": "El código del aula es obligatorio."}), 400

    detected_faces = recognize_faces(aula_code)

    return jsonify({
        "detected_faces": detected_faces,
        "message": "Reconocimiento facial completado"
    })