// Quick test script to verify API endpoint
const testData = {
  targetType: "MONTHLY",
  targetPeriod: "2025-01",
  targetAmount: 5000000,
  userId: "264e1a62-c61b-4583-9baf-2c518fce0a4d",
  isActive: true,
};

fetch("http://localhost:3001/api/targets", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("API Response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
