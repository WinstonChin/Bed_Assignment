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

//get token else locked out//
const token = localStorage.getItem('token');
if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

//get date in format//
function getDateKey(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
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

  //show month,year and clear calender///
  monthYearEl.textContent = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
  calendarEl.innerHTML = '';

  //"blank" the number of days based on the month//
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day';
    calendarEl.appendChild(empty);
  }

  //for each day until end of the month, create a box//
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.innerHTML = `<strong>${day}</strong>`;


    // add medicine numbers//
    const medsForDay = allMeds.filter(med => getDateKey(new Date(med.datetime)) === dateKey);

    //foreach med entry, give name then hour in 2 digit and minute in 2 digit//
    medsForDay.forEach(med => {
      const div = document.createElement('div');
      div.className = 'med-entry';
      const time = new Date(med.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      div.textContent = `${med.medicine} @ ${time}`;
      div.onclick = () => openEditModal(med); //clickimg this lets you edit it //
      dayEl.appendChild(div); 
    });

    calendarEl.appendChild(dayEl); //edit day with the event//
  }
}

// Add new reminder without special condition (reference for me)//
/*medForm.addEventListener('submit', async (e) => {
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
*/

medForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('med-name').value.trim();
  const datetimeInput = document.getElementById('med-datetime').value;
  const recurrence = document.getElementById('dateTimings').value;
  const token = localStorage.getItem('token');


  const datetime = new Date(datetimeInput);
  let reminders = [];

  if (recurrence === "1") {  // Once
    reminders.push(datetime);
  } else if (recurrence === "2") {  // 3 times a day
    reminders.push(datetime);
    reminders.push(new Date(datetime.getTime() + 4 * 60 * 60 * 1000));
    reminders.push(new Date(datetime.getTime() + 8 * 60 * 60 * 1000));
  } else if (recurrence === "3") {  // Daily for 30 days
    for (let i = 0; i < 30; i++) {
      const nextDate = new Date(datetime);
      nextDate.setDate(datetime.getDate() + i);
      reminders.push(nextDate);
    }
  } else if (recurrence === "4") {  // Weekly for 4 weeks
    for (let i = 0; i < 4; i++) {
      const nextDate = new Date(datetime);
      nextDate.setDate(datetime.getDate() + i * 7);
      reminders.push(nextDate);
    }
  }
  else if (recurrence === "5") {  // Monthly for 3 months
    for (let i = 0; i < 3; i++) {
      const nextDate = new Date(datetime);
      nextDate.setMonth(datetime.getMonth() + i);
      reminders.push(nextDate);
    }}

  try {
    for (const reminderDate of reminders) {
      const res = await fetch("/api/meds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          medicine: name,
          datetime: reminderDate.toISOString(),
       
        })
      });

      if (!res.ok) {
        console.error(`Failed to save reminder for ${reminderDate}`, await res.text());
      }
    }

    medForm.reset();
    await fetchMedsFromAPI();
  } catch (err) {
    console.error("Error saving reminders:", err);
    alert("Error saving reminders");
  }
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
//fetchMedsFromApi()//
window.addEventListener('DOMContentLoaded', fetchMedsFromAPI);

