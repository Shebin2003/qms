import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './AIChatPopup.css';
import { getAgentSummary } from '../../api/qmsApi';
import { useNavigate } from 'react-router-dom';

const AIChatPopup = ({ isOpen, onClose, events, onApplyFilter }) => {
    const [prompt, setPrompt] = useState('');
    const [threadId, setThreadId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();
    useEffect(() => {
        if (isOpen) {
            setThreadId(`thread_${Date.now()}`);
            setChatHistory([{ 
                author: 'ai', 
                text: 'Ask a question about the events currently displayed.' 
            }]);
        }
    }, [isOpen]);

    const handleQuestion = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        const userMessage = { author: 'user', text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        setIsLoading(true);
        setPrompt('');

        const payload = {
            message: prompt,
            thread_id: threadId,
            data: events
        };
        
        try {
            const response = await getAgentSummary(payload);
            let aiText = "Sorry, I received an unknown response format."; 
            if (response.type === 'summary' && response.payload?.summary_text) {
                aiText = response.payload.summary_text;
            } else if (response.type === 'event_list' && response.payload?.events) {
                

                const eventDetails = response.payload.events.map(event => {
                    return `**Event ID:** ${event.event_id}  \n` +
                        `**Title:** ${event.title}  \n` +
                        `**Type:** ${event.event_type}  \n` +
                        `**Status:** ${event.status}  \n` +
                        `**Severity:** ${event.severity}\n\n---`;
                }).join('\n\n'); 

                aiText = `I found ${response.payload.events.length} matching events:\n\n${eventDetails}`;

                if (onApplyFilter) onApplyFilter(response.payload.events);
            }else if (response.type === 'message' && response.message) {
                aiText = response.message;
            }else if(response.type === 'edit_event' && response.message) {
                console.log("Event to be edited:", response.payload);
                if(response.payload.event_type=="DEVIATION"){
                    navigate(`/deviation-details`,{state:response.payload});
                }   
                else{
                    navigate(`/capa-details`,{state:response.payload});
                }
            }

            const aiMessage = { author: 'ai', text: aiText };
            setChatHistory(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("AI call failed:", error);
            const errorMessage = { author: 'ai', text: 'Sorry, I was unable to process your request.' };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ai-chat-overlay">
            <div className="ai-chat-popup">
                <div className="ai-chat-header">
                    <h3>AI Assistant</h3>
                    <button onClick={onClose} className="ai-chat-close-btn">&times;</button>
                </div>
                <div className="ai-chat-content">
                    {chatHistory.map((entry, index) => (
                        <div key={index} className={`chat-message ${entry.author}`}>
                            {entry.author === 'ai' ? <ReactMarkdown>{entry.text}</ReactMarkdown> : entry.text}
                        </div>
                    ))}
                    {isLoading && <div className="chat-message ai"><em>Thinking...</em></div>}
                </div>
                <form onSubmit={handleQuestion} className="ai-chat-form">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Summarize all critical events..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>Ask</button>
                </form>
            </div>
        </div>
    );
};

export default AIChatPopup;