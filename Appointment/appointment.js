<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Appointment Reminder Calendar</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Quicksand', sans-serif;
      margin: 0;
      background: linear-gradient(to bottom right, #f7f0ff, #ffffff);
      color: #333;
    }

    #header {
      margin-bottom: 30px;
    }

    main {
      padding: 30px 20px;
      max-width: 1000px;
      margin: auto;
    }

    h1, h2 {
      text-align: center;
      color: #5c2a9d;
      margin-bottom: 20px;
    }

    #calendar-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 25px;
      gap: 20px;
    }

    #calendar-controls button {
      padding: 10px 20px;
      background-color: #caa8f5;
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      box-shadow: 0 2px 5px rgba(100, 0, 150, 0.1);
    }

    #calendar-controls button:hover {
      background-color: #b58fe4;
    }

    #month-year {
      font-size: 22px;
      font-weight: bold;
      color: #6b319c;
    }

    #calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: bold;
      padding-bottom: 10px;
      color: #764abc;
    }

    #calendar {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 12px;
    }

    .day {
      background-color: #fff;
      border-radius: 16px;
      padding: 10px;
      min-height: 110px;
      font-size: 15px;
      box-shadow: 2px 2px 10px rgba(160, 120, 255, 0.07);
      border: 1px solid #eee;
    }

    .med-entry {
      margin-top: 5px;
      background-color: #e4d4ff;
      padding: 5px 8px;
      border-radius: 8px;
      font-size: 14px;
      color: #3c2179;
      cursor: pointer;
    }

    form {
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      background-color: #fff;
      padding: 25px;
      border-radius: 20px;
      box-shadow: 0 6px 14px rgba(180, 120, 255, 0.08);
    }

    form input, form button {
      margin: 10px 0;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 10px;
    }

    form button {
      background-color: #764abc;
      color: white;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    form button:hover {
      background-color: #5a3496;
    }

    /* Modal styles */

    #modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(60, 40, 100, 0.65);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease-in-out;
      z-index: 1000;
    }

    #modal.modal-visible {
      opacity: 1;
      pointer-events: auto;
    }

    .modal-content {
      background: #fff;
      border-radius: 20px;
      padding: 30px 35px;
      width: 340px;
      box-shadow: 0 8px 30px rgba(120, 85, 230, 0.3);
      font-family: 'Quicksand', sans-serif;
      color: #3b2a7a;
    }

    .modal-content h2 {
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 700;
      font-size: 24px;
      text-align: center;
    }

    .modal-content label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #6a4bdc;
    }

    .modal-content input[type="text"],
    .modal-content input[type="datetime-local"] {
      width: 100%;
      max-width: 310px; 
      padding: 10px 14px;
      margin-bottom: 20px;
      border: 1.8px solid #b5aaff;
      border-radius: 12px;
      font-size: 15px;
      transition: border-color 0.3s ease;
      background-color: #faf8ff;
      margin-left: auto;
      margin-right: auto; 
      display: block;
    }


    .modal-content input[type="text"]:focus,
    .modal-content input[type="datetime-local"]:focus {
      outline: none;
      border-color: #8358e8;
      background-color: #f4efff;
    }

    .modal-buttons {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .btn {
      flex: 1;
      padding: 12px 0;
      border-radius: 30px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      border: none;
      transition: background-color 0.3s ease;
    }

    .btn-save {
      background: linear-gradient(135deg, #7e57c2, #673ab7);
      color: white;
      box-shadow: 0 4px 14px rgba(103, 58, 183, 0.5);
    }
    .btn-save:hover {
      background: linear-gradient(135deg, #673ab7, #5e35b1);
    }

    .btn-delete {
      background: #e53935;
      color: white;
      box-shadow: 0 4px 14px rgba(229, 57, 53, 0.5);
    }
    .btn-delete:hover {
      background: #b71c1c;
    }

    .btn-cancel {
      background: #9e9e9e;
      color: white;
      box-shadow: 0 4px 14px rgba(158, 158, 158, 0.5);
    }
    .btn-cancel:hover {
      background: #616161;
    }
  </style>
</head>
<body>

  <!-- Load header.html -->
  <div id="header"></div>

  <main>
    <h1>📅 Appointment Calendar</h1>

    <div id="calendar-controls">
      <button id="prev-month">← Previous</button>
      <span id="month-year"></span>
      <button id="next-month">Next →</button>
    </div>

    <div id="calendar-header">
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>

    <div id="calendar"></div>

    <h2>➕ Add Appointment</h2>
    <form id="med-form">
      <input type="text" id="med-name" placeholder="Clinic" required />
      <input type="text" id="med-purpose" placeholder="Purpose" required />
      <input type="datetime-local" id="med-datetime" required />
      <button type="submit">Add Reminder</button>
    </form>

    <div class="history-btn-container">
      <a href="appointmenthistory.html" class="history-link">📖 View Appointment History</a>
    </div>
  </main>

  <!-- Edit Modal -->
  <div id="modal">
    <form id="edit-form" class="modal-content">
      <h2>Edit Appointment</h2>
      
      <label for="edit-name">Clinic</label>
      <input type="text" id="edit-name" required />
      
      <label for="edit-purpose">Purpose</label>
      <input type="text" id="edit-purpose" required />
      
      <label for="edit-datetime">Date & Time</label>
      <input type="datetime-local" id="edit-datetime" required />
      
      <div class="modal-buttons">
        <button type="submit" class="btn btn-save">Save</button>
        <button type="button" id="delete-btn" class="btn btn-delete">Delete</button>
        <button type="button" id="cancel-btn" class="btn btn-cancel">Cancel</button>
      </div>
    </form>
  </div>

  <!-- Load header -->
  <script>
    fetch('header.html')
      .then(response => response.text())
      .then(data => {
        document.getElementById('header').innerHTML = data;
      });
  </script>

  <!-- Logic -->
  <script>
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

    // ✅ Get token or redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in first");
      window.location.href = "login.html";
    }

    function getDateKey(date) {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().split('T')[0];
    }

    function formatDateTimeLocal(datetime) {
      const dt = new Date(datetime);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16); // Keep local time
    }

    // ✅ Fetch appointments using token
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
      modal.classList.add('modal-visible');
    }

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

    deleteBtn.addEventListener('click', async () => {
      // Direct delete without confirmation alert
      await fetch(`/api/appointments/${selectedAppointmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      modal.classList.remove('modal-visible');
      await fetchAppointmentsFromAPI();
    });

    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('modal-visible');
    });

    // Initial load
    fetchAppointmentsFromAPI();
  </script>
</body>
</html>
