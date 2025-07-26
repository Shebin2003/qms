import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { fetchEventById, updateEventByAI, updateDeviation } from '../api/qmsApi';
import { FilePenLine, Zap, ShieldAlert, Package, BrainCircuit, Send, Save, Target, History, Info } from 'lucide-react';
import './DeviationDetailsPage.css'; 

const statusOptions = ["REQUESTED", "UNDER_INVESTIGATION", "PENDING_APPROVAL", "CLOSED"];
const severityOptions = ["CRITICAL", "MAJOR", "MINOR"];

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const displayFormat = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const inputFormat = date.toISOString().split('T')[0];
    return { displayFormat, inputFormat };
};

const InfoPill = ({ label, value, type = 'default' }) => (
    <div className="info-pill">
        <span className="pill-label">{label}</span>
        <span className={`pill-value status-${type?.toLowerCase()}`}>{value}</span>
    </div>
);

const Card = ({ title, icon, cardData, onSave, children }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(cardData);

    useEffect(() => { setEditedData(cardData); }, [cardData]);

    const handleEditClick = () => setIsEditing(true);
    const handleCancelClick = () => {
        setEditedData(cardData);
        setIsEditing(false);
    };
    const handleSaveClick = () => {
        onSave(editedData);
        setIsEditing(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prevData => ({ ...prevData, [name]: value }));
    };

    return (
        <div className={`detail-card ${isEditing ? 'editing' : ''}`}>
            <div className="card-header">
                <div className="card-title">{icon}<h3>{title}</h3></div>
                <div className="card-actions">
                    {isEditing ? (
                        <>
                            <button onClick={handleCancelClick} className="edit-button">Cancel</button>
                            <button onClick={handleSaveClick} className="save-button"><Save size={14} /> Save</button>
                        </>
                    ) : (
                        <button onClick={handleEditClick} className="edit-button">Edit</button>
                    )}
                </div>
            </div>
            <div className="card-content">
                {children(isEditing, editedData, handleInputChange)}
            </div>
        </div>
    );
};

const EditableField = ({ name, value, isEditing, onChange, as = 'input', type = 'text', placeholder = '', options = [] }) => {
    if (isEditing) {
        if (as === 'select') {
            return (
                <select name={name} value={value || ''} onChange={onChange} className="editable-input">
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            );
        }
        if (as === 'textarea') {
            return <textarea name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="editable-input" />;
        }
        return <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="editable-input" />;
    }
    
    if (type === 'date') {
        return <p className="display-text">{value ? formatDate(value).displayFormat : <span className="text-placeholder">{placeholder}</span>}</p>;
    }
    return <p className="display-text">{value || <span className="text-placeholder">{placeholder}</span>}</p>;
};


const DeviationDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { event_id, event_type } = location.state || {};
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [threadId, setThreadId] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        const loadEvent = async () => {
          setThreadId(`thread_${Date.now()}`);
            if (!event_id || !event_type) { setLoading(false); return; }
            try {
                const data = await fetchEventById({ event_id, event_type });
                const combinedData = { ...data.event, ...data.deviation };
                setEventData(combinedData);
            } catch (error) { console.error("Failed to fetch event:", error); }
            finally { setLoading(false); }
        };
        loadEvent();
        
    }, [event_id, event_type]);

    const handleSave = async (updatedCardData) => {
        const updatedEventData = { ...eventData, ...updatedCardData };
        setEventData(updatedEventData);
        
        console.log("Saving data:", updatedCardData);
    };

    const handleSaveChanges = () => {
        console.log("Saving all changes:", eventData);
        const eventKeys = [
        'event_id', 'event_type', 'title', 'description', 'status', 
        'severity', 'created_at', 'created_by', 'lastModified_at', 
        'lastModified_by', 'department', 'site'
        ];
        
        const deviationKeys = [
            'deviation_id', 'root_cause', 'deviation_category', 'immediate_action',
            'batch_Number', 'product_impact_assessment', 'regulatory_impact_assessment',
            'linked_capa_id'
        ];

        const groupedData = {
            event: {},
            deviation: {}
        };
        for (const key in eventData) {
            if (eventKeys.includes(key)) {
                groupedData.event[key] = eventData[key];
            } else if (deviationKeys.includes(key)) {
                groupedData.deviation[key] = eventData[key];
            }
        };
        console.log("saved data",groupedData);
        try {
          const response = updateDeviation(groupedData);
          console.log('Update successful:', response);
          alert('Deviation updated successfully!');
          returnHome()

        } catch (error) {
          console.error('Failed to update deviation:', error);
          alert('An error occurred while updating');

        } finally {
          console.log('Update attempt finished.');
        }

    };
    const returnHome = () => navigate('/');
    const handleAiSubmit = async (e) => {
        e.preventDefault();
        if (!aiPrompt.trim()) return;

        const payload = {
            message: aiPrompt,
            thread_id: threadId,
            data: eventData 
        };
        
        console.log("Sending data to AI:", payload);
        
        try {
            const temp = await updateEventByAI(payload);
            const updates = temp.payload 
            console.log("payload",payload)

            setEventData(prevData => ({ ...prevData, ...updates }));
            
            console.log("AI response processed, state updated.");

        } catch (error) {
            console.error("AI Assistant failed:", error);
            alert("The AI assistant could not be reached.");
        }

        setAiPrompt(''); 
    };
    if (loading) return <div className="loading-container">Loading...</div>;
    if (!eventData) return <div className="loading-container">Error: Event data not found.</div>;

    return (
        <div className="detail-page-layout">
            <main className="detail-main-content">
                <header className="detail-page-header">
                    <div className="header-title-section">
                        <h1>{eventData.title}</h1>
                        <div className="info-pill-strip">
                            <InfoPill label="Type" value={eventData.event_type} />
                            <InfoPill label="Created" value={formatDate(eventData.created_at).displayFormat} />
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="button-secondary" onClick={handleSaveChanges}>Save Changes</button>
                        <button className="button-primary" onClick={returnHome}>Close Event</button>
                    </div>
                </header>

                <div className="details-grid">
                    <div className="grid-main-column">
                        <Card title="Event Description" icon={<FilePenLine size={16} />} cardData={{ description: eventData.description }} onSave={handleSave}>
                            {(isEditing, data, onChange) => (
                                <EditableField name="description" value={data.description} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Detailed description of the deviation..." />
                            )}
                        </Card>
                        <Card title="Initial Assessment" icon={<Zap size={16} />} cardData={{ root_cause: eventData.root_cause, immediate_action: eventData.immediate_action }} onSave={handleSave}>
                            {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Preliminary Root Cause</label>
                                        <EditableField name="root_cause" value={data.root_cause} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Initial thoughts on the root cause..." />
                                    </div>
                                    <div>
                                        <label>Immediate Actions Taken</label>
                                        <EditableField name="immediate_action" value={data.immediate_action} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Actions taken to contain the issue..." />
                                    </div>
                                </div>
                            )}
                        </Card>
                        <Card title="Impact Assessment" icon={<ShieldAlert size={16} />} cardData={{ product_impact_assessment: eventData.product_impact_assessment, regulatory_impact_assessment: eventData.regulatory_impact_assessment }} onSave={handleSave}>
                            {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Product Impact Assessment</label>
                                        <EditableField name="product_impact_assessment" value={data.product_impact_assessment} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Describe the impact on product quality..." />
                                    </div>
                                    <div>
                                        <label>Regulatory Impact Assessment</label>
                                        <EditableField name="regulatory_impact_assessment" value={data.regulatory_impact_assessment} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Assess any regulatory impact..." />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                    <div className="grid-side-column">
                        <Card title="Event Details" icon={<Info size={16} />} cardData={{ status: eventData.status, severity: eventData.severity, created_by: eventData.created_by }} onSave={handleSave}>
                             {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Status</label>
                                        <EditableField name="status" value={data.status} isEditing={isEditing} onChange={onChange} as="select" options={statusOptions} />
                                    </div>
                                    <div>
                                        <label>Severity</label>
                                        <EditableField name="severity" value={data.severity} isEditing={isEditing} onChange={onChange} as="select" options={severityOptions} />
                                    </div>
                                     <div>
                                        <label>Created By</label>
                                        <EditableField name="created_by" value={data.created_by} isEditing={isEditing} onChange={onChange} placeholder="Assignee name..."/>
                                    </div>
                                </div>
                            )}
                        </Card>
                        <Card title="Affected Product & Records" icon={<Package size={16} />} cardData={{ batch_Number: eventData.batch_Number, department: eventData.department, linked_capa_id: eventData.linked_capa_id }} onSave={handleSave}>
                             {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Batch / Lot Number</label>
                                        <EditableField name="batch_Number" value={data.batch_Number} isEditing={isEditing} onChange={onChange} placeholder="e.g., BN-2025-001" />
                                    </div>
                                    <div>
                                        <label>Department</label>
                                        <EditableField name="department" value={data.department} isEditing={isEditing} onChange={onChange} />
                                    </div>
                                    <div>
                                        <label>Linked CAPA ID</label>
                                        <EditableField name="linked_capa_id" value={data.linked_capa_id} isEditing={isEditing} onChange={onChange} />
                                    </div>
                                </div>
                            )}
                        </Card>
                        <Card title="Modification History" icon={<History size={16} />} cardData={{ lastModified_at: eventData.lastModified_at, lastModified_by: eventData.lastModified_by }} onSave={handleSave}>
                             {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Last Modified At</label>
                                        <EditableField name="lastModified_at" value={formatDate(data.lastModified_at).inputFormat} isEditing={isEditing} onChange={onChange} type="date" />
                                    </div>
                                    <div>
                                        <label>Last Modified By</label>
                                        <EditableField name="lastModified_by" value={data.lastModified_by} isEditing={isEditing} onChange={onChange} placeholder="Username..." />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>
            <aside className="ai-assistant-panel">
                <div className="ai-chat-header"><BrainCircuit size={18} /> AI Assistant</div>
                <div className="ai-chat-content">
                    <div className="ai-suggestion-box">
                        Viewing Deviation {eventData.event_id}. Ask me to 'summarize this event', 'find similar events', or 'suggest investigation steps'.
                    </div>
                </div>
                <form className="ai-chat-input-form" onSubmit={handleAiSubmit}>
                    <input type="text" placeholder="Ask about this Deviation..." className="ai-chat-input"  value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}/>
                    <button type="submit" className="ai-send-button"><Send size={16} /></button>
                </form>
            </aside>
        </div>
    );
};

export default DeviationDetailsPage;