document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/appointments/history', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(response.status === 401 ? 'Please login to view history' : 'Failed to load data');
        }

        const { data } = await response.json();
        renderHistory(data);
        
    } catch (error) {
        alert(error.message);
        if (error.message.includes('login')) {
            window.location.href = '/login';
        }
    }
});

function renderHistory(appointments) {
    const tableBody = document.getElementById('historyTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!appointments || appointments.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');
    tableBody.innerHTML = appointments.map(appointment => `
        <tr>
            <td>${appointment.Date}</td>
            <td>${appointment.Time}</td>
            <td>${appointment.Doctor}</td>
            <td>${appointment.Location}</td>
            <td>${appointment.Purpose}</td>
            <td class="status-${appointment.Status.toLowerCase()}">
                ${appointment.Status}
            </td>
        </tr>
    `).join('');
}