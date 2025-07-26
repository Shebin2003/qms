import React, { useState } from 'react';
import './Step1_CommonInfo.css';

const Step2_CapaInfo = ({ onBack, onSubmit }) => {
    const [formData, setFormData] = useState({
        root_cause: '',
        corrective_action: '',
        preventive_action: '',
        effectiveness_check: '',
        closure_justification: '',
        verification_plan: '',
        verification_summary: '',
        quality_approver: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitClick = () => {
        if (!formData.root_cause || !formData.corrective_action || !formData.preventive_action || !formData.effectiveness_check) {
            alert('Please fill out all required fields marked with *');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="wizard-step-container">
            <div className="form-card">
                <h2>Step 3: CAPA Details</h2>
                
                <label>Root Cause Analysis *
                    <textarea name="root_cause" value={formData.root_cause} onChange={handleInputChange} placeholder="Detailed root cause of the issue..." />
                </label>

                <label>Corrective Action Plan *
                    <textarea name="corrective_action" value={formData.corrective_action} onChange={handleInputChange} placeholder="Actions to fix the immediate problem..." />
                </label>

                <label>Preventive Action Plan *
                    <textarea name="preventive_action" value={formData.preventive_action} onChange={handleInputChange} placeholder="Actions to prevent recurrence..." />
                </label>

                <label>Effectiveness Check Plan *
                    <textarea name="effectiveness_check" value={formData.effectiveness_check} onChange={handleInputChange} placeholder="How will you verify the fix was effective?" />
                </label>
                
                <label>Verification Plan
                    <textarea name="verification_plan" value={formData.verification_plan} onChange={handleInputChange} placeholder="Optional: Details of verification..." />
                </label>

                <label>Verification Summary
                    <textarea name="verification_summary" value={formData.verification_summary} onChange={handleInputChange} placeholder="Optional: Summary of verification results..." />
                </label>

                <label>Quality Approver
                    <input type="text" name="quality_approver" value={formData.quality_approver} onChange={handleInputChange} placeholder="Optional: Name of QA approver" />
                </label>
                
                <label>Closure Justification
                    <textarea name="closure_justification" value={formData.closure_justification} onChange={handleInputChange} placeholder="Optional: Justification for closing the CAPA..." />
                </label>

                <div className="button-group">
                    <button type="button" className="secondary-button" onClick={onBack}>Back</button>
                    <button type="button" className="primary-button" onClick={handleSubmitClick}>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default Step2_CapaInfo;