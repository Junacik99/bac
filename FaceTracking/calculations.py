# Calculations
import math
import numpy as np
import cv2
import lm_indices as ids

# Euclidean distance
def eDist(pointA, pointB):
  distance = math.sqrt((pointB.x - pointA.x)**2 + (pointB.y - pointA.y)**2)
  return distance

# Nod and Turn of head
def get_nodturn(landmarks, img_w, img_h):
    face_3d = []
    face_2d = []

    for idx, lm in enumerate(landmarks):
        if idx == ids.eye_right_right or idx == ids.eye_left_left or idx == ids.nose or idx == ids.lips_right or idx == ids.lips_left or idx == ids.face_bottom:
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

    return angles[0], angles[1] # angles[2] is the rotation/roll