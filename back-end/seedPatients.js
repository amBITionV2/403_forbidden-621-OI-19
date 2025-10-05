const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");

mongoose.connect("mongodb://localhost:27017/patientDashboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log(err));

const genders = ["Male", "Female", "Other"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const fingerNames = ["Right Thumb", "Left Thumb", "Right Index", "Left Index"];
const hospitals = ["City Hospital", "Sunrise Clinic", "Green Valley Hospital", "Metro Health"];

// ------------------
// Helper Generators
// ------------------
const generateVector = (length = 128) => Array.from({ length }, () => Math.random());

const generateVitalsHistory = (days = 10) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return {
      Date: date,
      Systolic_BP: 100 + Math.floor(Math.random() * 40),
      Diastolic_BP: 60 + Math.floor(Math.random() * 20),
      Heart_Rate: 60 + Math.floor(Math.random() * 40),
      Sugar_Level: 80 + Math.floor(Math.random() * 60)
    };
  });
};

const generateMedicationAdherence = (days = 10) => {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return {
      Date: date,
      Taken: Math.random() > 0.2 ? 1 : 0
    };
  });
};

const generateRecentVisits = (doctors, vitalsHistory) => {
  const visits = [];
  for (let i = 0; i < 5; i++) {
    const vitals = vitalsHistory[Math.floor(Math.random() * vitalsHistory.length)];
    visits.push({
      Date: vitals.Date,
      DoctorID: doctors[Math.floor(Math.random() * doctors.length)].DoctorID,
      VitalsComparison: {
        Systolic_BP: vitals.Systolic_BP + Math.floor(Math.random() * 5),
        Diastolic_BP: vitals.Diastolic_BP + Math.floor(Math.random() * 5),
        Heart_Rate: vitals.Heart_Rate + Math.floor(Math.random() * 3),
        Sugar_Level: vitals.Sugar_Level + Math.floor(Math.random() * 10)
      }
    });
  }
  return visits;
};

// ------------------
// Seed Patients
// ------------------
async function seed() {
  try {
    // 1. Insert doctors first
    const doctors = Array.from({ length: 20 }, (_, i) => ({
      DoctorID: `D${i+1}`,
      Name: `Doctor ${i+1}`,
      Hospital: hospitals[Math.floor(Math.random() * hospitals.length)]
    }));
    await Doctor.deleteMany({});
    await Doctor.insertMany(doctors);
    console.log("✅ Dummy doctors inserted");

    // 2. Load patient IDs from Excel
    const workbook = XLSX.readFile("./cleaned_ids.xlsx");
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`📊 Loaded ${sheetData.length} patient IDs from Excel`);

    if (sheetData.length !== 55271) {
      console.warn("⚠️ Excel does not have exactly 55,271 rows!");
    }

    // 3. Generate patients
    const patients = sheetData.map((row, i) => {
      const vitals = generateVitalsHistory();
      return {
        PatientID: row.id, // exact mapping from Excel
        Name: `Patient ${i+1}`,
        Age: Math.floor(Math.random() * 60) + 10,
        Gender: genders[Math.floor(Math.random() * genders.length)],
        BloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        Contact: `98765432${Math.floor(100 + Math.random() * 900)}`,
        Address: `Address ${i+1}`,
        DoctorID: doctors[Math.floor(Math.random() * doctors.length)].DoctorID,
        VitalsHistory: vitals,
        MedicationAdherence: generateMedicationAdherence(),
        RecentVisits: generateRecentVisits(doctors, vitals),
        LabResults: {
          Hemoglobin: 12 + Math.floor(Math.random() * 4),
          Cholesterol: 150 + Math.floor(Math.random() * 50),
          Creatinine: 0.8 + Math.random() * 0.5
        },
        Fingerprints: [{
          FingerName: fingerNames[Math.floor(Math.random() * fingerNames.length)],
          Vector: generateVector()
        }]
      };
    });

    // 4. Insert in batches (to avoid overload)
    await Patient.deleteMany({});
    const batchSize = 1000;
    for (let i = 0; i < patients.length; i += batchSize) {
      const batch = patients.slice(i, i + batchSize);
      await Patient.insertMany(batch);
      console.log(`✅ Inserted patients ${i + 1} to ${i + batch.length}`);
    }

    console.log("🎉 All patients inserted successfully");
    mongoose.disconnect();

  } catch (err) {
    console.error("❌ Error seeding patients:", err);
    mongoose.disconnect();
  }
}

seed();
