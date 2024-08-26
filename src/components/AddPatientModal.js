import React, { useState, useEffect, useRef } from 'react';
import './AddPatientModal.css';

const AddPatientModal = ({ onClose, onAddPatient, patient }) => {
  const [date, setDate] = useState(patient ? patient.date : '');
  const [name, setName] = useState(patient ? patient.name : '');
  const [age, setAge] = useState(patient ? patient.age : '');
  const [gender, setGender] = useState(patient ? patient.gender : '');
  const [description, setDescription] = useState(patient ? patient.description : '');
  const [amount, setAmount] = useState(patient ? patient.amount : '');
  const [photo, setPhoto] = useState(patient ? patient.photo : '');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!date) {
      setDate(new Date().toISOString().split('T')[0]); // Set to current date if date is not provided
    }
  }, [date]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPatient = {
        date: date || null,
        name: name || null,
        age: age || null,
        gender: gender || null,
        description: description || null,
        amount: amount || null,
        photo: photo || null,
    };

    // Log the object before attempting to stringify it
    console.log("newPatient object:", newPatient);

    try {
        // Attempt to stringify the object to detect circular references
        const jsonString = safeStringify(newPatient);
        console.log("JSON string:", jsonString);

        if (jsonString) {
            onAddPatient(JSON.parse(jsonString));
        }
    } catch (error) {
        console.error("Error processing patient data:", error);
    }

    onClose();
};

  const startCamera = () => {
    setShowCamera(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
        setShowCamera(false);
      });
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setPhoto(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    videoRef.current.srcObject = null;
    setShowCamera(false);
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Patient</h2>
        <form onSubmit={handleSubmit}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <label>Patient Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label>Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <button type="button" onClick={startCamera} className="btn-camera">Capture Photo</button>
          {showCamera && (
            <div className="camera">
              <video ref={videoRef} width="320" height="240" />
              <div className="camera-buttons">
                <button type="button" onClick={capturePhoto} className="btn-capture">Click</button>
                <button type="button" onClick={stopCamera} className="btn-cancel">Cancel</button>
              </div>
              <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />
            </div>
          )}
          {photo && (
            <div className="photo-preview">
              <img src={photo} alt="Patient" />
            </div>
          )}
          <button type="submit" className="btn-submit">Save</button>
          <button type="button" className="btn-close" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

// Utility function to safely stringify objects and avoid circular references
function safeStringify(obj) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
              // Circular reference found, discard key
              return;
          }
          // Store value in cache
          cache.add(value);
      }
      return value;
  });
}

export default AddPatientModal;
