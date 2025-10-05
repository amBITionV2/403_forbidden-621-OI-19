import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Route.module.css";
const Route = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { patientLocation, hospitalLocation, hospitalName } = state || {};
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  const [patientAddress, setPatientAddress] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");

  // reverse geocode helper
  const fetchAddress = async (lat, lon, setter) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setter(data.display_name || "Unknown Location");
    } catch {
      setter("Unknown Location");
    }
  };

  useEffect(() => {
    if (patientLocation) {
      fetchAddress(patientLocation[1], patientLocation[0], setPatientAddress);
    }
    if (hospitalLocation) {
      fetchAddress(hospitalLocation[1], hospitalLocation[0], setHospitalAddress);
    }
  }, [patientLocation, hospitalLocation]);

  useEffect(() => {
    if (patientLocation && hospitalLocation && mapContainerRef.current && !mapRef.current) {
      const from = [patientLocation[1], patientLocation[0]];
      const to = [hospitalLocation[1], hospitalLocation[0]];

      // create map
      mapRef.current = L.map(mapContainerRef.current).setView(from, 10);

      // tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Route Map",
      }).addTo(mapRef.current);

      // patient marker
      L.marker(from).addTo(mapRef.current).bindPopup("🚑 Patient Location");

      // hospital marker
      L.marker(to).addTo(mapRef.current).bindPopup(`🏥 ${hospitalName}`);

      // calculate curve
      const midLat = (from[0] + to[0]) / 2;
      const midLng = (from[1] + to[1]) / 2;
      const offsetLat = (to[0] - from[0]) * 0.3;
      const offsetLng = (to[1] - from[1]) * 0.3;
      const curvePoint = [midLat + offsetLng, midLng - offsetLat];

      const curvePoints = [];
      for (let t = 0; t <= 1; t += 0.02) {
        const lat =
          (1 - t) * (1 - t) * from[0] +
          2 * (1 - t) * t * curvePoint[0] +
          t * t * to[0];
        const lng =
          (1 - t) * (1 - t) * from[1] +
          2 * (1 - t) * t * curvePoint[1] +
          t * t * to[1];
        curvePoints.push([lat, lng]);
      }

      L.polyline(curvePoints, {
        color: "black",
        weight: 3,
        opacity: 1,
        dashArray: "6,6",
        className: styles.animatedLine,
      }).addTo(mapRef.current);

      // fit bounds
      const bounds = L.latLngBounds([from, to]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [patientLocation, hospitalLocation, hospitalName]);

  if (!patientLocation || !hospitalLocation) {
    return <p className={styles.error}>⚠️ Location details missing!</p>;
  }

  return (
    <div className={styles.outer}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.content}>
        <div className={styles.mapWrapper}>
          <div ref={mapContainerRef} id="map" className={styles.mapContainer} />
        </div>

        <div className={styles.detailsCard}>
          <h2 className={styles.title}>🏥 {hospitalName}</h2>

          <div className={styles.infoGroup}>
            <span className={styles.label}>📍 Patient Location:</span>
            <span className={styles.value}>{patientAddress}</span>
          </div>

          <div className={styles.infoGroup}>
            <span className={styles.label}>🏥 Hospital Address:</span>
            <span className={styles.value}>{hospitalAddress}</span>
          </div>

          <a
            href={`https://www.google.com/maps/dir/${patientLocation[1]},${patientLocation[0]}/${hospitalLocation[1]},${hospitalLocation[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapButton}
          >
            🚗 Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default Route;
