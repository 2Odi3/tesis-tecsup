# app/routes.py

from flask import Blueprint, request, jsonify
from app.services import recognize_faces, stop_recognition 

recognition_bp = Blueprint('recognition', __name__)

# http://127.0.0.1:5000/api/recognize_faces
@recognition_bp.route('/recognize_faces', methods=['POST'])
def handle_recognition():
    data = request.get_json()
    aula_code = data.get('aula', None)
    recognition_duration = data.get('recognition_duration', 900)  
    if not aula_code:
        return jsonify({"error": "El código del aula es obligatorio."}), 400 
    detected_faces = recognize_faces(aula_code, recognition_duration)

    return jsonify({
        "detected_faces": detected_faces, 
        "message": "Reconocimiento facial completado"
    })


# http://127.0.0.1:5000/api/stop_recognition
@recognition_bp.route('/stop_recognition', methods=['POST'])
def handle_interruption():
    stop_recognition()
    return jsonify({"message": "Reconocimiento interrumpido correctamente."})
