import React, { useState } from 'react';
import './Step1_CommonInfo.css'; 

const Step2_DeviationInfo = ({ onBack, onSubmit }) => {
    const [formData, setFormData] = useState({
        root_cause: '',
        deviation_category: '',
        immediate_action: '',
        batch_Number: '',
        product_impact_assessment: '',
        regulatory_impact_assessment: '',
        linked_capa_id: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitClick = () => {
        if (!formData.root_cause || !formData.deviation_category || !formData.immediate_action || !formData.batch_Number) {
            alert('Please fill out all required fields marked with *');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="wizard-step-container">
            <div className="form-card">
                <h2>Step 3: Deviation Details</h2>
                
                <label>Deviation Category *
                    <input type="text" name="deviation_category" value={formData.deviation_category} onChange={handleInputChange} placeholder="e.g., Equipment Malfunction" />
                </label>

                <label>Batch / Lot Number *
                    <input type="text" name="batch_Number" value={formData.batch_Number} onChange={handleInputChange} placeholder="e.g., BN-2025-001" />
                </label>

                <label>Immediate Actions Taken *
                    <textarea name="immediate_action" value={formData.immediate_action} onChange={handleInputChange} placeholder="Describe the immediate containment actions taken..." />
                </label>

                <label>Preliminary Root Cause *
                    <textarea name="root_cause" value={formData.root_cause} onChange={handleInputChange} placeholder="Initial analysis of the root cause..." />
                </label>
                
                <label>Product Impact Assessment
                    <textarea name="product_impact_assessment" value={formData.product_impact_assessment} onChange={handleInputChange} placeholder="Optional: Describe the impact on product quality..." />
                </label>

                <label>Regulatory Impact Assessment
                    <textarea name="regulatory_impact_assessment" value={formData.regulatory_impact_assessment} onChange={handleInputChange} placeholder="Optional: Assess any regulatory impact..." />
                </label>

                <label>Linked CAPA ID<br/>
                    <input type="number" name="linked_capa_id" value={formData.linked_capa_id} onChange={handleInputChange} placeholder="Optional: e.g., CAPA-001" />
                </label>

                <div className="button-group">
                    <button type="button" className="secondary-button" onClick={onBack}>Back</button>
                    <button type="button" className="primary-button" onClick={handleSubmitClick}>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default Step2_DeviationInfo;