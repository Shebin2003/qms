// src/components/common/AIChatPopup.jsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Import the new library
import './AIChatPopup.css';
import { getAgentSummary } from '../../api/qmsApi';

const AIChatPopup = ({ isOpen, onClose, events }) => {
    const [prompt, setPrompt] = useState('');
    const [threadId, setThreadId] = useState(null);
    // NEW: State to hold the conversation history
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setThreadId(`thread_${Date.now()}`);
            // Reset history when popup opens
            setChatHistory([{ 
                author: 'ai', 
                text: 'Ask a question about the events currently displayed.' 
            }]);
        }
    }, [isOpen]);

    const handleQuestion = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        // Add user's message to history immediately
        const userMessage = { author: 'user', text: prompt };
        setChatHistory(prev => [...prev, userMessage]);
        
        const payload = {
            message: prompt,
            thread_id: threadId,
            data: events
        };
        
        try {
            const response = await getAgentSummary(payload);
            
            // Add AI's formatted response to history
            const aiMessage = { author: 'ai', text: response.payload.summary_text };
            setChatHistory(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("AI call failed:", error);
            const errorMessage = { author: 'ai', text: 'Sorry, I was unable to process your request.' };
            setChatHistory(prev => [...prev, errorMessage]);
        }

        setPrompt('');
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="ai-chat-overlay">
            <div className="ai-chat-popup">
                <div className="ai-chat-header">
                    <h3>AI Assistant</h3>
                    <button onClick={onClose} className="ai-chat-close-btn">&times;</button>
                </div>
                <div className="ai-chat-content">
                    {/* NEW: Display the chat history */}
                    {chatHistory.map((entry, index) => (
                        <div key={index} className={`chat-message ${entry.author}`}>
                            {/* Use ReactMarkdown for AI messages */}
                            {entry.author === 'ai' ? (
                                <ReactMarkdown>{entry.text}</ReactMarkdown>
                            ) : (
                                entry.text
                            )}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleQuestion} className="ai-chat-form">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Summarize all critical events..."
                    />
                    <button type="submit">Ask</button>
                </form>
            </div>
        </div>
    );
};

export default AIChatPopup;