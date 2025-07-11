const userId = 1; // Replace with actual user ID from login session

async function submitEmergencyInfo() {
    const bloodType = document.getElementById('bloodType').value;
    const allergies = document.getElementById('allergies').value;
    const conditions = document.getElementById('medicalConditions').value;
    const contactName = document.getElementById('emergencyContactName').value;
    const contactPhone = document.getElementById('emergencyContactPhone').value;

    const response = await fetch('/api/emergency-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            bloodType,
            allergies,
            medicalConditions: conditions,
            emergencyContactName: contactName,
            emergencyContactPhone: contactPhone
        })
    });

    const data = await response.json();
    alert(data.message);
    loadEmergencyInfo(); // Refresh
}

async function loadEmergencyInfo() {
    const res = await fetch(`/api/emergency-info/${userId}`);
    const info = await res.json();

    document.getElementById('bloodType').value = info.BloodType || '';
    document.getElementById('allergies').value = info.Allergies || '';
    document.getElementById('medicalConditions').value = info.MedicalConditions || '';
    document.getElementById('emergencyContactName').value = info.EmergencyContactName || '';
    document.getElementById('emergencyContactPhone').value = info.EmergencyContactPhone || '';
}

window.onload = loadEmergencyInfo;
