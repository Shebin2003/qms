import React, { useState } from 'react';
import './Step1_CommonInfo.css'; 

const Step2_CommonDetails = ({ onNext, onBack, initialData }) => {
    const [formData, setFormData] = useState({
        description: initialData.description || '',
        severity: initialData.severity || 'MINOR',
        department: initialData.department || '',
        site: initialData.site || '',
        created_by: initialData.created_by || '', 
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNextClick = () => {
        if (!formData.severity || !formData.department || !formData.created_by) {
            alert('Please fill out all required fields: Severity, Department, and Created By.');
            return;
        }
        onNext(formData);
    };

    return (
        <div className="wizard-step-container">
            <div className="form-card">
                <h2>Step 2: Common Details</h2>
                
                <label>Description
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        placeholder="Optional: Describe the event..."
                    />
                </label>
                
                <label>Severity *
                    <select name="severity" value={formData.severity} onChange={handleInputChange}>
                        <option value="MINOR">Minor</option>
                        <option value="MAJOR">Major</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </label>

                <label>Department *
                    <input 
                        type="text" 
                        name="department" 
                        value={formData.department} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Packaging"
                    />
                </label>

                <label>Site
                    <input 
                        type="text" 
                        name="site" 
                        value={formData.site} 
                        onChange={handleInputChange} 
                        placeholder="Optional: e.g., New Jersey Facility"
                    />
                </label>
                <label>Created By *
                    <input 
                        type="text" 
                        name="created_by" 
                        value={formData.created_by} 
                        onChange={handleInputChange} 
                        placeholder="Enter your name or ID"
                    />
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="secondary-button2" onClick={onBack}>Back</button>
                    <button type="button" className="primary-button2" onClick={handleNextClick}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default Step2_CommonDetails;