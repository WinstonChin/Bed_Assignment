const userId = 1; // Replace with real user ID when login is implemented

// Autofill today's date on load
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  document.getElementById("logDate").value = today;
  loadMoodLogs();
});

function setMood(id) {
  document.getElementById("moodSelect").value = id;
}

document.getElementById("submitMood").addEventListener("click", async () => {
  const moodId = document.getElementById("moodSelect").value;
  const note = document.getElementById("moodNote").value;
  const rawDate = document.getElementById("logDate").value;
  const today = new Date().toLocaleDateString('en-CA');

  if (rawDate !== today) {
    alert("You can only log mood for today.");
    return;
  }
  
  const logTimestamp = new Date().toISOString(); // current datetime

  try {
    const response = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        moodId,
        note,
        logTimestamp
      })
    });

    const data = await response.json();
    console.log("Mood response:", data);

    if (data.message) {
      alert(data.message);
      loadMoodLogs();
    } else if (data.error) {
      alert("Error: " + data.error);
    } else {
      alert("Unexpected response from server.");
    }

  } catch (err) {
    console.error("Request failed:", err);
    alert("Failed to send mood. Please try again.");
  }
});

async function loadMoodLogs() {
  const response = await fetch(`/api/moods/${userId}`);
  const logs = await response.json();

  const container = document.getElementById("moodLogs");
  container.innerHTML = logs.map(log => {
    const dateTime = new Date(log.LogTimestamp).toLocaleString('en-GB');
    return `
  <li>
    <strong>${dateTime}</strong> - ${log.MoodName}: ${log.Note}
    <button onclick="deleteMood(${log.LogID})">🗑</button>
    <button onclick="editMood(${log.LogID}, '${log.Note.replace(/'/g, "\\'")}', ${log.MoodID})">✏️</button>
  </li>
`;
  }).join('');
}

async function deleteMood(logId) {
  const confirmed = confirm("Are you sure you want to delete this mood log?");
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/moods/${logId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      loadMoodLogs(); // refresh after deletion
    } else {
      alert("Delete failed: " + data.error);
    }

  } catch (err) {
    alert("Request failed: " + err.message);
    console.error(err);
  }
}

function editMood(logId, currentNote, currentMoodId) {
  const container = document.getElementById("moodLogs");
  container.innerHTML += `
    <div id="editForm">
      <h4>Edit Mood</h4>
      <select id="editMoodSelect">
        <option value="1" ${currentMoodId === 1 ? 'selected' : ''}>😊</option>
        <option value="2" ${currentMoodId === 2 ? 'selected' : ''}>😔</option>
        <option value="3" ${currentMoodId === 3 ? 'selected' : ''}>😠</option>
        <option value="4" ${currentMoodId === 4 ? 'selected' : ''}>😰</option>
      </select><br><br>
      <textarea id="editNote">${currentNote}</textarea><br>
      <button onclick="saveEditMood(${logId})">Save</button>
      <button onclick="cancelEdit()">Cancel</button>
    </div>
  `;
}

function cancelEdit() {
  loadMoodLogs();
}

async function saveEditMood(logId) {
  const moodId = document.getElementById("editMoodSelect").value;
  const note = document.getElementById("editNote").value;

  const res = await fetch(`/api/moods/${logId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moodId, note })
  });

  const data = await res.json();
  alert(data.message);
  loadMoodLogs();
}


document.getElementById('addPlanner').addEventListener('click', async () => {
  const activity = document.getElementById('activity').value;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const status = document.getElementById('status').value;

  const response = await fetch('/api/dailyPlanner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, activity, startTime, endTime, status })
  });

  const result = await response.json();
  if (response.ok) {
    alert('Activity added');
    loadActivities();
  } else {
    alert(result.error || result.message || 'Failed to add activity');
  }
});


async function loadActivities() {
  const response = await fetch(`/api/dailyPlanner/${userId}`);
  const data = await response.json();

  const plannerList = document.getElementById('plannerList');
  if (Array.isArray(data) && data.length > 0) {
    plannerList.innerHTML = data.map(item => `
  <li>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>${item.Activity}</strong><br>
        ${formatDateTime(item.StartTime)} to ${formatDateTime(item.EndTime)}<br>
        <em>Status:</em> ${item.Status}
      </div>
      <div>
        <button onclick="deleteActivity(${item.ActivityId})" title="Delete">🗑️</button>
        <button onclick="updateStatus(${item.ActivityId}, 'completed')" title="Mark as Completed">✅</button>
        <button onclick="updateStatus(${item.ActivityId}, 'missed')" title="Mark as Missed">❌</button>
      </div>
    </div>
  </li>
`).join('');
  } else {
    plannerList.innerHTML = '<li>No activities found</li>';
  }
}
async function updateStatus(id, newStatus) {
  console.log("Updating activity", id, "to", newStatus);
  const response = await fetch(`/api/dailyPlanner/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });

  const result = await response.json();
  console.log("Status update response:", result);
  if (response.ok) {
    loadActivities();
  } else {
    alert(result.error || "Failed to update status");
  }
}

async function deleteActivity(id) {
  console.log("Deleting activity", id);
  const response = await fetch(`/api/dailyPlanner/${id}`, {
    method: 'DELETE'
  });

  const result = await response.json();
  console.log("Delete response:", result);
  if (response.ok) {
    loadActivities();
  } else {
    alert(result.error || "Failed to delete activity");
  }
}



function formatDateTime(rawDateTime) {
  // rawDateTime = "1900-01-01T06:00:00.000Z" or similar
  const match = rawDateTime.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : rawDateTime;
}
