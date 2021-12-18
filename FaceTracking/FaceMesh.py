#Created by MediaPipe
#Modified by Augmented Startups 2021
#Face Mesh Landmarks in 5 Minutes
#Watch 5 Minute Tutorial at www.augmentedstartups.info/YouTube
import cv2
import mediapipe as mp
mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh
import time
##################################
import asyncio
import websockets

async def ws_send(message):
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send(str(message))
        await websocket.recv()


######################################

## For webcam input:
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)
mode = 0 # 0 - webcam | 'filename' - video file
cap = cv2.VideoCapture(mode)  
prevTime = 0

# Identify landmarks indices
lips_upper = 0
lips_bottom = 17

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
        if gap > 0.07:
          # Send data to ws server
          try:
            asyncio.run(ws_send(gap))
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
