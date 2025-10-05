// Dash.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import styles from "./Dash.module.css";

const Dash = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  if (!patient) {
    return <p className={styles.emptyMsg}>No patient data available</p>;
  }

  // Format vitals with Label (dd Mon) and FullDate (dd Mon yyyy)
  const vitals = (patient.VitalsHistory || []).map(v => {
    const dateObj = new Date(v.Date);
    return {
      Label: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      FullDate: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...v,
    };
  });

  // Labs comparison (example previous values)
  const labs = patient.LabResults
    ? [
        { Test: "Hemoglobin", Current: patient.LabResults.Hemoglobin, Previous: 12.8 },
        { Test: "Cholesterol", Current: patient.LabResults.Cholesterol, Previous: 210 },
        { Test: "Creatinine", Current: patient.LabResults.Creatinine, Previous: 1.2 },
      ]
    : [];

  // Medication adherence
  const med = patient.MedicationAdherence || [];
  const taken = med.filter((m) => m.Taken === 1).length;
  const missed = med.length - taken;
  const medData = [
    { name: "Taken", value: taken },
    { name: "Missed", value: missed },
  ];
  const COLORS = ["#22c55e", "#ef4444"];

  // Recent visits with Label + FullDate
  const visits = (patient.RecentVisits || []).map(v => {
    const dateObj = new Date(v.Date);
    return {
      Label: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      FullDate: dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      ...v.VitalsComparison,
    };
  });

  // Custom tooltip formatter to show FullDate
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const fullDate = payload[0].payload.FullDate; // we stored this earlier
      return (
        <div style={{ background: "#fff", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "6px" }}>
          <p style={{ margin: 0, fontWeight: "600" }}>{fullDate}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ margin: "2px 0", color: item.stroke || item.fill }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Patient Dashboard</h2>

      {/* Patient Info Card */}
      <div className={styles.infoCard}>
        <h3>{patient.Name}</h3>
        <p><strong>ID:</strong> {patient.PatientID}</p>
        <p><strong>Age:</strong> {patient.Age}</p>
        <p><strong>Gender:</strong> {patient.Gender}</p>
        <p><strong>Blood Group:</strong> {patient.BloodGroup}</p>
        <p><strong>Contact:</strong> {patient.Contact}</p>
        <p><strong>Address:</strong> {patient.Address}</p>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartGrid}>
        
        {/* Blood Pressure */}
        <div className={styles.chartCard}>
          <h3>Blood Pressure Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="Systolic_BP" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Diastolic_BP" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Heart Rate & Sugar */}
        <div className={styles.chartCard}>
          <h3>Heart Rate & Sugar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vitals}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="Heart_Rate" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Sugar_Level" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Medication Adherence */}
        <div className={styles.chartCard}>
          <h3>Medication Adherence</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={medData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {medData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Lab Results */}
        <div className={styles.chartCard}>
          <h3>Lab Results (Current vs Previous)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={labs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Test" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Previous" fill="#94a3b8" />
              <Bar dataKey="Current" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Visits */}
        <div className={styles.chartCard}>
          <h3>Recent Visit Comparisons</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Label" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="Systolic_BP" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Diastolic_BP" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Heart_Rate" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Sugar_Level" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dash;
