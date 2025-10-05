const mongoose = require("mongoose");
const XLSX = require("xlsx");
const Patient = require("./models/Patient"); // path to your Patient schema file

// 1. Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/patientDashboard", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

// 2. Load Excel file
const workbook = XLSX.readFile("./cleaned_ids.xlsx");  // path to excel
const sheetName = workbook.SheetNames[0];
const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// sheetData looks like: [{id: "259__M_Left_little_finger.BMP"}, {id: "463__F_Right_thumb.BMP"}, ...]

async function updatePatientIDs() {
  try {
    for (let row of sheetData) {
      const patientId = row.id;

      // Update if patient already exists OR insert if new
      await Patient.findOneAndUpdate(
        { PatientID: patientId },
        { $set: { PatientID: patientId } },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Patient IDs updated successfully.");
  } catch (err) {
    console.error("❌ Error updating patients:", err);
  } finally {
    mongoose.connection.close();
  }
}

updatePatientIDs();
