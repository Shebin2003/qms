const dateFormat = (isoDateString) => {
    // If the date is null or doesn't exist, return 'N/A'
    if (!isoDateString) {
        return 'N/A';
    }

    const date = new Date(isoDateString);
    
    // Format to a clean DD-MMM-YYYY style, e.g., "23-Jul-2025"
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date).replace(/ /g, '-');
};

export default dateFormat;