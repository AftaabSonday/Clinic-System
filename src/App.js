import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Patients from './components/Patients';
import PatientHistory from './components/PatientHistory';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Patients />} />
        <Route path="/history" element={<PatientHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
