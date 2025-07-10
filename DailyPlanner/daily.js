const userId = 1; // Replace with real user ID if using login system

document.getElementById("submitMood").addEventListener("click", async () => {
    const moodId = document.getElementById("moodSelect").value;
    const note = document.getElementById("moodNote").value;
    const logDate = document.getElementById("logDate").value;

    const response = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, moodId, note, logDate })
    });

    const data = await response.json();
    alert(data.message);
    loadMoodLogs(); // Refresh display
});

async function loadMoodLogs() {
    const response = await fetch(`/api/moods/${userId}`);
    const logs = await response.json();

    const container = document.getElementById("moodLogs");
    container.innerHTML = logs.map(log => 
        `<li><strong>${log.LogDate}</strong> - ${log.MoodName}: ${log.Note}</li>`
    ).join('');
}

window.onload = loadMoodLogs;
