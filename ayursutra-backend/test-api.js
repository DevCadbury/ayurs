#!/usr/bin/env node

// Simple test script to verify the backend API is working
const http = require("http");

const testEndpoints = [
  {
    name: "Health Check",
    path: "/health",
    method: "GET",
  },
  {
    name: "Auth Exchange (Demo)",
    path: "/api/auth/exchange",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer demo-token",
    },
    body: JSON.stringify({
      uid: "test-user-123",
      email: "test@example.com",
      name: "Test User",
    }),
  },
];

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testBackend() {
  console.log("🧪 Testing AyurSutra Backend API...\n");

  for (const test of testEndpoints) {
    try {
      console.log(`Testing: ${test.name}`);

      const options = {
        hostname: "localhost",
        port: 4000,
        path: test.path,
        method: test.method,
        headers: test.headers || {},
      };

      const response = await makeRequest(options);

      if (response.statusCode === 200) {
        console.log(`✅ ${test.name}: SUCCESS (${response.statusCode})`);
        try {
          const jsonData = JSON.parse(response.body);
          console.log(`   Response:`, JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(`   Response: ${response.body}`);
        }
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.statusCode})`);
        console.log(`   Response: ${response.body}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }

    console.log("");
  }

  console.log("🏁 Backend API testing complete!");
}

// Run the tests
testBackend().catch(console.error);
