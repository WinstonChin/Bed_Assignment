document.getElementById('panic-button').addEventListener('click', async () => {
  const userId = 1; // Assume userId is fetched dynamically
  const name = 'John Doe'; // This would be fetched from session or other source
  const location = '123 Main St'; // This could be dynamically obtained
  
  const response = await fetch('/api/panicButton', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, name, location }),
  });

  const result = await response.json();
  alert(result.message || 'Emergency triggered');
});
