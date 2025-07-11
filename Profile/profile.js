// Load user info from localStorage (set during login)
const nameEl = document.getElementById('profile-name');
const emailEl = document.getElementById('profile-email');
const profileImg = document.getElementById('output_image');

const userName = localStorage.getItem("userName");
const userEmail = localStorage.getItem("userEmail");
const userPic = localStorage.getItem("userProfilePic");

nameEl.textContent = userName || "Not set";
emailEl.textContent = userEmail || "Not set";
if (userPic) profileImg.src = userPic;

// Upload and preview profile picture
function preview_image(event) {
  const reader = new FileReader();
  reader.onload = function() {
    const result = reader.result;
    profileImg.src = result;
    localStorage.setItem("userProfilePic", result); // Save to localStorage
  }
  reader.readAsDataURL(event.target.files[0]);
}
