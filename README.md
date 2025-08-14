Here’s a polished **GitHub README.md** for your Rock Paper Scissors project with all the details you mentioned:

---

```markdown
# 🎮 Real-Time Rock Paper Scissors Detector

A **real-time Rock-Paper-Scissors game** powered by **YOLOv8** for hand detection and classification, with a **Next.js 14 (TypeScript)** frontend and **FastAPI** backend.  
Players show their hands in front of the webcam, the system detects the gestures, and instantly determines the winner for each round.

---

## 📌 Main Idea
This project uses **Computer Vision** to detect hand gestures for Rock, Paper, and Scissors.  
- The **frontend** (Next.js) captures the webcam feed, draws detection boxes, and displays game rounds.  
- The **backend** (FastAPI + YOLOv8) processes images in real-time via WebSocket and sends predictions back.  
- The system keeps track of rounds and announces the **ultimate winner**.

---

## 🖼 Screenshots
<img width="1920" height="1078" alt="vlcsnap-2025-08-14-17h19m55s726" src="https://github.com/user-attachments/assets/75edcebf-6eea-440a-b895-ed53f399d780" />
<img width="1920" height="1078" alt="vlcsnap-2025-08-14-17h19m43s586" src="https://github.com/user-attachments/assets/56ce9971-6d7c-42b4-8153-4b1b556239ed" />

🎥 **See video demo:** [mocklink.com](https://mocklink.com)

---

## 📂 Project Structure
> File structures are based on [this repository](https://github.com/shaeakh)

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

````

---

## 🚀 Setup Instructions

### **1️⃣ Frontend (Next.js 14.2.18 + TypeScript)**
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
````

* Access the frontend at **[http://localhost:3000](http://localhost:3000)**
* The frontend will connect to the backend WebSocket (`ws://127.0.0.1:8000/ws/predict`)

---

### **2️⃣ Backend (FastAPI + YOLOv8)**

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (Windows example)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

* API runs at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
* WebSocket endpoint: **ws\://127.0.0.1:8000/ws/predict**

---

## 🤖 Model Training with Google Colab

We trained our YOLOv8 model using **Roboflow** and **Google Colab**.
📎 **Colab Link:** [Open in Google Colab](https://colab.research.google.com/drive/1Cjfb3QE0jLA8wcqyvgUW_uc-ZClSRbco?usp=sharing)

---

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

#### **Code 2 — Install Requirements**

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

## 🛠 Tech Stack

* **Frontend:** Next.js 14.2.18, TypeScript, Framer Motion, TailwindCSS
* **Backend:** FastAPI, Python, OpenCV, YOLOv8
* **Machine Learning:** Ultralytics YOLO, Roboflow
* **Real-time Communication:** WebSocket

---

## 📄 License

This project is licensed under the MIT License.

---

```

---

If you want, I can also **add a nice project banner** at the top with a title image so your GitHub page looks professional. That usually helps a lot for presentation.  
Do you want me to do that next?
```
