const API_URL = '/health-journal';
const form = document.getElementById('journal-form');
const journalList = document.getElementById('journal-list');

const entryIdInput = document.getElementById('entry-id');
const dateInput = document.getElementById('entry-date');
const levelInput = document.getElementById('pain-level');
const locationInput = document.getElementById('pain-location');
const symptomsInput = document.getElementById('symptoms');
const notesInput = document.getElementById('notes');

document.addEventListener('DOMContentLoaded', loadEntries);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    // Get input values
    const entryDate = dateInput.value;
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

    // Prepare entry data
    const entry = {
      entry_date: entryDate,
      pain_level: painLevelNum, // Use the validated number
      pain_location: painLocation || null, // Convert empty string to null
      symptoms: symptoms,
      notes: notes
    };

    // Determine if we're updating or creating
    const id = entryIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    // Send to server
    const response = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to save entry');
    }

    // Reset form on success
    form.reset();
    dateInput.valueAsDate = new Date(); // Reset to today's date
    entryIdInput.value = '';
    await loadEntries();
    alert('Entry saved successfully!');
    
  } catch (err) {
    console.error('Save error:', err);
    alert(err.message || 'Failed to save entry');
  }
});

async function loadEntries() {
  journalList.innerHTML = '';
  try {
    const res = await fetch('/health-journal');
    const data = await res.json();

    console.log('API response:', data); // 🔍 See what is returned

    if (!Array.isArray(data)) {
      throw new Error('Expected an array of entries but got: ' + JSON.stringify(data));
    }

    data.forEach((entry) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${new Date(entry.entry_date).toLocaleDateString()}</strong>
| Pain: ${entry.pain_level}/10 | Location: ${entry.pain_location}<br />
        <em>Symptoms:</em> ${entry.symptoms}<br />
        <em>Notes:</em> ${entry.notes}<br />
        <button onclick="editEntry(${entry.id})">Edit</button>
        <button onclick="deleteEntry(${entry.id})">Delete</button>
        <hr />
      `;
      journalList.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load entries:', err);
    journalList.innerHTML = '<li style="color:red;">Failed to load entries</li>';
  }
}


async function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    loadEntries();
  } catch (err) {
    alert('Failed to delete entry.');
    console.error(err);
  }
}

async function editEntry(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const entry = await res.json();

    entryIdInput.value = entry.id;
    dateInput.value = entry.entry_date;
    levelInput.value = entry.pain_level;
    locationInput.value = entry.pain_location;
    symptomsInput.value = entry.symptoms;
    notesInput.value = entry.notes;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Failed to load entry.');
    console.error(err);
  }
}
