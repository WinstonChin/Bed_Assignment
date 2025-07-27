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
    const dateTime = new Date(log.LogTimestamp).toLocaleString('en-GB'); // dd/mm/yyyy, HH:mm
    return `<li><strong>${dateTime}</strong> - ${log.MoodName}: ${log.Note}</li>`;
  }).join('');
}
