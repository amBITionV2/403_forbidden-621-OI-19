import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../components/NewLog.module.css";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/img/pic3.jpg"; // replace with your medical/ambulance image
import { TbLogs } from "react-icons/tb";
const NewLog = () => {
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientCondition, setPatientCondition] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [patientLocation, setPatientLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPatientLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {
        setLocationError("Please allow location access to fetch nearby hospitals");
      }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!patientName || !patientAge || !patientGender || !patientCondition) {
      setMessage("❌ Please fill all fields!");
      setMessageType("error");
      return;
    }

    if (!patientLocation) {
      setMessage("❌ Waiting for your location. Please allow location access.");
      setMessageType("error");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/newlog", {
        patientName,
        patientAge,
        patientGender,
        patientCondition,
        patientLocation,
      });

      if (res.data.success) {
        setMessage("✅ Patient log created successfully!");
        setMessageType("success");

        setPatientName("");
        setPatientAge("");
        setPatientGender("");
        setPatientCondition("");

        navigate("/near", {
          state: { patientName, patientCondition, patientLocation },
        });
      } else {
        setMessage(`❌ ${res.data.message || "Something went wrong"}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error("Axios error:", err.message);
      setMessage("❌ Server not reachable. Check IP & network.");
      setMessageType("error");
    }
  };

  return (
    <>
                  <a href="#" onClick={() => navigate(-1)} className={styles.backButton}>
          &larr; Back
        </a>
    <div className={styles.container}>
      {/* Left: Form */}
      <div className={styles.leftPane}>

        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.logo}><TbLogs /></span>
            <h1 className={styles.heading}>Patient Log Entry</h1>
            <p className={styles.caption}>Enter patient info and condition</p>
          </div>

          {locationError && (
            <p className={styles.error}>{locationError}</p>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />

            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="Age"
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
              <select
                className={styles.input}
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <textarea
              className={styles.textarea}
              placeholder="Describe condition..."
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
            />

            <button type="submit" className={styles.button}>
              Create Log
            </button>
          </form>

          {message && (
            <p
              className={`${styles.message} ${
                messageType === "success" ? styles.success : styles.error
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Right: Image */}
      <div className={styles.rightPane}>
        <img src={heroImg} alt="Medical" className={styles.heroImg} />
      </div>
    </div>
    </>
  );
};

export default NewLog;
