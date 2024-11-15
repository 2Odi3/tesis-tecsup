import cv2
import os
import face_recognition
import time
from threading import Event

# Event global para interrumpir el reconocimiento
stop_recognition_event = Event()

def recognize_faces(aula_code, recognition_duration):
    stop_recognition_event.clear()

    imagesFacesPath = "C:/Users/bruno/Desktop/tesis/oficial/AuraBack/face-recognition-microservice/aula"
    selected_folder = os.path.join(imagesFacesPath, aula_code.lower())

    if not os.path.exists(selected_folder):
        return {"error": "La carpeta del aula no existe."}

    facesEncodings = [] 
    facesNames = []    

    for file_name in os.listdir(selected_folder):
        image = cv2.imread(os.path.join(selected_folder, file_name))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        face_encodings = face_recognition.face_encodings(image)
        
        if face_encodings: 
            f_coding = face_encodings[0]
            facesEncodings.append(f_coding)
            facesNames.append(file_name.split(".")[0])  
        else:
            print(f"No se detectaron caras en la imagen {file_name}")

    cap = cv2.VideoCapture("rtsp://admin:Hik12345@192.168.1.7:554/Streaming/Channels/101/")  

    if not cap.isOpened():
        return {"error": "No se pudo acceder a la cámara RTSP."}

    # Imprimir mensaje de conexión exitosa
    print("Conectado a la cámara RTSP exitosamente.")

    faceClassif = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    start_time = time.time()
    detected_faces = {name: False for name in facesNames}

    while time.time() - start_time < recognition_duration:
        if stop_recognition_event.is_set():
            print("Reconocimiento interrumpido.")
            break
        
        ret, frame = cap.read()

        attempts = 0
        while not ret and attempts < 3:
            print("Error al recibir el fotograma de la cámara RTSP. Reintentando...")
            ret, frame = cap.read()
            attempts += 1
            time.sleep(1) 

        if not ret:
            print("No se pudo obtener un frame después de varios intentos. Saliendo...")
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
                    detected_faces[name] = True  
                else:
                    name = "Unknown"

        # Calcular el tiempo restante y mostrarlo en cuenta regresiva
        time_remaining = recognition_duration - (time.time() - start_time)
        time_remaining_int = int(time_remaining)

        # Solo imprimir el tiempo cuando cambie (por cada segundo)
        if time_remaining_int >= 0:
            print(f"Tiempo restante: {time_remaining_int} segundos.", end="\r")
            time.sleep(1)

    total_time = time.time() - start_time
    print(f"\nTiempo total de reconocimiento: {int(total_time)} segundos.")

    cap.release()

    # Retornar el resultado final con las caras detectadas
    return detected_faces


def stop_recognition():
    # Función para interrumpir el proceso de reconocimiento
    stop_recognition_event.set()
