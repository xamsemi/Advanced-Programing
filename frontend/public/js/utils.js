export function formatDateTimeToDate(dateString) {
    let formattedDate = "—";
    if (dateString) {
        const customDate = new Date(dateString);
        if (!isNaN(customDate.getTime())) {
            formattedDate = customDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
            formattedDate = "Ungültiges Datum";
        }
    }
    return formattedDate;
}

export function formatDateTimeToTime(dateString) {
    let formattedDateTime = "—";
    if (dateString) {
        const customDate = new Date(dateString);
        if (!isNaN(customDate.getTime())) {
            formattedDateTime = customDate.toLocaleString('de-DE', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
        } else {
            formattedDateTime = "Ungültiges Datum";
        }
    }
    return formattedDateTime;
}