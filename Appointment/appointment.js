const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('month-year');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const appointmentForm = document.getElementById('med-form');

const modal = document.getElementById('modal');
const editForm = document.getElementById('edit-form');
const deleteBtn = document.getElementById('delete-btn');
const cancelBtn = document.getElementById('cancel-btn');

let currentDate = new Date();
let allAppointments = [];
let selectedAppointmentId = null;

// Get token or redirect to login
const token = localStorage.getItem('token');
if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

// Format date as YYYY-MM-DD
function getDateKey(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
}

// Format datetime-local input value
function formatDateTimeLocal(datetime) {
  const dt = new Date(datetime);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// Fetch appointments from API
async function fetchAppointmentsFromAPI() {
  const res = await fetch("/api/appointments", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch appointments:", await res.text());
    return;
  }

  const data = await res.json();
  allAppointments = data;
  renderCalendar();
}

// Render calendar with appointments
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYearEl.textContent = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
  calendarEl.innerHTML = '';

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day';
    calendarEl.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.innerHTML = `<strong>${day}</strong>`;

    const appointmentsForDay = allAppointments.filter(app => getDateKey(new Date(app.time)) === dateKey);

    appointmentsForDay.forEach(app => {
      const div = document.createElement('div');
      div.className = 'med-entry';
      const time = new Date(app.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      div.textContent = `${app.clinic} (${app.purpose}) @ ${time}`;
      div.onclick = () => openEditModal(app);
      dayEl.appendChild(div);
    });

    calendarEl.appendChild(dayEl);
  }
}

// Add new appointment
appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const clinic = document.getElementById('med-name').value.trim();
  const purpose = document.getElementById('med-purpose').value.trim();
  const datetime = document.getElementById('med-datetime').value;

  await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ clinic, purpose, time: datetime })
  });

  appointmentForm.reset();
  await fetchAppointmentsFromAPI();
});

// Navigate months
prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Open modal for editing
function openEditModal(app) {
  selectedAppointmentId = app.id;
  document.getElementById('edit-name').value = app.clinic;
  document.getElementById('edit-purpose').value = app.purpose;
  document.getElementById('edit-datetime').value = formatDateTimeLocal(app.time);
  modal.classList.add('modal-visible');
}

// Update appointment
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const updatedClinic = document.getElementById('edit-name').value;
  const updatedPurpose = document.getElementById('edit-purpose').value;
  const updatedTime = document.getElementById('edit-datetime').value;

  await fetch(`/api/appointments/${selectedAppointmentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ clinic: updatedClinic, purpose: updatedPurpose, time: updatedTime })
  });

  modal.classList.remove('modal-visible');
  await fetchAppointmentsFromAPI();
});

// Delete appointment
deleteBtn.addEventListener('click', async () => {
  if (confirm("Are you sure you want to delete this appointment?")) {
    await fetch(`/api/appointments/${selectedAppointmentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    modal.classList.remove('modal-visible');
    await fetchAppointmentsFromAPI();
  }
});

// Cancel modal
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('modal-visible');
  });
}

// Appointment History Modal Logic
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const historyList = document.getElementById('history-list');
const closeHistoryBtn = document.getElementById('close-history-btn');

if (historyBtn && historyModal && historyList && closeHistoryBtn) {
  // ...existing code...
historyBtn.addEventListener('click', () => {
  // Get past appointments (before now)
  const now = new Date();
  const pastAppointments = allAppointments
    .filter(app => new Date(app.time) < now)
    .sort((a, b) => new Date(b.time) - new Date(a.time)); // Most recent first

  // Render list
  historyList.innerHTML = '';
  if (pastAppointments.length === 0) {
    historyList.innerHTML = '<li style="color:#888;">No past appointments.</li>';
  } else {
    pastAppointments.forEach(app => {
      const dateStr = new Date(app.time).toLocaleString();
      const card = document.createElement('li');
      card.style.background = '#f6ecff';
      card.style.borderRadius = '12px';
      card.style.padding = '16px';
      card.style.marginBottom = '14px';
      card.style.boxShadow = '0 2px 8px rgba(120,80,200,0.07)';
      card.innerHTML = `
        <div style="font-weight:bold; color:#6b319c; font-size:16px;">${app.clinic}</div>
        <div style="color:#764abc; margin:6px 0 8px 0;">${app.purpose}</div>
        <div style="font-size:14px; color:#555;">${dateStr}</div>
      `;
      historyList.appendChild(card);
    });
  }

  historyModal.style.display = 'block';
});
// ...existing code...

  closeHistoryBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
  });

  // Optional: Close modal when clicking outside of it
  window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      historyModal.style.display = 'none';
    }
  });
}

// Initial load
window.addEventListener('DOMContentLoaded', fetchAppointmentsFromAPI);
