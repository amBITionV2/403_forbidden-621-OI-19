const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },

    specialties: [String],
    equipment: [
      {
        name: String,
        available: { type: Boolean, default: true },
        quantity: { type: Number, default: 1 },
      },
    ],

    tags: [String],

    capacity: {
      totalBeds: { type: Number, default: 0 },
      icuBeds: { type: Number, default: 0 },
    },

    availableBeds: {
      total: { type: Number, default: 0 },
      icu: { type: Number, default: 0 },
    },

    isEmergencyReady: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hospitalSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hospital", hospitalSchema);
