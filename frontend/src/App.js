// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import the page components
import ListEventsPage from './pages/ListEventsPage';
import NewEventPage from './pages/NewEventPage';
import CapaDetailsPage from './pages/CapaDetailsPage';
import DeviationDetailsPage from './pages/DeviationDetailsPage';

// Import global styles
import './index.css'; 

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Routes>
                    {/* The main page, shows the list of all events */}
                    <Route path="/" element={<ListEventsPage />} />

                    {/* The page for creating a new event */}
                    <Route path="/new-event" element={<NewEventPage />} />

                    <Route path="/deviation-details" element={<DeviationDetailsPage />} />

                    <Route path="/capa-details" element={<CapaDetailsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;