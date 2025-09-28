# Browser Console Commands for Testing

## Quick Setup (Copy & Paste into Browser Console)

```javascript
// Set up demo auth store
const testUID = "3oOF4bGdZLcUN7UuwBogMLNYTLm2";
const authData = {
  uid: testUID,
  role: "patient",
  displayName: "Test Patient",
  email: "test@example.com",
  token: "demo-token",
};

localStorage.setItem(
  "auth-storage",
  JSON.stringify({
    state: authData,
    version: 0,
  })
);

console.log("✅ Auth store set with test data:", authData);
```

## Test API Call

```javascript
// Test the backend API directly
const testUID = "3oOF4bGdZLcUN7UuwBogMLNYTLm2";
const apiBase = "https://ayur-api.vercel.app";

fetch(`${apiBase}/api/schedule/patient/${testUID}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${testUID}`,
  },
})
  .then((response) => response.json())
  .then((data) => console.log("✅ API Response:", data))
  .catch((error) => console.error("❌ API Error:", error));
```

## Check Current Auth Store

```javascript
// Check what's currently in the auth store
const stored = localStorage.getItem("auth-storage");
if (stored) {
  console.log("Current auth store:", JSON.parse(stored));
} else {
  console.log("No auth store found");
}
```

## Clear Auth Store

```javascript
// Clear the auth store
localStorage.removeItem("auth-storage");
console.log("✅ Auth store cleared");
```
