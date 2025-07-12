document.getElementById('activity-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const userId = 1; // Assume userId is fetched dynamically
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const activity = document.getElementById('activity').value;
  
  const response = await fetch('/api/dailyPlanner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, startTime, endTime, activity }),
  });
  
  const result = await response.json();
  if (response.ok) {
    alert('Activity added successfully');
    loadActivities(); // Refresh activities list
  } else {
    alert(result.message || 'Error adding activity');
  }
});

const loadActivities = async () => {
  const userId = 1; // Assume userId is fetched dynamically
  const response = await fetch(`/api/dailyPlanner/${userId}`);
  const activities = await response.json();
  
  const activitiesContainer = document.getElementById('activities');
  activitiesContainer.innerHTML = activities.map(activity => `
    <div>
      <p>${activity.Activity} - ${activity.StartTime} to ${activity.EndTime} - Status: ${activity.Status}</p>
    </div>
  `).join('');
};

async function submitDailyPlanner() {
  const data = {
    userId: 1,  // Example userId, adjust this based on your authentication logic
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    activity: document.getElementById('activity').value,
  };

  const response = await fetch('/api/dailyPlanner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (response.ok) {
    alert('Activity added successfully');
  } else {
    alert('Error: ' + result.error);
  }
}


loadActivities();
