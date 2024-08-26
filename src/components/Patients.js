import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPatientModal from './AddPatientModal';
import './Patients.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [doctorName, setDoctorName] = useState("Your name");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Retrieve data from localStorage when the component mounts
  useEffect(() => {
    const storedPatients = localStorage.getItem('patients');
    const storedDoctorName = localStorage.getItem('doctorName');

    if (storedPatients) {
      console.log("Loading patients from localStorage:", JSON.parse(storedPatients));
      setPatients(JSON.parse(storedPatients));
    }

    if (storedDoctorName) {
      console.log("Loading doctor name from localStorage:", storedDoctorName);
      setDoctorName(storedDoctorName);
    }
  }, []);

  // Store patients data in localStorage whenever the patients state changes
  useEffect(() => {
    if (patients.length > 0) { // Only store if there are patients
      console.log("Storing patients in localStorage:", patients);
      localStorage.setItem('patients', JSON.stringify(patients));
    }
  }, [patients]);

  // Store doctor name in localStorage whenever the doctorName state changes
  const handleChangeName = (newName) => {
    setDoctorName(newName);
    localStorage.setItem('doctorName', newName);
    setShowNameModal(false);
  };

  const handleAddPatient = (newPatient) => {
    const updatedPatients = [...patients];
    
    if (currentPatient && currentPatient.isEdit) {
        // Editing an existing patient
        updatedPatients[currentPatient.index] = { ...newPatient, history: [...patients[currentPatient.index].history] };
    } else {
        // Adding a new row for the existing patient
        const existingPatientIndex = patients.findIndex(p => p.name === newPatient.name);
        if (existingPatientIndex !== -1) {
            // If the patient exists, create a new row for the patient with the new data
            updatedPatients.push({ ...newPatient, history: patients[existingPatientIndex].history.concat({ ...newPatient }) });
        } else {
            // If the patient doesn't exist, create a new entry
            newPatient.history = [{ ...newPatient }];
            updatedPatients.push(newPatient);
        }
    }

    console.log("Updated Patients:", updatedPatients); // Log the updated patients array
    setPatients(updatedPatients);
    setCurrentPatient(null);
    setShowModal(false); // Close the modal after saving
  };

  const handleDeletePatient = (index) => {
    const updatedPatients = [...patients];
    updatedPatients.splice(index, 1);
    setPatients(updatedPatients);
  };

  const handleEditPatient = (index, e) => {
    e.stopPropagation(); // Prevent row click event
    setCurrentPatient({ ...patients[index], index, isEdit: true });
    setShowModal(true);
  };

  const handleAddExistingPatient = (index, e) => {
    e.stopPropagation(); // Prevent row click event
    // Prepare the patient data for editing
    const patient = { 
        ...patients[index], 
        date: '', 
        description: '', 
        amount: '', 
        photo: '' 
    };

    // Set this as the current patient and open the modal, but don't add to the list yet
    setCurrentPatient({ ...patient, isEdit: false });
    setShowModal(true);
  };

  const handleViewPhoto = (photo, e) => {
    e.stopPropagation(); // Prevent row click event
    setSelectedImage(photo);
    setShowImageModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewHistory = (patient) => {
    navigate('/history', { state: { patient } });
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('en-US', options);
  };

  const filteredPatients = patients.filter((patient) => {
    const patientDate = new Date(patient.date);
    const matchesSearchQuery = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (startDate && endDate) {
      return patientDate >= startDate && patientDate <= endDate && matchesSearchQuery;
    }
    return matchesSearchQuery;
  });

  // Calculate the number of unique patients
  const uniquePatientNames = new Set(filteredPatients.map(patient => patient.name));
  const totalPatients = uniquePatientNames.size;
  const totalEarnings = filteredPatients.reduce((sum, patient) => sum + (parseFloat(patient.amount) || 0), 0);

  return (
    <div className="container">
      <div className="patients">
        <div className="header">
          <div className="doctor-info">
            <h1>{doctorName}</h1>
            <button onClick={() => setShowNameModal(true)} className="btn btn-change-name">Change Name</button>
          </div>
          <div className="date-info">
            <p>{getCurrentDate()}</p>
          </div>
        </div>
        <h2>Patients</h2>
        <div className="summary">
          <div className="summary-left">
            <p>Total Unique Patients: {totalPatients}</p>
            <p>Total Earnings: {totalEarnings.toFixed(2)}</p>
          </div>
          <div className="summary-right">
            <div className="date-range">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
              />
            </div>
            <input
              type="text"
              placeholder="Search Patients"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-bar"
            />
          </div>
        </div>
        <button onClick={() => { setShowModal(true); setCurrentPatient(null); }} className="btn btn-add">Add New Patient</button>
        <div className="table-container">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Serial No</th>
                  <th>Date</th>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={index} onClick={() => handleViewHistory(patient)}>
                    <td>{index + 1}</td>
                    <td>{patient.date}</td>
                    <td>
                      <span className="patient-name-link">
                        {patient.name}
                      </span>
                    </td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.description}</td>
                    <td>{patient.amount}</td>
                    <td>{patient.photo ? <img src={patient.photo} alt="patient" width="50" /> : 'No Photo'}</td>
                    <td>
                      <button onClick={(e) => handleEditPatient(index, e)} className="btn btn-edit">Edit</button>
                      <button onClick={(e) => handleDeletePatient(index, e)} className="btn btn-delete">Delete</button>
                      <button onClick={(e) => handleViewPhoto(patient.photo, e)} className="btn btn-view">View</button>
                      <button onClick={(e) => handleAddExistingPatient(index, e)} className="btn btn-add-patient">Add</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showModal && <AddPatientModal onClose={() => setShowModal(false)} onAddPatient={handleAddPatient} patient={currentPatient} />}
        {showNameModal && <ChangeNameModal onClose={() => setShowNameModal(false)} onChangeName={handleChangeName} />}
        {showImageModal && (
          <div className="modal" onClick={() => setShowImageModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} alt="patient" style={{ width: '100%' }} />
              <a href={selectedImage} download className="btn btn-download">Download</a>
              <button onClick={() => setShowImageModal(false)} className="btn btn-close">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChangeNameModal = ({ onClose, onChangeName }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeName(name);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Change Doctor's Name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter new name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit">Change Name</button>
        </form>
        <button onClick={onClose} className="btn-close">Close</button>
      </div>
    </div>
  );
};

export default Patients;
