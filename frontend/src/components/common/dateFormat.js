const dateFormat = (isoDateString) => {
    if (!isoDateString) {
        return 'N/A';
    }

    const date = new Date(isoDateString);

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date).replace(/ /g, '-');
};

export default dateFormat;