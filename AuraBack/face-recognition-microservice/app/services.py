import cv2
import os
import face_recognition
import time

def recognize_faces(aula_code):
    imagesFacesPath = "C:/Users/bruno/Desktop/tesis/oficial/AuraBack/face-recognition-microservice/aula"
    selected_folder = os.path.join(imagesFacesPath, aula_code.lower())

    if not os.path.exists(selected_folder):
        return {"error": "La carpeta del aula no existe."}, 400

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
        return {"error": "No se pudo acceder a la cámara RTSP."}, 500
    
    faceClassif = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    start_time = time.time()
    detected_faces = {name: False for name in facesNames}

    try:
        while True:
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

            if cv2.waitKey(1) & 0xFF == 27:  
                print("Cerrando el ciclo...")
                break

    except Exception as e:
        print(f"Error inesperado: {e}")
    
    finally:
        cap.release()
        cv2.destroyAllWindows()

        total_time = time.time() - start_time
        print(f"\nTiempo total de reconocimiento: {total_time:.2f} segundos")

    return detected_faces
