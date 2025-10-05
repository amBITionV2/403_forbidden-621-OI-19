# 🏥 Swastcare — Centralized Fingerprint Authentication System

Swastcare is a **modern Hospital Management System (HMS)** that integrates a **Centralized Fingerprint Authentication System** to enable secure and fast patient verification across hospitals.  
It simplifies patient management, appointments, and healthcare operations through a unified digital platform.

---

## 🚀 Overview

The **Centralized Fingerprint Authentication System** allows hospitals to authenticate patients instantly using their fingerprints.  
Each fingerprint is converted into a **CNN-based embedding**, encrypted, and stored in a **central MongoDB database** for cross-hospital access — ensuring speed, accuracy, and data privacy.

### 🔑 Core Highlights

- **Fast Authentication:** CNN + ANN-based fingerprint matching  
- **Centralized Database:** Accessible across multiple hospitals  
- **Secure Embedding Storage:** Fingerprints never stored as images  
- **Seamless Integration:** Works with Swastcare’s patient management system  

---

## 🏗️ System Architecture

### 1. Fingerprint Extraction  
- CNN model extracts a **unique embedding vector** from each fingerprint image.

### 2. Central Database  
- MongoDB stores **encrypted embeddings** linked with patient IDs.  
- The API layer handles secure hospital-to-database communication.

### 3. Matching Process  
- Query fingerprint → Preprocessing → Embedding extraction  
- ANN (Approximate Nearest Neighbor) search using **hnswlib**  
- Closest match identified and verified against the database  

---

## ✨ Features

### 🩺 Hospital Management
- 👨‍⚕ **Patient Management:** Register, update, and view patient records  
- 📅 **Appointment Booking:** Slot-based scheduling system  
- 📝 **Symptom Checker:** Multi-step React-based health form  
- 🚑 **Service Logs:** Track ambulances, medical services, and emergency responses  
- 👩‍💼 **Employee Management:** Manage doctors, nurses, and administrative staff  
- 💳 **Payment Integration (Optional):** Razorpay for secure billing  
- 📊 **Responsive Dashboard:** Works seamlessly across mobile and desktop  

---

## 🛠 Tech Stack

### 💻 Frontend
- React.js  
- Tailwind CSS / CSS Modules  

### ⚙️ Backend
- Node.js  
- Express.js  
- MongoDB (Primary database)  
- SQLite (Optional for local testing)  

### 🔬 Fingerprint Authentication (Python Service)
- Python 3.10+  
- PyTorch  
- torchvision  
- numpy  
- pandas  
- hnswlib  
- scikit-learn  
- pymongo  
- Pillow  

### 🔐 Optional Services
- Firebase – for authentication and file storage  
- Razorpay – for online payments  

---

## 📂 Project Structure


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
MONGO_URI=mongodb+srv://<your-cluster-url>
PORT=5000
cd frontend
npm install
npm start
cd fingerprint-service
pip install torch torchvision numpy pandas hnswlib scikit-learn pymongo Pillow
python match_fingerprint.py
