import os
import torch
from PIL import Image
import numpy as np
import hnswlib
from torchvision import transforms
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import torch.nn as nn
import torch.nn.functional as F

# ------------------------
# Base paths
# ------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ------------------------
# 1. CNN Model
# ------------------------
class FingerprintCNN(nn.Module):
    def __init__(self, embedding_dim=128):
        super(FingerprintCNN, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 32, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, 1, 1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, 1, 1), nn.ReLU(), nn.AdaptiveAvgPool2d((1, 1))
        )
        self.fc = nn.Linear(128, embedding_dim)

    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        x = F.normalize(self.fc(x))
        return x

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = FingerprintCNN().to(device)
model.load_state_dict(torch.load(os.path.join(BASE_DIR, "fingerprint_cnn_10k.pth"), map_location=device))
model.eval()

# ------------------------
# 2. Load embeddings & ANN index (use .npy instead of .enc)
# ------------------------
embeddings = np.load(os.path.join(BASE_DIR, "embeddings_10k.npy"))

with open(os.path.join(BASE_DIR, "image_ids_10k.csv"), "r", encoding="latin1") as f:
    image_ids = [line.strip() for line in f if line.strip()]

ann_index = hnswlib.Index(space="cosine", dim=embeddings.shape[1])
ann_index.load_index(os.path.join(BASE_DIR, "fingerprint_ann_10k.bin"))
ann_index.set_ef(50)

# ------------------------
# 3. Image preprocessing
# ------------------------
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize([0.5], [0.5])
])

def get_embedding(img_path):
    if not os.path.exists(img_path):
        raise FileNotFoundError(f"❌ Image not found: {img_path}")
    img = Image.open(img_path).convert("L")
    img_tensor = transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        emb = model(img_tensor).cpu().numpy()
    return emb

# ------------------------
# 4. MongoDB
# ------------------------
client = MongoClient("mongodb://localhost:27017/")
db1 = client["patientDashboard"]
patients = db1["patients"]

# ------------------------
# 5. Match function
# ------------------------
def find_best_match(img_path, top_k=5):
    emb = get_embedding(img_path)
    labels, _ = ann_index.knn_query(emb, k=top_k)
    sims = cosine_similarity(emb, embeddings[labels[0]])[0]

    best_idx = sims.argmax()
    best_match_index = labels[0][best_idx]
    similarity = sims[best_idx]
    unique_id = os.path.basename(image_ids[best_match_index])

    user_data = None
    if similarity == 1.0:
        user_data = patients.find_one({"PatientID": unique_id}, {"_id": 0})

    return unique_id, similarity, user_data
