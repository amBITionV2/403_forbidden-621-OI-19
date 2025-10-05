import React, { useState } from "react";
import styles from "./Patient.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/img/pic1.jpg";

const Patient = () => {
  const [doctorId, setDoctorId] = useState("");
  const [fingerprint, setFingerprint] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!doctorId) {
      alert("Please enter Doctor ID");
      return;
    }
    if (!fingerprint) {
      alert("Please upload a fingerprint image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("doctorId", doctorId);
      formData.append("fingerprint", fingerprint);

      const res = await axios.post("http://localhost:5000/access", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        navigate("/dash", { state: { patient: res.data.data } });
        setDoctorId("");
        setFingerprint(null);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error accessing patient data");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <img src={heroImg} alt="Medical" className={styles.heroImg} />
      </div>

      <div className={styles.rightPane}>
        <div className={styles.card}>
          <h2 className={styles.title}>Patient Access Portal</h2>

          {/* Doctor ID */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Doctor ID</label>
            <input
              type="text"
              placeholder="Enter Doctor ID"
              className={styles.input}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            />
          </div>

          {/* Fingerprint Upload */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Upload Fingerprint</label>
            <input
              type="file"
              accept="image/*"
              className={styles.input}
              onChange={(e) => setFingerprint(e.target.files[0])}
            />
          </div>

          <button className={styles.submitButton} onClick={handleSubmit}>
            Access Records
          </button>
        </div>
      </div>
    </div>
  );
};

export default Patient;
