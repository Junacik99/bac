import cv2
import mediapipe as mp
import time
import json # for messages
import asyncio
import ws_client
from calculations import eDist, get_nodturn
import lm_indices as ids
import sys
from arg_loader import load_arguments

# Init FaceMesh
mp_drawing = mp.solutions.drawing_utils
mp_face_mesh = mp.solutions.face_mesh
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)

## For webcam input:
mode = load_arguments(sys.argv) # int - webcam(0 - default) | 'filename' - video file
cap = cv2.VideoCapture(mode)  
prevTime = 0

# Read video input
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
      if mode.isnumeric():
        continue
      else:
        break

    # Flip the image horizontally for a later selfie-view display, and convert
    # the BGR image to RGB.
    # image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # To improve performance, optionally mark the image as not writeable to
    # pass by reference.
    image.flags.writeable = False
    results = face_mesh.process(image)

    # Draw the face mesh annotations on the image.
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    img_h, img_w, img_c = image.shape

    if results.multi_face_landmarks:
      for face_landmarks in results.multi_face_landmarks:
        
        # Calculate how big is gap between lips
        #gap = abs(face_landmarks.landmark[ids.lips_upper].y - face_landmarks.landmark[ids.lips_bottom].y)
        gap = eDist(face_landmarks.landmark[ids.lips_upper], face_landmarks.landmark[ids.lips_bottom])
        
        # Calculate head Nod and Turn
        nod, turn = get_nodturn(face_landmarks.landmark, img_w, img_h)
        
        # Calculate head rotation
        rot = face_landmarks.landmark[ids.face_upper].x - face_landmarks.landmark[ids.face_bottom].x

        # Calculate Blinking
        ed_R_h = eDist(face_landmarks.landmark[ids.eye_right_right], face_landmarks.landmark[ids.eye_right_left])
        ed_R_v = eDist(face_landmarks.landmark[ids.eye_right_upper], face_landmarks.landmark[ids.eye_right_bottom])
        blinkR = ed_R_v/ed_R_h
        ed_L_h = eDist(face_landmarks.landmark[ids.eye_left_right], face_landmarks.landmark[ids.eye_left_left])
        ed_L_v = eDist(face_landmarks.landmark[ids.eye_left_upper], face_landmarks.landmark[ids.eye_left_bottom])
        blinkL = ed_L_v/ed_L_h

        # Horizontal look
        eye_L_h = eDist(face_landmarks.landmark[ids.iris_left], face_landmarks.landmark[ids.eye_left_left]) / eDist(face_landmarks.landmark[ids.eye_left_right], face_landmarks.landmark[ids.eye_left_left])
        eye_R_h = eDist(face_landmarks.landmark[ids.iris_right], face_landmarks.landmark[ids.eye_right_left]) / eDist(face_landmarks.landmark[ids.eye_right_right], face_landmarks.landmark[ids.eye_right_left])

        # Vertical look
        eye_L_v = eDist(face_landmarks.landmark[ids.iris_left], face_landmarks.landmark[ids.eye_left_bottom]) / eDist(face_landmarks.landmark[ids.eye_left_upper], face_landmarks.landmark[ids.eye_left_bottom])
        eye_R_v = eDist(face_landmarks.landmark[ids.iris_right], face_landmarks.landmark[ids.eye_right_bottom]) / eDist(face_landmarks.landmark[ids.eye_right_upper], face_landmarks.landmark[ids.eye_right_bottom])

        # Message to send to websocket server
        msg = json.dumps({
          'gap': gap, 
        'rot': rot, 
        'nod': nod, 
        'turn': turn, 
        'blinkR': blinkR, 
        'blinkL': blinkL,
        'eye_L_H': eye_L_h,
        'eye_R_H': eye_R_h,
        'eye_L_V': eye_L_v,
        'eye_R_V': eye_R_v}) # Velmi to taha dole FPS
        
        # Send data to ws server
        try:
          asyncio.run(ws_client.send(msg))
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

    # text = ""
    # if turn*360 < -10:
    #   text = "Looking Right"
    # elif turn*360 > 10:
    #   text = "Looking Left"
    # else:
    #   text = "Forward"

    # cv2.putText(image, text, (20, 110), cv2.FONT_HERSHEY_PLAIN, 3, (0, 196, 255), 2)
    # cv2.putText(image, f'Turn: {turn}', (300, 70), cv2.FONT_HERSHEY_PLAIN, 1, (0, 196, 255), 2)

    cv2.putText(image, f'FPS: {int(fps)}', (20, 70), cv2.FONT_HERSHEY_PLAIN, 3, (0, 196, 255), 2)
    cv2.imshow('MediaPipe FaceMesh', image)
    if cv2.waitKey(5) & 0xFF == 27:
      break

cap.release
