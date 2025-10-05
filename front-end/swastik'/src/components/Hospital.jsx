import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../components/Hospital.module.css";
import { useLocation, useNavigate } from "react-router-dom";

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const Hospital = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientName, patientCondition, patientLocation } = location.state || {};
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientCondition || !patientLocation) return;

    const fetchMappedHospitals = async () => {
      try {
        setLoading(true);
        const res = await axios.post("http://localhost:5000/api/hospitals/find-hospital", {
          description: patientCondition,
          patientLocation,
        });

        if (res.data.allHospitals?.length > 0) {
          const hospitalsWithDistance = res.data.allHospitals.map((hospital) => {
            const [hospLon, hospLat] = hospital.location.coordinates;
            const [patLon, patLat] = patientLocation;
            const distance = getDistanceFromLatLonInM(patLat, patLon, hospLat, hospLon);
            return { ...hospital, distance };
          });

          hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
          setHospitals(hospitalsWithDistance);
        } else {
          setError("No suitable hospitals found nearby.");
        }
      } catch (err) {
        setError("❌ Could not fetch nearby hospitals.");
      } finally {
        setLoading(false);
      }
    };

    fetchMappedHospitals();
  }, [patientCondition, patientLocation]);

  const handleCardClick = (hospital) => {
    navigate("/route", {
      state: {
        patientLocation,
        hospitalLocation: hospital.location.coordinates,
        hospitalName: hospital.name,
      },
    });
  };

  if (loading) return <p className={styles.para}>Loading nearby hospitals...</p>;
  if (error) return <p className={styles.para} style={{ color: "red" }}>{error}</p>;

  return (
    <div className={styles.outer}>
      <a href="#" onClick={() => navigate(-1)} className={styles.backButton}>
        &larr; Back
      </a>

      <p className={styles.para}>🏥 Nearby Hospitals for {patientName}</p>

      <div className={styles.hospitalContainer}>
        {hospitals.map((hospital) => (
          <div
            key={hospital._id}
            className={styles.hospitalCard}
            onClick={() => handleCardClick(hospital)}
          >
            <div>
              <h3>{hospital.name}</h3>
              <p><strong>Address:</strong> {hospital.address || "N/A"}</p>
              <p><strong>Contact:</strong> {hospital.contactNumber || "N/A"}</p>
              <p><strong>Specialties:</strong> {hospital.specialties.join(", ")}</p>
              <p><strong>Equipment:</strong> {hospital.equipment.map(e => e.name).join(", ")}</p>
              <p><strong>Available Beds:</strong> {hospital.availableBeds?.total || 0}</p>
              <p><strong>ICU Beds:</strong> {hospital.availableBeds?.icu || 0}</p>
            </div>
            <p className={styles.distance}>
              {(hospital.distance / 1000).toFixed(2)} km away
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hospital;
