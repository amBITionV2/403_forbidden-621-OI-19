const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  DoctorID: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Hospital: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);
