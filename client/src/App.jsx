// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [ledState, setLedState] = useState("OFF");

  const apiEndpoint = "http://localhost:5000/api/led"; // Replace with your server's IP and port

  // Fetch the initial LED state from the server
  useEffect(() => {
    const fetchLedState = async () => {
      try {
        const response = await axios.get(apiEndpoint);
        setLedState(response.data.state); // Assumes API response has a "state" field
      } catch (error) {
        console.error("Error fetching LED state:", error);
      }
    };

    fetchLedState();
  }, []);

  // Toggle LED state and update the server
  const toggleLed = async () => {
    const newState = ledState === "ON" ? "OFF" : "ON";
    try {
      await axios.post(apiEndpoint, { state: newState }); // Sends { state: "ON" } or { state: "OFF" }
      setLedState(newState);
    } catch (error) {
      console.error("Error toggling LED state:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center shadow-lg p-8 bg-white rounded-lg">
        <h1 className="text-3xl font-bold mb-4">ESP8266 LED Control</h1>
        <p className="text-xl mb-6">
          LED is currently <strong>{ledState}</strong>
        </p>
        <button
          onClick={toggleLed}
          className={`px-6 py-3 rounded text-white font-bold ${
            ledState === "ON"
              ? "bg-red-500 hover:bg-red-700"
              : "bg-green-500 hover:bg-green-700"
          }`}
        >
          Turn {ledState === "ON" ? "OFF" : "ON"}
        </button>
      </div>
    </div>
  );
}

export default App;
