#Created by MediaPipe
#Modified by Augmented Startups 2021
#Face Mesh Landmarks in 5 Minutes
#Watch 5 Minute Tutorial at www.augmentedstartups.info/YouTube
from turtle import left
import cv2
from matplotlib.pyplot import angle_spectrum
import mediapipe as mp
mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh
# mp_iris = mp.solutions.iris
# iris = mp_iris.Iris()
import time

import json # for messages
import math # for euclidean distance
import numpy as np
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
mode = 0 # int - webcam(0 - default) | 'filename' - video file
cap = cv2.VideoCapture(mode)  
prevTime = 0

# Identify landmarks indices
lips_upper = 13 #0
lips_bottom = 14 #17
face_upper = 10
face_bottom = 152
face_right = 234
face_left = 454
iris_right = 468 # Facemesh nedetekuje oči, ale vo face_mesh_connections.py sú indexy pre zreničky(zrejme to treba nejako povoliť)
iris_left = 473
eye_right_upper = 159
eye_right_bottom = 145
eye_right_left = 133
eye_right_right = 33
eye_left_upper = 386
eye_left_bottom = 374
eye_left_left = 263
eye_left_right = 362

RIGHT_IRIS = [469, 470, 471, 472]
LEFT_IRIS = [474, 475, 476, 477]

with mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True, # for iris. False would return only 468 landmarks
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
    
    nod = 0
    img_h, img_w, img_c = image.shape
    face_3d = []
    face_2d = []

    if results.multi_face_landmarks:
      for face_landmarks in results.multi_face_landmarks:

        for idx, lm in enumerate(face_landmarks.landmark):
          if idx == 33 or idx == 263 or idx == 1 or idx == 61 or idx == 291 or idx == 199:
            x, y = int(lm.x * img_w), int(lm.y * img_h)
            face_2d.append([x, y])
            face_3d.append([x, y, lm.z])

        face_2d = np.array(face_2d, dtype=np.float64)
        face_3d = np.array(face_3d, dtype=np.float64)

        focal_length = 1 * img_w
        cam_matrix = np.array([ [focal_length, 0, img_h / 2],
                                    [0, focal_length, img_w / 2],
                                    [0, 0, 1]])
        dist_matrix = np.zeros((4, 1), dtype=np.float64)

        success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
        rmat, jac = cv2.Rodrigues(rot_vec)
        angles, mtxR, mtxQ, Qx, Qy, Qz = cv2.RQDecomp3x3(rmat)
        nod = angles[0]
        turn = angles[1]
        # rot = angles[2]

        # Calculate how big is gap between lips
        gap = abs(face_landmarks.landmark[lips_upper].y - face_landmarks.landmark[lips_bottom].y)
        # Calculate head rotation
        rot = face_landmarks.landmark[face_upper].x - face_landmarks.landmark[face_bottom].x
        # nod = face_landmarks.landmark[face_upper].y - face_landmarks.landmark[face_bottom].y
        # turn = face_landmarks.landmark[face_right].z - face_landmarks.landmark[face_left].z
        ed_R_h = euclaideanDistance(face_landmarks.landmark[eye_right_right], face_landmarks.landmark[eye_right_left])
        ed_R_v = euclaideanDistance(face_landmarks.landmark[eye_right_upper], face_landmarks.landmark[eye_right_bottom])
        blinkR = ed_R_v/ed_R_h
        ed_L_h = euclaideanDistance(face_landmarks.landmark[eye_left_right], face_landmarks.landmark[eye_left_left])
        ed_L_v = euclaideanDistance(face_landmarks.landmark[eye_left_upper], face_landmarks.landmark[eye_left_bottom])
        blinkL = ed_L_v/ed_L_h

        eye_L_h = euclaideanDistance(face_landmarks.landmark[iris_left], face_landmarks.landmark[eye_left_left]) / euclaideanDistance(face_landmarks.landmark[eye_left_right], face_landmarks.landmark[eye_left_left])
        eye_R_h = euclaideanDistance(face_landmarks.landmark[iris_right], face_landmarks.landmark[eye_right_left]) / euclaideanDistance(face_landmarks.landmark[eye_right_right], face_landmarks.landmark[eye_right_left])

        # Message to send to websocket server
        msg = json.dumps({'gap':gap, 
        'rot':rot, 
        'nod': nod, 
        'turn': turn, 
        'blinkR': blinkR, 
        'blinkL': blinkL,
        'eye_L_H': eye_L_h,
        'eye_R_H': eye_R_h}) # Velmi to taha dole FPS
        
        # Send data to ws server
        try:
          asyncio.run(ws_send(msg))
        except ConnectionRefusedError:
          print('WS Server is down')

        # Draw landmarks and connections
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
    # cv2.putText(image, f'nod: {nod}', (20, 70), cv2.FONT_HERSHEY_PLAIN, 3, (0, 196, 255), 2)
    cv2.imshow('MediaPipe FaceMesh', image)
    if cv2.waitKey(5) & 0xFF == 27:
      break
cap.release
#Watch Tutorial at www.augmentedstartups.info/YouTube
