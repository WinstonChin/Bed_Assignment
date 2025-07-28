const nameEl = document.getElementById('profile-name');
const emailEl = document.getElementById('profile-email');
const nameInput = document.getElementById('profile-name-input');
const emailInput = document.getElementById('profile-email-input');
const profileImg = document.getElementById('output_image');
const dateInput = document.getElementById('profile-date-input');
const userId = localStorage.getItem("userId");
const token = localStorage.getItem('token');

if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}

// Show cached profile instantly
function showCachedProfile() {
  const cached = JSON.parse(localStorage.getItem('profile') || '{}');
  if (cached.name) nameInput.value = cached.name;
  if (cached.email) emailInput.value = cached.email;
  if (cached.dateOfBirth) dateInput.value = cached.dateOfBirth;
  if (cached.profilePicUrl) profileImg.src = cached.profilePicUrl;
}

// Load user info from DB
async function fetchUser() {
  showCachedProfile();
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    const user = await res.json();
    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    dateInput.value = user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "";
    profileImg.src = user.profilePicUrl || "https://www.pngmart.com/files/23/Profile-PNG-Photo.png";
    localStorage.setItem('profile', JSON.stringify({
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
      profilePicUrl: user.profilePicUrl
    }));
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
}

window.onload = fetchUser;

// Save profile info
async function saveProfile() {
  const updatedName = nameInput.value.trim();
  const updatedEmail = emailInput.value.trim();
  const updatedDateOfBirth = dateInput.value;

  try {
    await updateUser({
      name: updatedName,
      email: updatedEmail,
      dateOfBirth: updatedDateOfBirth
    });
    localStorage.setItem('profile', JSON.stringify({
      name: updatedName,
      email: updatedEmail,
      dateOfBirth: updatedDateOfBirth,
      profilePicUrl: profileImg.src
    }));
    alert("Profile updated!");
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
}

// Show profile picture input
function showProfilePicInput() {
  document.getElementById('profilePicInputWrapper').style.display = 'block';
}

// Save profile pic URL
async function saveProfilePicUrl() {
  const picUrl = document.getElementById('profilePicUrlInput').value.trim();
  if (!picUrl) return alert("Please enter a valid URL");

  profileImg.src = picUrl;

  try {
    await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ profilePicUrl: picUrl })
    });
    localStorage.setItem('profile', JSON.stringify({
      name: nameInput.value,
      email: emailInput.value,
      dateOfBirth: dateInput.value,
      profilePicUrl: picUrl
    }));
    alert("Profile picture updated!");
    document.getElementById('profilePicInputWrapper').style.display = 'none';
    document.getElementById('profilePicUrlInput').value = '';
  } catch (err) {
    console.error("Error saving profile pic:", err);
  }
}

function toggleEditPic() {
  const section = document.getElementById('editProfilePicSection');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// Update user info
async function updateUser(updateData) {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) throw new Error("Update failed");
    console.log("User updated");
  } catch (err) {
    console.error("Update error:", err);
  }
}

// Delete user
async function deleteUser() {
  if (!confirm("Are you sure you want to delete your account?")) return;

  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Delete failed");

    alert("Account deleted");
    localStorage.clear();
    window.location.href = "signup.html";
  } catch (err) {
    console.error("Delete error:", err);
  }
}

function logout() {
  alert("Logging out...");
  localStorage.clear();
  window.location.href = "login.html";
}

document.getElementById('logout-btn').addEventListener('click', logout);
