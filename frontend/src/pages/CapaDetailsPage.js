import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { fetchEventById, updateEventByAI,updateCapa } from '../api/qmsApi';
import { FilePenLine, Zap, ShieldCheck, CheckCircle, BrainCircuit, Send, Save, Target, Package, History, Info } from 'lucide-react';
import './CapaDetailsPage.css';

// --- Constants for Dropdown Options ---
const statusOptions = ["REQUESTED", "UNDER_INVESTIGATION", "PENDING_APPROVAL", "CLOSED"];
const severityOptions = ["CRITICAL", "MAJOR", "MINOR"];

// --- Helper Components ---
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

    useEffect(() => { setEditedData(cardData);
        
     }, [cardData]);

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


const CapaDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { event_id, event_type } = location.state || {};
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [threadId, setThreadId] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('');
    useEffect(() => {
        const loadEvent = async () => {
          
            if (!event_id || !event_type) { setLoading(false); return; }
            try {
                const data = await fetchEventById({ event_id, event_type });
                const combinedData = { ...data.event, ...data.capa };
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
        
        // Define the keys that belong to the Deviation model
        const capaKeys = [
            'capa_id', 'root_cause', 'preventive_action', 'effectiveness_check',
            'closure_justification', 'verification_plan', 'verification_summary',
            'quality_approver','corrective_action'
        ];

        const groupedData = {
            event: {},
            capa: {}
        };
        // Loop through all keys in the flat data object
        for (const key in eventData) {
            if (eventKeys.includes(key)) {
                // If the key is an event key, add it to the event object
                groupedData.event[key] = eventData[key];
            } else if (capaKeys.includes(key)) {
                // If the key is a deviation key, add it to the deviation object
                groupedData.capa[key] = eventData[key];
            }
        };
        try {
                  const response = updateCapa(groupedData);
                  console.log('Update successful:', response);
                  alert('Capa updated successfully!');
                  returnHome()
        
                } catch (error) {
                  console.error('Failed to update capa:', error);
                  alert('An error occurred while updating');
        
                } finally {
                  console.log('Update attempt finished.');
                }
        

    };
    const returnHome = () => navigate('/');
    const handleAiSubmit = async (e) => {
            setThreadId(`thread_${Date.now()}`);
            e.preventDefault(); // Prevent the form from causing a page reload
            if (!aiPrompt.trim()) return; // Don't send empty messages
    
            const payload = {
                message: aiPrompt,  
                thread_id: threadId,
                data: eventData // The current eventData state
            };
            
            console.log("Sending data to AI:", payload);
            
            try {
                // The AI backend will return the fields to update
                const temp = await updateEventByAI(payload);
                const updates = temp.payload 
                console.log("payload",payload)
                
                // Update the form with the data returned by the AI
                setEventData(prevData => ({ ...prevData, ...updates }));
                
                console.log("AI response processed, state updated.");
    
            } catch (error) {
                console.error("AI Assistant failed:", error);
                alert("The AI assistant could not be reached.");
            }
    
            setAiPrompt(''); // Clear the input field after sending
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
                        <button className="button-primary" onClick={returnHome}>Close CAPA</button>
                    </div>
                </header>

                <div className="details-grid">
                    <div className="grid-main-column">
                        <Card title="Event Description" icon={<FilePenLine size={16} />} cardData={{ description: eventData.description }} onSave={handleSave}>
                            {(isEditing, data, onChange) => (
                                <EditableField name="description" value={data.description} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Detailed description..." />
                            )}
                        </Card>
                        <Card title="Root Cause Analysis" icon={<Zap size={16} />} cardData={{ root_cause: eventData.root_cause }} onSave={handleSave}>
                            {(isEditing, data, onChange) => (
                                <EditableField name="root_cause" value={data.root_cause} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Detailed root cause analysis..." />
                            )}
                        </Card>
                        <Card title="Action Plan" icon={<Target size={16} />} cardData={{ corrective_action: eventData.corrective_action, preventive_action: eventData.preventive_action }} onSave={handleSave}>
                            {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Corrective Action</label>
                                        <EditableField name="corrective_action" value={data.corrective_action} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Actions to fix the current issue..." />
                                    </div>
                                    <div>
                                        <label>Preventive Action</label>
                                        <EditableField name="preventive_action" value={data.preventive_action} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Actions to prevent recurrence..." />
                                    </div>
                                </div>
                            )}
                        </Card>
                        <Card title="Verification & Effectiveness" icon={<CheckCircle size={16} />} cardData={{ effectiveness_check: eventData.effectiveness_check, verification_plan: eventData.verification_plan }} onSave={handleSave}>
                             {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div>
                                        <label>Effectiveness Check</label>
                                        <EditableField name="effectiveness_check" value={data.effectiveness_check} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="How effectiveness will be measured..." />
                                    </div>
                                    <div>
                                        <label>Verification Plan</label>
                                        <EditableField name="verification_plan" value={data.verification_plan} isEditing={isEditing} onChange={onChange} as="textarea" placeholder="Plan to verify effectiveness..." />
                                    </div>
                                </div>
                            )}
                        </Card>
                        {/* MOVED: Closure & Approvals card is now in the main column */}
                        <Card title="Closure & Approvals" icon={<ShieldCheck size={16} />} cardData={{ quality_approver: eventData.quality_approver, verification_summary: eventData.verification_summary, closure_justification: eventData.closure_justification }} onSave={handleSave}>
                             {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div><label>Quality Approver</label><EditableField name="quality_approver" value={data.quality_approver} isEditing={isEditing} onChange={onChange} /></div>
                                    <div><label>Verification Summary</label><EditableField name="verification_summary" value={data.verification_summary} isEditing={isEditing} onChange={onChange} as="textarea" /></div>
                                    <div><label>Closure Justification</label><EditableField name="closure_justification" value={data.closure_justification} isEditing={isEditing} onChange={onChange} as="textarea" /></div>
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
                        <Card title="Context & Records" icon={<Package size={16} />} cardData={{ department: eventData.department, site: eventData.site }} onSave={handleSave}>
                             {(isEditing, data, onChange) => (
                                <div className="card-sub-grid-single-col">
                                    <div><label>Department</label><EditableField name="department" value={data.department} isEditing={isEditing} onChange={onChange} /></div>
                                    <div><label>Site</label><EditableField name="site" value={data.site} isEditing={isEditing} onChange={onChange} /></div>
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
                <div className="ai-chat-content"><div className="ai-suggestion-box">Viewing CAPA {eventData.event_id}. Ask me to 'summarize the action plan', 'suggest verification methods', or 'draft a closure summary'.</div></div>
                <form className="ai-chat-input-form" onSubmit={handleAiSubmit}>
                                    <input type="text" placeholder="Ask about this Deviation..." className="ai-chat-input"  value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}/>
                                    <button type="submit" className="ai-send-button"><Send size={16} /></button>
                                </form>
            </aside>
        </div>
    );
};

export default CapaDetailsPage;