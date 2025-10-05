// config/conditionMapping.js
module.exports = {
  "cardiac arrest": { specialties: ["cardiology"], equipment: ["defibrillator", "icu"] },
  "stroke": { specialties: ["neurology"], equipment: ["ct_scan", "icu"] },
  "fracture": { specialties: ["orthopedic"], equipment: ["xray"] },
  "burns": { specialties: ["plastic surgery"], equipment: ["icu", "burn unit"] },
};
