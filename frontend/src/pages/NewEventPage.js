import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/qmsApi';
import Step1_CommonInfo from '../components/wizard/Step1_CommonInfo';
import Step2_CommonDetails from '../components/wizard/Step2_CommonDetails';
import Step2_DeviationInfo from '../components/wizard/Step2_DeviationInfo';
import Step2_CapaInfo from '../components/wizard/Step2_CapaInfo';

const NewEventPage = () => {
    const [step, setStep] = useState(1);
    const [eventData, setEventData] = useState({
        event: {},
        deviation: null,
        capa: null,
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (step === 3) {
            console.log("Entering Stage 3, adding automatic data...");
            const currentDateTime = new Date().toISOString();
            
            setEventData(prev => ({
                ...prev,
                event: {
                    ...prev.event,
                    created_at: currentDateTime,
                    lastModified_at: currentDateTime,
                    lastModified_by: prev.event.created_by 
                }
            }));
        }
    }, [step]); 

    const handleNext = (data) => {
        setEventData(prev => ({
            ...prev,
            event: { ...prev.event, ...data }
        }));
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (finalData) => {
        const completeEventData = {
            ...eventData,
            [eventData.event.event_type.toLowerCase()]: finalData
        };
        
        try {
            if (completeEventData.event.event_type === 'DEVIATION') {
                delete completeEventData.capa;
            }
            else if(completeEventData.event.event_type === "CAPA"){
                delete completeEventData.deviation;
            }
            console.log("Final payload to be sent:", completeEventData);
            const response = await createEvent(completeEventData); 
            alert("Event created successfully!");
            navigate('/');

        } catch (error) {
            console.error("Failed to create event:", error);
            alert("There was an error creating the event. Please try again.");
            }
        };

    console.log(`-- STAGE ${step} -- Current eventData State:`, eventData);

    return (
        <div>
            {step === 1 && 
                <Step1_CommonInfo onNext={handleNext} initialData={eventData.event} />}
            
            {step === 2 && 
                <Step2_CommonDetails onNext={handleNext} onBack={handleBack} initialData={eventData.event} />}
            
            {step === 3 && eventData.event.event_type === 'DEVIATION' && 
                <Step2_DeviationInfo onBack={handleBack} onSubmit={handleSubmit} />}
            
            {step === 3 && eventData.event.event_type === 'CAPA' && 
                <Step2_CapaInfo onBack={handleBack} onSubmit={handleSubmit} />}
        </div>
    );
};

export default NewEventPage;