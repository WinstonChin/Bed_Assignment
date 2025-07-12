const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('month-year');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const medForm = document.getElementById('med-form');

const modal = document.getElementById('modal');
const editForm = document.getElementById('edit-form');
const deleteBtn = document.getElementById('delete-btn');

let currentDate = new Date();
let allMeds = [];
let selectedMedId = null;
let remindedMeds = new Set();

function getDateKey(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTimeLocal(datetime) {
  const dt = new Date(datetime);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16); // Keep local time
}

// Fetch medicine reminders from API
async function fetchMedsFromAPI() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Missing token");
    return;
  }

  const res = await fetch("/api/meds", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    console.error("Failed to fetch meds:", await res.text());
    return;
  }

  const data = await res.json();
  allMeds = data;
  renderCalendar();

  if (!window.reminderStarted) {
    startReminderChecker();
    window.reminderStarted = true;
  }
}

// Reminder notification
function startReminderChecker() {
  setInterval(() => {
    const now = new Date();

    allMeds.forEach(med => {
      const medId = med.id;
      const medTime = new Date(med.datetime);
      const timeDiff = Math.abs(now - medTime);
      const withinOneMinute = timeDiff <= 60000;

      if (withinOneMinute && !remindedMeds.has(medId)) {
        alert(`Reminder: Take ${med.medicine} now!`);
        remindedMeds.add(medId);
      }
    });
  }, 60000); // Every 1 min
}

// Render calendar
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

    const medsForDay = allMeds.filter(med => getDateKey(new Date(med.datetime)) === dateKey);
    medsForDay.forEach(med => {
      const div = document.createElement('div');
      div.className = 'med-entry';
      const time = new Date(med.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      div.textContent = `${med.medicine} @ ${time}`;
      div.onclick = () => openEditModal(med);
      dayEl.appendChild(div);
    });

    calendarEl.appendChild(dayEl);
  }
}

// Add new reminder
medForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('med-name').value;
  const datetime = document.getElementById('med-datetime').value;
  const token = localStorage.getItem('token');

  await fetch("/api/meds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ medicine: name, datetime })
  });

  medForm.reset();
  await fetchMedsFromAPI();
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
function openEditModal(med) {
  selectedMedId = med.id;
  document.getElementById('edit-name').value = med.medicine;
  document.getElementById('edit-datetime').value = formatDateTimeLocal(med.datetime);
  modal.classList.add('visible');
}

// Update reminder
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const updatedName = document.getElementById('edit-name').value;
  const updatedDatetime = document.getElementById('edit-datetime').value;
  const token = localStorage.getItem('token');

  await fetch(`/api/meds/${selectedMedId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ medicine: updatedName, datetime: updatedDatetime })
  });

  modal.classList.remove('visible');
  await fetchMedsFromAPI();
});

// Delete reminder
deleteBtn.addEventListener('click', async () => {
  if (confirm("Are you sure you want to delete this reminder?")) {
    const token = localStorage.getItem('token');

    await fetch(`/api/meds/${selectedMedId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    modal.classList.remove('visible');
    await fetchMedsFromAPI();
  }
});

// Load on page start
fetchMedsFromAPI();
