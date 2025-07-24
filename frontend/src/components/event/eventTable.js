// src/components/event/EventTable.jsx
import React from 'react';
import dateFormat from '../common/dateFormat';

// Using a separate CSS file for styling is recommended
import './eventTable.css'; 

const EventTable = ({ events, onRowClick }) => {
    return (
        <div className="table-container">
            <table className="qms-table">
                <thead>
                    <tr>
                        <th>EVENT ID</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Department</th>
                        <th>Created By</th>
                        <th>End Date</th>
                        <th>Site</th>
                        <th>Severity</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        // The entire row is clickable
                        <tr key={event.event_id} onClick={() => onRowClick(event.event_id,event.event_type)} className="clickable-row">
                            <td>{event.event_id}</td>
                            <td>{event.title}</td>
                            <td>{event.event_type}</td>
                            <td><span className={`status-${event.status.toLowerCase()}`}>{event.status}</span></td>
                            {/* These fields would come from your expanded data model */}
                            <td>{event.department || 'N/A'}</td>
                            <td>{event.created_by || 'N/A'}</td>
                            <td>{dateFormat(event.created_at)}</td>
                            <td>{event.site || 'India'}</td>
                            <td>{event.severity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EventTable;