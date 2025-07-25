import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/header';
import EventTable from '../components/event/eventTable';
import { fetchEvents } from '../api/qmsApi';
import AIChatPopup from '../components/event/AIChatPopup';
import './ListEventsPage.css'; 

const ListEventsPage = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const [isChatOpen, setIsChatOpen] = useState(false);
    useEffect(() => {
        const loadEvents = async () => {
            const allEvents = await fetchEvents();
            const events = allEvents.events
            console.log(events); 

            const openEvents = events.filter(event => event.status !== 'Closed');
            setEvents(openEvents);
        };
        loadEvents();
    }, []);

    const handleNewEventClick = () => {
        navigate('/new-event');
    };

    const handleRowClick = (eventId,event_type) => {
        console.log(eventId,event_type)
        const data = {"event_id": eventId, "event_type": event_type}
        if(event_type=="DEVIATION"){
            navigate(`/deviation-details`,{state:data});
        }   
        else{
            navigate(`/capa-details`,{state:data});
        }
    };
    
    return (
        <div className="list-events-page-container">
            <Header
                title="Event Management"
                buttonText="Log New Event"
                onButtonClick={handleNewEventClick}
            >
                <button
                    className="secondary-button"
                    onClick={() => setIsChatOpen(true)}
                >
                    AI Chat
                </button>
        </Header>
            <EventTable events={events} onRowClick={handleRowClick} />
            <AIChatPopup 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
            />
        </div>
    );
};

export default ListEventsPage;