document.getElementById('addPlanner').addEventListener('click', async () => {
  const userId = parseInt(document.getElementById('plannerUser').value, 10);
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
  const userId = parseInt(document.getElementById('plannerUser').value, 10);
  if (!userId) return;

  const response = await fetch(`/api/dailyPlanner/${userId}`);
  const data = await response.json();
  const plannerList = document.getElementById('plannerList');

  if (Array.isArray(data)) {
    plannerList.innerHTML = data.map(item => `
      <li>${item.Activity} — ${item.StartTime} to ${item.EndTime} — ${item.Status}</li>
    `).join('');
  } else {
    plannerList.innerHTML = '<li>No activities found</li>';
  }
}

// Optional: auto-reload when user ID is entered
document.getElementById('plannerUser').addEventListener('change', loadActivities);
