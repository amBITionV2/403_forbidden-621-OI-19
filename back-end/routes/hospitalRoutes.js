const express = require("express");
const conditionMapping = require("../config/conditionMapping");
const router = express.Router();

router.post("/find-hospital", async (req, res) => {
  try {
    const { description, patientLocation } = req.body;
    const Hospital = req.HospitalModel; // ✅ get the injected model

    if (!Hospital) {
      return res.status(500).json({ message: "Hospital model not found in request" });
    }

    if (!description || !patientLocation || patientLocation.length !== 2) {
      return res
        .status(400)
        .json({ message: "Description and patient location [lng, lat] are required." });
    }

    // Step 1: Map patient condition
    let matched = null;
    for (let condition in conditionMapping) {
      if (description.toLowerCase().includes(condition)) {
        matched = conditionMapping[condition];
        break;
      }
    }

    if (!matched) {
      return res.status(404).json({ message: "No matching condition found in mapping." });
    }

    const { specialties, equipment } = matched;

    // Step 2: Query hospitals from the connected DB
    const hospitals = await Hospital.find({
      specialties: { $in: specialties },
      "availableBeds.total": { $gt: 0 },
      isEmergencyReady: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: patientLocation },
          $maxDistance: 10000,
        },
      },
    });

    // Step 3: Filter by equipment match
    const filteredHospitals = hospitals.filter((hosp) => {
      const hospitalEquipNames = hosp.equipment.map((e) => e.name.toLowerCase());
      return equipment.some((eq) => hospitalEquipNames.includes(eq.toLowerCase()));
    });

    if (filteredHospitals.length === 0) {
      return res.status(404).json({ message: "No suitable hospitals found nearby." });
    }

    res.json({
      nearestHospital: filteredHospitals[0],
      allHospitals: filteredHospitals,
      count: filteredHospitals.length,
    });
  } catch (err) {
    console.error("Error in find-hospital:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
