// src/api/qmsApi.js

// In a real app, this would be your backend server's URL.
const BASE_URL = 'http://127.0.0.1:8000'; 

// Fetches all non-closed events for the list page
export const fetchEvents = async () => {
    const response = await fetch(`${BASE_URL}/event`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
};

// Fetches a single event by its ID for the detail page
// src/api/qmsApi.js

// ... other functions ...

// Fetches a single event by its ID for the detail page
// Updated to use a POST request as required by the backend
export const fetchEventById = async (data) => {
    // The 'data' parameter should be an object, e.g., { event_id: 13, event_type: "DEVIATION" }
    const response = await fetch(`${BASE_URL}/event`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
};

// Creates a new event from the wizard
export const createEvent = async (eventData) => {
    if (eventData.event.event_type === 'DEVIATION') {
            const response = await fetch(`${BASE_URL}/deviation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
        })
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    }
    if (eventData.event.event_type === 'CAPA') {
            const response = await fetch(`${BASE_URL}/capa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    }
   
    
};

// // Sends a prompt to the AI assistant to get field updates
export const updateEventByAI = async (payload) => {
    // The endpoint might not need the eventId if it's already in the payload data
    const response = await fetch(`${BASE_URL}/deviation_chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send the complete payload
    });
    if (!response.ok) throw new Error('AI assistant failed');
    return response.json();
};

export const updateDeviation = async (data) => {
    const response = await fetch(`${BASE_URL}/deviation`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
};

export const updateCapa = async (data) => {
    const response = await fetch(`${BASE_URL}/capa`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
};

export const getAgentSummary = async (payload) => {
    try {
        // 1. Construct the request body and options
        const requestBody = {
            message: payload.message,
            thread_id: payload.thread_id,
            current_event: payload.current_event || {}
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody), // Manually stringify the body
        };

        // 2. Make the API call using fetch
        const response = await fetch(`${BASE_URL}/listAI/`, options);

        // 3. Check if the response was successful
        if (!response.ok) {
            // Throw an error if the server responded with a status like 404 or 500
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 4. Parse the JSON response and return it
        return await response.json();

    } catch (error) {
        console.error("Error calling agent API:", error);
        throw error; // Re-throw the error to be handled by the calling component
    }
};