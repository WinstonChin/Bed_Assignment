function showMessage(msg, type = 'success') {
  const box = document.getElementById('message-box');
  box.textContent = msg;
  box.style.display = 'block';
  box.style.backgroundColor = type === 'error' ? '#f8d7da' : '#d1e7dd';
  box.style.color = type === 'error' ? '#842029' : '#0f5132';
  box.style.border = `1px solid ${type === 'error' ? '#f5c2c7' : '#badbcc'}`;

  setTimeout(() => {
    box.style.display = 'none';
  }, 5000);
}

// Converts UTC date string to local datetime-local input value
function toLocalDatetimeInputValue(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const API_URL = '/health-journal';
const form = document.getElementById('journal-form');
const journalList = document.getElementById('journal-list');

const entryIdInput = document.getElementById('entry-id');
const dateInput = document.getElementById('entry-date');
const levelInput = document.getElementById('pain-level');
const locationInput = document.getElementById('pain-location');
const symptomsInput = document.getElementById('symptoms');
const notesInput = document.getElementById('notes');
const photoInput = document.getElementById('photo');

const token = localStorage.getItem('token');
if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

// Set max attribute on load
function getCurrentDatetimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
document.addEventListener('DOMContentLoaded', () => {
  const now = getCurrentDatetimeLocal();
  dateInput.max = now;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    // Get input values
    const entryDate = dateInput.value;
    const now = new Date();
    const selectedDate = new Date(entryDate);

    if (selectedDate > now) {
      throw new Error('Entry date cannot be in the future.');
    }

    const painLevel = levelInput.value;
    const painLocation = locationInput.value;
    const symptoms = symptomsInput.value;
    const notes = notesInput.value;

    // 1. Check required fields
    if (!entryDate || !painLevel || !symptoms || !notes) {
      throw new Error('Please fill all required fields');
    }

    // 2. Validate pain level (must be number 0-10)
    const painLevelNum = parseInt(painLevel);
    if (isNaN(painLevelNum)) {
      throw new Error('Pain level must be a number');
    }
    if (painLevelNum < 0 || painLevelNum > 10) {
      throw new Error('Pain level must be between 0-10');
    }

    // 3. Validate text fields don't contain only numbers
    const numberRegex = /^[0-9]+$/;
    const containsLettersRegex = /[a-zA-Z]/; // At least one letter

    if (painLocation && numberRegex.test(painLocation)) {
      throw new Error('Pain location cannot be just numbers');
    }

    if (!containsLettersRegex.test(symptoms)) {
      throw new Error('Symptoms must contain text (not just numbers/symbols)');
    }

    if (!containsLettersRegex.test(notes)) {
      throw new Error('Notes must contain text (not just numbers/symbols)');
    }

    // Prepare FormData for file upload
    const formData = new FormData();
    formData.append('entry_date', entryDate);
    formData.append('pain_level', painLevelNum);
    formData.append('pain_location', painLocation || '');
    formData.append('symptoms', symptoms);
    formData.append('notes', notes);

    // Append photo if selected
    if (photoInput.files && photoInput.files[0]) {
      formData.append('photo', photoInput.files[0]);
    }

    // If editing, append the entry ID
    if (entryIdInput.value) {
      formData.append('id', entryIdInput.value);
    }

    const id = entryIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    const response = await fetch(url, {
      method,
      body: formData,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const result = await response.json();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend error:', errorData);
      throw new Error(errorData.error || errorData.message || 'Failed to save entry');
    }

    // Reset form on success
    form.reset();
    dateInput.value = getCurrentDatetimeLocal();
    entryIdInput.value = '';

    await loadEntries();
    await renderPainTrendChart(); // <-- Chart updates immediately

    let message = 'Entry saved successfully!';
    const analysisBox = document.getElementById('symptom-analysis');
    if (result.analysis?.recommendation) {
      analysisBox.innerHTML = `<strong>Symptom Analysis:</strong><br>${result.analysis.recommendation}`;
      analysisBox.style.display = 'block';
    } else {
      analysisBox.style.display = 'none';
    }
    showMessage(message);

  } catch (err) {
    console.error('Save error:', err);
    alert(err.message || 'Failed to save entry');
  }
});

const searchForm = document.getElementById('search-form');
const searchDate = document.getElementById('search-date');
const searchPain = document.getElementById('search-pain');
const searchSymptoms = document.getElementById('search-symptoms');
const clearSearchBtn = document.getElementById('clear-search');

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const params = [];
  if (searchDate.value) params.push(`date=${encodeURIComponent(searchDate.value.trim())}`);
  if (searchPain.value) params.push(`pain_level=${encodeURIComponent(searchPain.value)}`);
  if (searchSymptoms.value) params.push(`symptoms=${encodeURIComponent(searchSymptoms.value)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  await loadEntries(`/health-journal/search${query}`);
});

clearSearchBtn.addEventListener('click', async () => {
  searchDate.value = '';
  searchPain.value = '';
  searchSymptoms.value = '';
  await loadEntries();
});

async function loadEntries(url = '/health-journal') {
  journalList.innerHTML = '';
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Expected an array of entries but got: ' + JSON.stringify(data));
    }

    data.forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `
       <strong>${new Date(entry.entry_date).toLocaleString()}</strong>
| Pain: ${entry.pain_level}/10 | Location: ${entry.pain_location}<br />
        <em>Symptoms:</em> ${entry.symptoms}<br />
        <em>Notes:</em> ${entry.notes}<br />
        ${entry.photo_url ? `<img src="${entry.photo_url}" alt="Journal Photo" style="max-width:200px;display:block;margin:10px 0;">` : ''}
        <button class="edit-btn" onclick="editEntry(${entry.id})">Edit</button>
        <button class="delete-btn" onclick="deleteEntry(${entry.id})">Delete</button>
        <hr />
      `;
      journalList.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load entries:', err);
    journalList.innerHTML = '<li style="color:red;">Failed to load entries</li>';
  }
}

// Elderly-friendly chart
async function renderPainTrendChart() {
  const res = await fetch('/health-journal/entries', {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  const entries = await res.json();

  if (!Array.isArray(entries)) {
    console.error('Expected array of entries, got:', entries);
    return;
  }

  // Sort by date ascending
  entries.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));

  // Format dates for readability (e.g., "Aug 2, 2025 14:00")
  const labels = entries.map(e => {
    const d = new Date(e.entry_date);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  });
  const painLevels = entries.map(e => e.pain_level);

  const ctx = document.getElementById('painTrendChart').getContext('2d');
  if (window.painTrendChartInstance) window.painTrendChartInstance.destroy();
  window.painTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Pain Level (0–10)',
        data: painLevels,
        borderColor: '#e53935',
        backgroundColor: 'rgba(229,57,53,0.15)',
        tension: 0.1,
        fill: true,
        pointRadius: 8, // Larger points
        pointHoverRadius: 12,
        pointBackgroundColor: '#e53935',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        borderWidth: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 18, weight: 'bold' },
            color: '#222'
          }
        },
        title: {
          display: true,
          text: 'Pain Level Trend (Higher = More Pain)',
          font: { size: 22, weight: 'bold' },
          color: '#4a2a7d',
          padding: { top: 10, bottom: 10 }
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#fff',
          titleColor: '#e53935',
          bodyColor: '#222',
          borderColor: '#e53935',
          borderWidth: 2,
          titleFont: { size: 18, weight: 'bold' },
          bodyFont: { size: 16 }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          title: {
            display: false // Hide the y-axis title
          },
          ticks: {
            stepSize: 1,
            font: { size: 16, weight: 'bold' },
            color: '#222'
          },
          grid: {
            color: '#bdbdbd',
            lineWidth: 1
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date & Time',
            font: { size: 18, weight: 'bold' },
            color: '#4a2a7d'
          },
          ticks: {
            font: { size: 14, weight: 'bold' },
            color: '#222',
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          },
          grid: {
            color: '#e0e0e0',
            lineWidth: 1
          }
        }
      }
    }
  });
}

// Call this after page load or after entries are updated
renderPainTrendChart();

async function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    await loadEntries();
    await renderPainTrendChart(); // Chart updates after delete
  } catch (err) {
    alert('Failed to delete entry.');
    console.error(err);
  }
}

async function editEntry(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    const entry = await res.json();
    console.log('entry.entry_date:', entry.entry_date);
    console.log('toLocalDatetimeInputValue:', toLocalDatetimeInputValue(entry.entry_date));

    entryIdInput.value = entry.id;
    dateInput.value = toLocalDatetimeInputValue(entry.entry_date);

    levelInput.value = entry.pain_level;
    locationInput.value = entry.pain_location;
    symptomsInput.value = entry.symptoms;
    notesInput.value = entry.notes;

    // Clear photo input (file inputs can't be set programmatically for security)
    if (photoInput) photoInput.value = '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Failed to load entry.');
    console.error(err);
  }
}