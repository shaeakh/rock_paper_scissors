from fastapi import FastAPI, File, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import asyncio
import json
import base64

app = FastAPI(title="Rock Paper Scissors API")

# --- CORS (adjust origins as needed) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load YOLO model once ---
model = YOLO("best.pt")  # keep path correct

# --- Decide winner ---
def determine_winner(pred1: str, pred2: str) -> str:
    rules = {"rock": "scissors", "paper": "rock", "scissors": "paper"}
    if pred1 == pred2:
        return "Draw"
    elif rules.get(pred1) == pred2:
        return "Player 1 Wins"
    else:
        return "Player 2 Wins"

# --- Shared inference logic (bytes -> result dict) ---
def process_image_bytes(image_bytes: bytes):
    # Decode bytes to ndarray (BGR)
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return {"error": "ইমেজ ডিকোড করা যায়নি (invalid image data)."}

    # Run YOLO
    results = model.predict(source=image, conf=0.25, verbose=False)

    # Parse predictions: [x1, y1, x2, y2, conf, class_id]
    boxes = results[0].boxes
    if boxes is None or boxes.data is None or len(boxes) == 0:
        return {"error": "No hands detected. Please move to a well-lit area."}


    predictions = boxes.data.tolist()

    # Need at least two hands; if more, take two left-most by x1
    predictions.sort(key=lambda x: x[0])  # x1 ascending
    if len(predictions) < 2:
        return {"error": "Two hands could not be detected. Please try a clearer image.", "detections": len(predictions)}

    left_hand = predictions[0]
    right_hand = predictions[1]

    # Map class IDs -> labels
    try:
        class1 = model.names[int(left_hand[5])]
        class2 = model.names[int(right_hand[5])]
    except Exception:
        return {"error": "There was a problem with class mapping. Please ensure best.pt is correct."}


    winner = determine_winner(class1, class2)

    left_box = [int(left_hand[0]), int(left_hand[1]), int(left_hand[2]), int(left_hand[3])]
    right_box = [int(right_hand[0]), int(right_hand[1]), int(right_hand[2]), int(right_hand[3])]

    return {
        "player1": class1,
        "player2": class2,
        "winner": winner,
        "detections": len(predictions),
        "left_box": left_box,
        "right_box": right_box,
    }

# --- REST endpoint (multipart/form-data) ---
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_data = await file.read()
    return process_image_bytes(image_data)

# --- WebSocket endpoint (expects JSON: { image: "data:image/jpeg;base64,..." }) ---
@app.websocket("/ws/predict")
async def websocket_predict(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive JSON with base64 data URL from the frontend
            data = await websocket.receive_json()
            if "image" not in data or not isinstance(data["image"], str):
                await websocket.send_text(json.dumps({"error": "Image data not found."}))
                continue

            try:
                # data URL format: "data:image/jpeg;base64,<BASE64>"
                data_url = data["image"]
                if "," in data_url:
                    b64_str = data_url.split(",")[1]
                else:
                    b64_str = data_url  # in case only base64 is sent
                image_bytes = base64.b64decode(b64_str)
            except Exception:
                await websocket.send_text(json.dumps({"error": "Image base64 could not be decoded."}))

                continue

            # Run inference via shared function
            result = process_image_bytes(image_bytes)
            await websocket.send_text(json.dumps(result))

            # small pause to avoid overloading the server
            await asyncio.sleep(0.05)

    except Exception as e:
        # Send error back before closing
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except Exception:
            pass
    finally:
        await websocket.close()

# --- Run with: uvicorn main:app --reload ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
