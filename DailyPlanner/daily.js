const userId = 1; // Replace with real user ID if using login system

document.getElementById("submitMood").addEventListener("click", async () => {
  const moodId = document.getElementById("moodSelect").value;
  const note = document.getElementById("moodNote").value;
  const rawDate = document.getElementById("logDate").value;
  const logDate = new Date(rawDate).toISOString().split('T')[0];  // "YYYY-MM-DD"


  try {
    const response = await fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, moodId, note, logDate })
    });

    const data = await response.json();
    console.log("Mood response:", data); // Debugging

    if (data.message) {
      alert(data.message); // ✅ Shows success
      loadMoodLogs(); // Refresh list
    } else if (data.error) {
      alert("Error: " + data.error); // 🔴 Server returned error
    } else {
      alert("Unexpected response from server."); // 🟡 Catch-all
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
        const dateOnly = new Date(log.LogDate).toLocaleDateString('en-GB'); // Formats to dd/mm/yyyy
        return `<li><strong>${dateOnly}</strong> - ${log.MoodName}: ${log.Note}</li>`;
    }).join('');
}

window.onload = loadMoodLogs;
