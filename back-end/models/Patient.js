const mongoose = require("mongoose");

const vitalsHistorySchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  Systolic_BP: Number,
  Diastolic_BP: Number,
  Heart_Rate: Number,
  Sugar_Level: Number
}, { _id: false });

const medicationAdherenceSchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  Taken: { type: Number, enum: [0, 1] } // 1 = Taken, 0 = Missed
}, { _id: false });

const recentVisitsSchema = new mongoose.Schema({
  Date: { type: Date, required: true },
  DoctorID: String,
  VitalsComparison: {
    Systolic_BP: Number,
    Diastolic_BP: Number,
    Heart_Rate: Number,
    Sugar_Level: Number
  }
}, { _id: false });

const labResultsSchema = new mongoose.Schema({
  Hemoglobin: Number,
  Cholesterol: Number,
  Creatinine: Number
}, { _id: false });

const fingerprintSchema = new mongoose.Schema({
  FingerName: String,
  Vector: { type: [Number], required: true },
  RegisteredAt: { type: Date, default: Date.now }
}, { _id: false });

const patientSchema = new mongoose.Schema({
  PatientID: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Age: Number,
  Gender: { type: String, enum: ["Male", "Female", "Other"] },
  BloodGroup: String,
  Contact: String,
  Address: String,
  DoctorID: { type: String, ref: "Doctor" },
  VitalsHistory: [vitalsHistorySchema],
  MedicationAdherence: [medicationAdherenceSchema],
  LabResults: labResultsSchema,
  RecentVisits: [recentVisitsSchema],
  Fingerprints: [fingerprintSchema]
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
