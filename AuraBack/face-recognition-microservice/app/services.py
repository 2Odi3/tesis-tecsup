import cv2
import os
import face_recognition
import time

def recognize_faces(aula_code):
    imagesFacesPath = "C:/Users/bruno/Desktop/tesis/oficial/AuraBack/face-recognition-microservice/aula"
    selected_folder = os.path.join(imagesFacesPath, aula_code.lower())

    if not os.path.exists(selected_folder):
        return {"error": "La carpeta del aula no existe."}, 400

    facesEncodings = []  # Corregir el nombre de la variable
    facesNames = []

    # Cargar las imágenes y sus codificaciones faciales
    for file_name in os.listdir(selected_folder):
        image = cv2.imread(os.path.join(selected_folder, file_name))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Obtener las codificaciones faciales
        face_encodings = face_recognition.face_encodings(image)
        
        if face_encodings:  # Verificar que se hayan detectado caras
            f_coding = face_encodings[0]
            facesEncodings.append(f_coding)
            facesNames.append(file_name.split(".")[0])  # Eliminar extensión del nombre del archivo
        else:
            print(f"No se detectaron caras en la imagen {file_name}")

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        return {"error": "No se pudo acceder a la cámara."}, 500
    
    faceClassif = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    start_time = time.time()
    end_time = start_time + 60  # Un minuto
    detected_faces = {name: False for name in facesNames}  # Inicializar todos los nombres como no reconocidos

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        orig = frame.copy()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceClassif.detectMultiScale(gray, 1.1, 5)

        for (x, y, w, h) in faces:
            face = orig[y:y + h, x:x + w]
            face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
            actual_face_encoding = face_recognition.face_encodings(face)

            if actual_face_encoding:
                result = face_recognition.compare_faces(facesEncodings, actual_face_encoding[0])

                if True in result:
                    index = result.index(True)
                    name = facesNames[index]
                    detected_faces[name] = True  # Marcar como reconocido
                else:
                    name = "Unknown"

        time_left = int(end_time - time.time())
        print(f"Tiempo restante: {time_left} segundos", end='\r')

        if time_left <= 0:
            break

        k = cv2.waitKey(1) & 0xFF
        if k == 27:  # Salir si se presiona 'Esc'
            break

    cap.release()
    cv2.destroyAllWindows()

    return detected_faces  # Devolver el diccionario de reconocimiento
