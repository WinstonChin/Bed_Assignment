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


// Panic Button and Status Logic
document.addEventListener("DOMContentLoaded", () => {
  const panicBtn = document.getElementById("panic-button");
  if (panicBtn) {
    panicBtn.addEventListener("click", async () => {
      const name = "John Doe"; // Replace with dynamic name if available
      const location = "Unknown"; // Replace with geolocation if needed

      const response = await fetch("/api/panicButton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name, location })
      });

      const result = await response.json();
      alert(result.message || "Emergency triggered");

      loadEmergencyStatus();
    });

    loadEmergencyStatus();
  }
});

async function loadEmergencyStatus() {
  const res = await fetch(`/api/panicButton/${userId}`);
  const emergencies = await res.json();

  if (emergencies.length === 0) {
    document.getElementById("currentStatus").innerText = "None";
    return;
  }

  const latest = emergencies[emergencies.length - 1];
  window.latestEmergencyId = latest.EmergencyId;

  document.getElementById("currentStatus").innerText = latest.Status;
  document.getElementById("statusSelect").value = latest.Status;
}

async function updateEmergencyStatus() {
  if (!window.latestEmergencyId) {
    return alert("No emergency to update.");
  }

  const newStatus = document.getElementById("statusSelect").value;

  const response = await fetch(`/api/panicButton/${window.latestEmergencyId}`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, status: newStatus })
  });

  const result = await response.json();
  alert(result.message || "Status updated");
  loadEmergencyStatus();
}

window.onload = () => {
  loadEmergencyInfo();
  loadEmergencyStatus();
};
