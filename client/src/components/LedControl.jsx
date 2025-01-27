// // eslint-disable-next-line no-unused-vars
// import React, { useState, useEffect } from "react";

// const LedControl = () => {
//   const [ledState, setLedState] = useState("OFF");

//   // Fetch current LED state
//   useEffect(() => {
//     fetch("http://localhost:5000/api/led")
//       .then((response) => response.json())
//       .then((data) => setLedState(data.state));
//   }, []);

//   // Update LED state
//   const updateLedState = (state) => {
//     fetch("http://localhost:5000/api/led", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ state }),
//     })
//       .then((response) => response.json())
//       .then((data) => setLedState(data.state))
//       .catch((error) => console.error(error));
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h1>ESP8266 LED Control</h1>
//       <p>Current LED State: {ledState}</p>
//       <button
//         style={{ margin: "10px", padding: "10px 20px" }}
//         onClick={() => updateLedState("ON")}
//       >
//         Turn ON
//       </button>
//       <button
//         style={{ margin: "10px", padding: "10px 20px" }}
//         onClick={() => updateLedState("OFF")}
//       >
//         Turn OFF
//       </button>
//     </div>
//   );
// };

// export default LedControl;
