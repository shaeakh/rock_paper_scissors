Here’s your README written in the **same style** as that repo, but adapted for your Rock Paper Scissors project:

---

# ✋🤚✌ Real-Time Rock Paper Scissors Detector

A **real-time computer vision game** built with **Next.js (TypeScript)** for the frontend and **FastAPI (Python)** for the backend, powered by **YOLOv8**.
Players face the webcam, show their hands in Rock, Paper, or Scissors, and the system **detects gestures** and **declares the winner** instantly!

---

## 📸 Screenshots & Demo

| Gameplay                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![🎥 See Video Demonstration](https://drive.google.com/file/d/1QuljFWB6R--AeiL0PzOue9kmJxdbelu-/view?usp=drive_link)                  |
| <img width="1920" height="1078" alt="vlcsnap-2025-08-14-17h19m55s726" src="https://github.com/user-attachments/assets/75edcebf-6eea-440a-b895-ed53f399d780" /> |
| <img width="1920" height="1078" alt="vlcsnap-2025-08-14-17h19m43s586" src="https://github.com/user-attachments/assets/56ce9971-6d7c-42b4-8153-4b1b556239ed" /> |

---

## 🎮 Gameplay Overview

**Main Idea:**
This project uses **YOLOv8** to detect two players’ hands in real-time and classify them as **Rock**, **Paper**, or **Scissors**.
It then applies standard game rules to decide the **winner** for each round, tracks the score, and announces the **ultimate winner**.

**Game Flow:**

* Webcam captures both players’ hands.
* YOLO model detects and classifies gestures.
* Game rules are applied to determine the winner.
* Scoreboard and round history are displayed live.

---

## 🛠 Tech Stack

* **Frontend:** Next.js 14.2.18 (TypeScript), TailwindCSS, Framer Motion
* **Backend:** FastAPI (Python), OpenCV, YOLOv8
* **Machine Learning:** Ultralytics YOLO, Roboflow
* **Communication:** WebSocket for real-time detection

---

## 📂 File Structure

> Based on [this repository](https://github.com/shaeakh)

```
frontend/
  ├── public/
  ├── src/
  │   ├── app/
  │   │   ├── page.tsx
  │   │   └── ...
  │   ├── components/
  │   └── styles/
  ├── package.json
  └── tsconfig.json

backend/
  ├── main.py
  ├── best.pt
  ├── requirements.txt
  └── ...
```

---

## 🧑‍💻 How to Run

### **1️⃣ Frontend Setup (Next.js 14.2.18 + TypeScript)**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the app at: **[http://localhost:3000](http://localhost:3000)**

---

### **2️⃣ Backend Setup (FastAPI + YOLOv8)**

```bash
# Navigate to backend
cd backend

# Create virtual environment (Windows example)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

Backend runs at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
WebSocket endpoint: **ws\://127.0.0.1:8000/ws/predict**

---

## 🤖 Model Training (Google Colab)

We trained the YOLOv8 model using **Roboflow** and **Google Colab**.
📎 **Colab Link:** [Open in Google Colab](https://colab.research.google.com/drive/1Cjfb3QE0jLA8wcqyvgUW_uc-ZClSRbco?usp=sharing)
📎 **Dataset:** [Open in Roboflow](https://universe.roboflow.com/roboflow-58fyf/rock-paper-scissors-sxsw))

### **Colab Codes**

#### **Code 1 — Download Dataset**

```python
!pip install roboflow
from roboflow import Roboflow
rf = Roboflow(api_key="your_API_KEY")
project = rf.workspace("roboflow-58fyf").project("rock-paper-scissors-sxsw")
version = project.version(14)
dataset = version.download("yolov8")
```

#### **Code 2 — Install Dependencies**

```bash
pip install roboflow ultralytics opencv-python
```

#### **Code 3 — Train Model**

```python
from ultralytics import YOLO
model = YOLO('yolov8n.pt')
model.train(
    data="rock-paper-scissors-14/data.yaml",
    epochs=10,
    imgsz=640,
    plots=True
)
```

#### **Code 4 — Test Model**

```python
model = YOLO("best.pt-path")
results = model.predict(source="test-image-path", conf=0.3)
results[0].show()
```

#### **Code 5 — Download Trained Model**

```python
from google.colab import files
files.download('best.pt-path')
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

If you want, I can also make a **banner image** for the top of this README so it looks even more professional like a real GitHub showcase.
Do you want me to make that next?
