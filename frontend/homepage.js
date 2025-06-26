import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCdjF5lNTTUuhexPNsdFFvMMhppEhI_sBw",
  authDomain: "krishna-temples.firebaseapp.com",
  projectId: "krishna-temples",
  storageBucket: "krishna-temples.firebasestorage.app",
  messagingSenderId: "305414827686",
  appId: "1:305414827686:web:96b6f3573ab90022514e67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Auth State Changed
onAuthStateChanged(auth, (user) => {
  const profileIcon = document.getElementById('user-profile-icon');

  if (user) {
    if (user.photoURL) {
      // Show photo
      const img = document.createElement('img');
      img.src = user.photoURL;
      img.alt = "Profile";
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.borderRadius = '50%';
      profileIcon.innerHTML = '';
      profileIcon.appendChild(img);
    } else {
      // Show initials fallback
      const displayName = user.displayName || "User";
      const initials = displayName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
      profileIcon.textContent = initials;
    }
  }
});

// Dropdown toggle
const profileIcon = document.getElementById('user-profile-icon');
const dropdownMenu = document.getElementById('dropdown-menu');

profileIcon.addEventListener('click', () => {
  dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Logout
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'Login.html';
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
});
function getBotResponse(input) {
  input = input.toLowerCase(); // Make input case-insensitive

  let response = "Sorry, I can only help with questions related to this site!";

  if (input.includes("hi") || input.includes("hello") || input.includes("hare krishna")) {
    response = "Hare Krishna! 🙏 How can I help you today?";
  } else if (input.includes("temple")) {
    response = "You can explore temples using the interactive map on the homepage.";
  } else if (input.includes("sloka") || input.includes("gita")) {
    response = "You can find Bhagavad Gita slokas on each temple's detail page.";
  } else if (input.includes("direction") || input.includes("gps") || input.includes("navigate")) {
    response = "Please enable GPS to get real-time directions to nearby Krishna temples.";
  }

  setTimeout(() => addMessage("bot", response), 500);
}

