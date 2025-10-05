// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

// Import models
const PatientModule = require("./models/Patient");
const NewLogModule = require("./models/NewLog");
const HospitalModule = require("./models/Hospital");
const hospitalRoutes = require("./routes/hospitalRoutes");

const app = express();

/* -------------------- Middleware -------------------- */
app.use(
  cors({
    origin: "http://localhost:5174",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json());

// configure multer for fingerprint upload
const upload = multer({ dest: "uploads/" });

// simple health check
app.get("/ping", (req, res) => res.json({ message: "Server is alive" }));

/* -------------------- Create DB connections -------------------- */
const patientDB = mongoose.createConnection(
  "mongodb://localhost:27017/patientDashboard",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const logDB = mongoose.createConnection(
  "mongodb://localhost:27017/ambulancelogs",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

patientDB.on("connected", () => console.log("✅ Connected to patientDashboard DB"));
logDB.on("connected", () => console.log("✅ Connected to ambulancelogs DB"));

/* -------------------- Helper -------------------- */
const pickSchema = (mod) => mod?.schema || mod;

/* -------------------- Bind models -------------------- */
const PatientSchema = pickSchema(PatientModule);
const NewLogSchema = pickSchema(NewLogModule);
const HospitalSchema = pickSchema(HospitalModule);

const PatientModel = patientDB.model("Patient", PatientSchema);
const NewLogModel = logDB.model("NewLog", NewLogSchema);
const HospitalModel = logDB.model("Hospital", HospitalSchema);

/* -------------------- Attach hospital routes -------------------- */
app.use("/api/hospitals", (req, res, next) => {
  req.HospitalModel = HospitalModel;
  next();
}, hospitalRoutes);

/* -------------------- Ambulance Log Routes -------------------- */

// Create new log
app.post("/newlog", async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      patientCondition,
      patientLocation,
      fromAddress,
    } = req.body;

    const newLog = new NewLogModel({
      trackingId: uuidv4(),
      patientName,
      patientAge,
      patientGender,
      patientCondition,
      patientLocation: Array.isArray(patientLocation)
        ? { type: "Point", coordinates: patientLocation }
        : undefined,
      fromAddress,
    });

    await newLog.save();
    res.status(201).json({ success: true, data: newLog });
  } catch (err) {
    console.error("Error creating new log:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update hospital info
app.patch("/update-hospital", async (req, res) => {
  try {
    const { ambulanceNo, doctorName, hospitalName, hospitalAddress } = req.body;
    if (!ambulanceNo || !doctorName || !hospitalName || !hospitalAddress) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const log = await NewLogModel.findOne({ ambulanceNo, juniorDoctor: doctorName });
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });

    log.toAddress = hospitalAddress;
    log.assignedHospital = hospitalName;

    await log.save();
    res.json({ success: true, data: log });
  } catch (err) {
    console.error("Error updating hospital:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Fetch all logs
app.get("/newlog", async (req, res) => {
  try {
    const logs = await NewLogModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------- Patient Dashboard Routes -------------------- */

// Get all patients for a doctor
app.get("/patient-dashboard/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const patients = await PatientModel.find({ DoctorID: doctorId }).sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (err) {
    console.error("Error fetching patient dashboard:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Access patient by fingerprint (with upload + Python model)
app.post("/access", upload.single("fingerprint"), async (req, res) => {
  try {
    const doctorId = req.body.doctorId;
    const filePath = path.resolve(req.file.path);

    // call Python model API
    const response = await axios.post("http://localhost:8000/match", {
      doctorId,
      filePath,
    });

    if (response.data.success) {
      const { patientId } = response.data.data;
      const patient = await PatientModel.findOne({ PatientID: patientId });
      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found in DB" });
      }
      return res.json({ success: true, data: patient });
    } else {
      return res.json(response.data);
    }
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* -------------------- Start Server -------------------- */
const PORT = 5000;

Promise.all([
  new Promise((res) => patientDB.once("open", res)),
  new Promise((res) => logDB.once("open", res)),
])
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DBs:", err);
    process.exit(1);
  });
