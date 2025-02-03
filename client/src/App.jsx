// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Generator from "./components/Generator";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Generator />} />
      </Routes>
    </>
  );
}

export default App;
