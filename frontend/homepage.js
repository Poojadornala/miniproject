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

