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

function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTimeLocal(datetime) {
  const dt = new Date(datetime);
  return dt.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}

async function fetchAppointmentsFromAPI() {
  const res = await fetch("/api/appointments");
  const data = await res.json();
  allAppointments = data;
  renderCalendar();
}

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

appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const clinic = document.getElementById('med-name').value;
  const purpose = document.getElementById('med-purpose').value;
  const time = document.getElementById('med-datetime').value;

  await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clinic, purpose, time })
  });

  appointmentForm.reset();
  await fetchAppointmentsFromAPI();
});

prevBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function openEditModal(app) {
  selectedAppointmentId = app.id;
  document.getElementById('edit-name').value = app.clinic;
  document.getElementById('edit-purpose').value = app.purpose;
  document.getElementById('edit-datetime').value = formatDateTimeLocal(app.time);
  modal.classList.add('visible');
}

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const updatedClinic = document.getElementById('edit-name').value;
  const updatedPurpose = document.getElementById('edit-purpose').value;
  const updatedTime = document.getElementById('edit-datetime').value;

  await fetch(`/api/appointments/${selectedAppointmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clinic: updatedClinic, purpose: updatedPurpose, time: updatedTime })
  });

  modal.classList.remove('visible');
  await fetchAppointmentsFromAPI();
});

deleteBtn.addEventListener('click', async () => {
  if (confirm("Are you sure you want to delete this appointment?")) {
    await fetch(`/api/appointments/${selectedAppointmentId}`, {
      method: "DELETE"
    });

    modal.classList.remove('visible');
    await fetchAppointmentsFromAPI();
  }
});

fetchAppointmentsFromAPI();
