const axios = require("axios");

const API_BASE = "http://localhost:4000";

// Test data
const testAppointment = {
  patient: "patient1",
  doctor: "doctor1",
  therapy: "therapy1",
  startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  endTime: new Date(
    Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000
  ).toISOString(),
  notes: "Test appointment",
};

async function testScheduleAPI() {
  console.log("🧪 Testing Schedule API endpoints...\n");

  try {
    // Test 1: Get patient appointments
    console.log("1️⃣ Testing GET /api/schedule/patient/patient1");
    try {
      const response = await axios.get(
        `${API_BASE}/api/schedule/patient/patient1`,
        {
          headers: { Authorization: "Bearer test-token" },
        }
      );
      console.log("✅ Success:", response.data.length, "appointments found");
    } catch (error) {
      console.log("❌ Error:", error.response?.data?.error || error.message);
    }

    // Test 2: Get all therapies
    console.log("\n2️⃣ Testing GET /api/therapies");
    try {
      const response = await axios.get(`${API_BASE}/api/therapies`, {
        headers: { Authorization: "Bearer test-token" },
      });
      console.log("✅ Success:", response.data.length, "therapies found");
    } catch (error) {
      console.log("❌ Error:", error.response?.data?.error || error.message);
    }

    // Test 3: Get doctors
    console.log("\n3️⃣ Testing GET /api/users?role=doctor");
    try {
      const response = await axios.get(`${API_BASE}/api/users?role=doctor`, {
        headers: { Authorization: "Bearer test-token" },
      });
      console.log("✅ Success:", response.data.length, "doctors found");
    } catch (error) {
      console.log("❌ Error:", error.response?.data?.error || error.message);
    }

    // Test 4: Create appointment
    console.log("\n4️⃣ Testing POST /api/schedule");
    try {
      const response = await axios.post(
        `${API_BASE}/api/schedule`,
        testAppointment,
        {
          headers: { Authorization: "Bearer test-token" },
        }
      );
      console.log(
        "✅ Success: Appointment created with ID:",
        response.data._id
      );
    } catch (error) {
      console.log("❌ Error:", error.response?.data?.error || error.message);
    }

    // Test 5: Get available time slots
    console.log(
      "\n5️⃣ Testing GET /api/schedule/availability/doctor1/2024-01-20"
    );
    try {
      const response = await axios.get(
        `${API_BASE}/api/schedule/availability/doctor1/2024-01-20`,
        {
          headers: { Authorization: "Bearer test-token" },
        }
      );
      console.log("✅ Success:", response.data.length, "available slots found");
    } catch (error) {
      console.log("❌ Error:", error.response?.data?.error || error.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  console.log("\n🏁 API testing completed!");
}

// Run tests
testScheduleAPI();

