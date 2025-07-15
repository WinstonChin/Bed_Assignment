const nameEl = document.getElementById('profile-name');
const emailEl = document.getElementById('profile-email');
const nameInput = document.getElementById('profile-name-input')
const emailInput = document.getElementById('profile-email-input')
const profileImg = document.getElementById('output_image');
const userId = localStorage.getItem("userId");
const token = localStorage.getItem('token');

if (!token) {
  alert("Please log in first");
  window.location.href = "login.html";
}



window.onload = fetchUser;

// 1. Load user info from DB
async function fetchUser() {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`);
    const user = await res.json();
    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    profileImg.src = user.profilePicUrl || "https://www.pngmart.com/files/23/Profile-PNG-Photo.png";
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
}

async function saveProfile() {
  const updatedName = nameInput.value.trim();
  const updatedEmail = emailInput.value.trim();

  try {
    await updateUser({ name: updatedName, email: updatedEmail });
    alert("Profile updated!");
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
}

// 2. Upload and update profile picture
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profilePicUrl: picUrl })
    });
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


// 3. Update user info -
async function updateUser(updateData) {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) throw new Error("Update failed");
    console.log("User updated");
  } catch (err) {
    console.error("Update error:", err);
    

  }
  
}

// 4. Delete user
async function deleteUser() {
  if (!confirm("Are you sure you want to delete your account?")) return;

  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Delete failed");

    alert("Account deleted");
    localStorage.clear();
    window.location.href = "signup.html"; 
  } catch (err) {
    console.error("Delete error:", err);
  }
}

//clears token from ls and logs out//
function logout() {
  localStorage.clear();  
  alert('Logging out');
  window.location.href = "login.html";  
}


// Load user info on page load
window.onload = fetchUser;
