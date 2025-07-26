import React, { useState } from 'react';

const GearIcon = () => <span>⚙️</span>;

const AIChatPanel = ({ onPromptSubmit }) => {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt) return;
        const userMessage = { author: 'user', text: prompt };
        const aiResponse = { author: 'ai', text: `(Simulated response for "${prompt}")` };

        setHistory(prev => [...prev, userMessage, aiResponse]);
        setPrompt('');
    };

    return (
        <div className="ai-chat-container">
            <header className="ai-chat-header">
                <GearIcon /> AI Assistant
            </header>

            <div className="ai-chat-content">
                <div className="ai-suggestion-box">
                    Viewing Deviation DEV-2025-001. Ask me to 'summarize this event', 'find similar events', or 'suggest investigation steps'.
                </div>
                <div className="ai-chat-log">
                    {history.map((entry, index) => (
                        <div key={index} className={`chat-entry ${entry.author}-entry`}>
                            {entry.text}
                        </div>
                    ))}
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="ai-chat-input-form">
                <input
                    type="text"
                    className="ai-chat-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask about this event..."
                />
                <button type="submit" className="ai-chat-send-button">➤</button>
            </form>
        </div>
    );
};

export default AIChatPanel;