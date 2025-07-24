// src/components/wizard/Step1_CommonInfo.jsx
import React, { useState } from 'react';
import './Step1_CommonInfo.css'; // Import the new stylesheet

const Step1_CommonInfo = ({ onNext, initialData }) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [event_type, setEvent_type] = useState(initialData.event_type || '');

    const handleNextClick = () => {
        if (!title || !event_type) {
            alert('Please fill out all fields.');
            return;
        }
        onNext({ title, event_type });
    };

    return (
        <div className="wizard-step-container">
            <div className="form-card">
                <h2>Event Definition</h2>
                
                <label>
                    Event Title
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Temperature out of range in Reactor R-101"
                    />
                </label>
                
                <label>
                    Event Type *
                    <select value={event_type} onChange={(e) => setEvent_type(e.target.value)}>
                        <option value="">Select Type...</option>
                        <option value="DEVIATION">Deviation</option>
                        <option value="CAPA">CAPA</option>
                    </select>
                </label>
                
                <button className="primary-button2" onClick={handleNextClick}>Next</button>
            </div>
        </div>
    );
};

export default Step1_CommonInfo;