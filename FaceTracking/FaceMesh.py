#Created by MediaPipe
#Modified by Augmented Startups 2021
#Face Mesh Landmarks in 5 Minutes
#Watch 5 Minute Tutorial at www.augmentedstartups.info/YouTube
import cv2
import mediapipe as mp
mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh
import time

import json # for messages
import math # for euclidean distance
##################################
# WebSocket Client
import asyncio
import websockets

async def ws_send(message):
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send(str(message))
        await websocket.recv()
######################################

# Euclaidean distance
def euclaideanDistance(pointA, pointB):
  distance = math.sqrt((pointB.x - pointA.x)**2 + (pointB.y - pointA.y)**2)
  return distance

## For webcam input:
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)
mode = 0 # 0 - webcam | 'filename' - video file
cap = cv2.VideoCapture(mode)  
prevTime = 0

# Identify landmarks indices
lips_upper = 13 #0
lips_bottom = 14 #17
face_upper = 10
face_bottom = 152
face_right = 234
face_left = 454
iris_right = 474 # Facemesh nedetekuje oči, ale vo face_mesh_connections.py sú indexy pre zreničky(zrejme to treba nejako povoliť)
eye_right_upper = 159
eye_right_bottom = 145
eye_right_left = 133
eye_right_right = 33
eye_left_upper = 386
eye_left_bottom = 374
eye_left_left = 263
eye_left_right = 362

with mp_face_mesh.FaceMesh(
    min_detection_confidence=0.5, 
    min_tracking_confidence=0.5) as face_mesh:
  while cap.isOpened():
    success, image = cap.read()
    if not success:
      print("Ignoring empty camera frame.")
      # If loading a video, use 'break' instead of 'continue'.
      if mode == 0:
        continue
      else:
        break

    # Flip the image horizontally for a later selfie-view display, and convert
    # the BGR image to RGB.
    image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
    # To improve performance, optionally mark the image as not writeable to
    # pass by reference.
    image.flags.writeable = False
    results = face_mesh.process(image)

    # Draw the face mesh annotations on the image.
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    if results.multi_face_landmarks:
      for face_landmarks in results.multi_face_landmarks:
        # Calculate how big is gap between lips
        gap = abs(face_landmarks.landmark[lips_upper].y - face_landmarks.landmark[lips_bottom].y)
        # Calculate head rotation
        rot = face_landmarks.landmark[face_upper].x - face_landmarks.landmark[face_bottom].x
        nod = face_landmarks.landmark[face_upper].y - face_landmarks.landmark[face_bottom].y
        turn = face_landmarks.landmark[face_right].z - face_landmarks.landmark[face_left].z
        ed_R_v = euclaideanDistance(face_landmarks.landmark[eye_right_right], face_landmarks.landmark[eye_right_left])
        ed_R_h = euclaideanDistance(face_landmarks.landmark[eye_right_upper], face_landmarks.landmark[eye_right_bottom])
        blinkR = ed_R_h/ed_R_v
        ed_L_v = euclaideanDistance(face_landmarks.landmark[eye_left_right], face_landmarks.landmark[eye_left_left])
        ed_L_h = euclaideanDistance(face_landmarks.landmark[eye_left_upper], face_landmarks.landmark[eye_left_bottom])
        blinkL = ed_L_h/ed_L_v

        # Message to send to websocket server
        msg = json.dumps({'gap':gap, 'rot':rot, 'nod': nod, 'turn': turn, 'blinkR': blinkR, 'blinkL': blinkL}) # Velmi to taha dole FPS
        
        # Send data to ws server
        try:
          asyncio.run(ws_send(msg))
        except ConnectionRefusedError:
          print('WS Server is down')

        mp_drawing.draw_landmarks(
            image=image,
            landmark_list=face_landmarks,
            connections=mp_face_mesh.FACEMESH_LIPS,
            landmark_drawing_spec=drawing_spec,
            connection_drawing_spec=drawing_spec)

    currTime = time.time()
    fps = 1 / (currTime - prevTime)
    prevTime = currTime


    cv2.putText(image, f'FPS: {int(fps)}', (20, 70), cv2.FONT_HERSHEY_PLAIN, 3, (0, 196, 255), 2)
    cv2.imshow('MediaPipe FaceMesh', image)
    if cv2.waitKey(5) & 0xFF == 27:
      break
cap.release
#Watch Tutorial at www.augmentedstartups.info/YouTube
