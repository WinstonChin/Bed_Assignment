const nameEl = document.getElementById('profile-name');
const emailEl = document.getElementById('profile-email');
const profileImg = document.getElementById('output_image');
const userId = localStorage.getItem("userId");

// 1. Load user info from DB
async function fetchUser() {
  try {
    const res = await fetch(`http://localhost:3000/api/users/${userId}`);
    const user = await res.json();

    nameEl.textContent = user.name || "Not set";
    emailEl.textContent = user.email || "Not set";
    profileImg.src = user.profilePicUrl || "default-pfp.png";
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
}

// 2. Upload and update profile picture
function preview_image(event) {
  const reader = new FileReader();
  reader.onload = async function () {
    const result = reader.result;
    profileImg.src = result;

    // Save to DB
    await updateUser({ profilePicUrl: result });
  };
  reader.readAsDataURL(event.target.files[0]);
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

// Load user info on page load
window.onload = fetchUser;
