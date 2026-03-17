import os
import cv2
import numpy as np

# =============================
# LOAD YOLOv4-Tiny MODEL
# =============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

weights_path = os.path.join(BASE_DIR, "yolo", "yolov4-tiny.weights")
config_path = os.path.join(BASE_DIR, "yolo", "yolov4-tiny.cfg")
names_path = os.path.join(BASE_DIR, "yolo", "coco.names")

net = cv2.dnn.readNet(weights_path, config_path)

with open(names_path, "r") as f:
    classes = [line.strip() for line in f.readlines()]

layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

# Vehicle classes we care about
VEHICLE_CLASSES = ["car", "truck", "bus", "motorbike"]


# =============================
# DETECTION FUNCTION
# =============================
def detect_vehicles(frame, draw_boxes=False, lane_mode=False):

    height, width, _ = frame.shape

    blob = cv2.dnn.blobFromImage(
        frame,
        scalefactor=1 / 255,
        size=(416, 416),
        mean=(0, 0, 0),
        swapRB=True,
        crop=False,
    )

    net.setInput(blob)
    outs = net.forward(output_layers)

    # If lane_mode → return single integer
    if lane_mode:
        vehicle_count = 0
    else:
        counts = {"N": 0, "S": 0, "E": 0, "W": 0}

    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > 0.5:
                label = classes[class_id]

                if label in VEHICLE_CLASSES:

                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)

                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)

                    # 🔥 Draw bounding box
                    if draw_boxes:
                        cv2.rectangle(
                            frame,
                            (x, y),
                            (x + w, y + h),
                            (0, 255, 0),
                            2,
                        )
                        cv2.putText(
                            frame,
                            label,
                            (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.5,
                            (0, 255, 0),
                            2,
                        )

                    # Lane-wise mode
                    if lane_mode:
                        vehicle_count += 1
                    else:
                        # Divide frame into 4 regions
                        if center_y < height / 2 and center_x < width / 2:
                            counts["N"] += 1
                        elif center_y < height / 2 and center_x >= width / 2:
                            counts["E"] += 1
                        elif center_y >= height / 2 and center_x < width / 2:
                            counts["W"] += 1
                        else:
                            counts["S"] += 1

    if lane_mode:
        return vehicle_count
    else:
        return counts


# =============================
# STANDALONE TEST MODE
# =============================
if __name__ == "__main__":

    cap = cv2.VideoCapture("traffic.mp4")

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    cv2.namedWindow("YOLO Traffic Detection", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("YOLO Traffic Detection", frame_width, frame_height)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        counts = detect_vehicles(frame, draw_boxes=True)

        # Display region counts
        cv2.putText(
            frame,
            f"N: {counts['N']}  E: {counts['E']}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2,
        )

        cv2.putText(
            frame,
            f"W: {counts['W']}  S: {counts['S']}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2,
        )

        cv2.imshow("YOLO Traffic Detection", frame)

        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyAllWindows()
    