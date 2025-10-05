from flask import Flask, request, jsonify
from fingerprint import find_best_match
import os

app = Flask(__name__)

@app.route("/match", methods=["POST"])
def match_fingerprint():
    try:
        data = request.json
        img_path = data.get("filePath")  # multer file path
        doctor_id = data.get("doctorId")

        if not img_path or not os.path.exists(img_path):
            return jsonify({"success": False, "message": "File not found"}), 400

        unique_id, score, user_info = find_best_match(img_path)

        return jsonify({
            "success": True if user_info else False,
            "message": "Match found" if user_info else "No match found",
            "data": {
                "doctorId": doctor_id,
                "patientId": unique_id,
                "similarity": float(score),
                "details": user_info
            } if user_info else {}
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8000, debug=True)
