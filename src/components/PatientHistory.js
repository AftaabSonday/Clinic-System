import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PatientHistory.css';

const PatientHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patient } = location.state;

  // Calculate the total amount
  const totalAmount = patient.history.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="container">
      <h1>Patient History for {patient.name}</h1>
      <div className="total-amount">
        <h2>Total Amount: {totalAmount.toFixed(2)}</h2>
      </div>
      <button onClick={handleBackClick} className="btn btn-back">Back to Main Page</button>
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {patient.history.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.age}</td>
                <td>{entry.gender}</td>
                <td>{entry.description}</td>
                <td>{entry.amount}</td>
                <td>{entry.photo ? <img src={entry.photo} alt="patient" width="50" /> : 'No Photo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientHistory;
