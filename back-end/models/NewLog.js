const mongoose = require("mongoose");

const newLogSchema = new mongoose.Schema({
  patientName: { type: String, trim: true },
  patientAge: { type: Number },
  patientGender: { type: String, enum: ["Male", "Female", "Other"], trim: true },
  patientCondition: { type: String, default: "Stable" },

  fromAddress: { type: String, default: "" },
  toAddress: { type: String, default: "" },

  estimatedArrival: { type: Date },

  currentStatus: { 
    type: String, 
    enum: ["Pending", "On the way", "Reached", "Completed"], 
    default: "Pending" 
  },

  trackingId: { type: String, unique: true, required: true },
}, { timestamps: true });

module.exports = mongoose.model("NewLog", newLogSchema);
