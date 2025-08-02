document.addEventListener("DOMContentLoaded", loadEmergencies);

document.getElementById('panic-button').addEventListener('click', async () => {
  const userId = 1;
  const name = 'John Doe';
  const location = '123 Main St';

  const response = await fetch('/api/panicButton', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name, location })
  });

  const result = await response.json();
  alert(result.message || 'Emergency triggered');
  loadEmergencies();
});

async function loadEmergencies() {
  const userId = 1;
  const response = await fetch(`/api/panicButton/${userId}`);
  const emergencies = await response.json();

  const tableBody = document.querySelector("#emergency-table tbody");
  tableBody.innerHTML = emergencies.map(e => `
    <tr>
      <td>${e.userId}</td>
      <td>${e.Name}</td>
      <td>${e.Location}</td>
      <td>${e.Status}</td>
      <td>${new Date(e.CreatedAt).toLocaleString()}</td>
      <td>${new Date(e.UpdatedAt).toLocaleString()}</td>
    </tr>
  `).join('');
}
