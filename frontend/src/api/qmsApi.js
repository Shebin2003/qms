
const BASE_URL = 'http://127.0.0.1:8000'; 

export const fetchEvents = async () => {
    const response = await fetch(`${BASE_URL}/event`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
};


export const fetchEventById = async (data) => {
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

export const updateEventByAI = async (payload) => {
    const response = await fetch(`${BASE_URL}/deviation_chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        const requestBody = {
            message: payload.message,
            thread_id: payload.thread_id,
            current_event: payload.current_event || {}
        };
        console.log("Request body for AI call:", requestBody);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody), 
        };

        const response = await fetch(`${BASE_URL}/listAI/`, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error calling agent API:", error);
        throw error; 
    }
};