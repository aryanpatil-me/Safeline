
// Firebase v10+ modular SDK from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase, ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// 🔐 Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDrvmtKo-H8J8YoEr245ldtn23H0chmP6U",
  authDomain: "continue-8d736.firebaseapp.com",
  databaseURL: "https://continue-8d736-default-rtdb.firebaseio.com",
  projectId: "continue-8d736",
  storageBucket: "continue-8d736.appspot.com",   // ⚠️ fixed: use appspot.com not .app
  messagingSenderId: "339897273702",
  appId: "1:339897273702:web:3f014dab3dbbfd209a8ca7",
  measurementId: "G-N9PGLGHLSJ"
};

// Init Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Grab form + button
const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const contacts = getEmergencyContactsData();
  const terms = document.getElementById("terms").checked;

  if (!terms) {
    alert("❌ You must accept the terms and conditions.");
    submitBtn.disabled = false;
    return;
  }

  try {
    // 1) Create Auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 2) Optional: update displayName
    await updateProfile(cred.user, { displayName: name });

    // 3) Save profile in Realtime DB
    const uid = cred.user.uid;
    await set(ref(db, "users/" + uid), {
      uid: uid,
      name: name,
      email: email,
      contacts: contacts,
      termsAccepted: terms,
      createdAt: serverTimestamp()
    });

    alert("✅ Account created successfully!");
    form.reset();

    // 4) Redirect to home.html
    window.location.href = "home.html";

  } catch (err) {
    const map = {
      "auth/email-already-in-use": "⚠️ Email already registered.",
      "auth/invalid-email": "⚠️ Invalid email address.",
      "auth/weak-password": "⚠️ Weak password (min 6 chars).",
      "auth/network-request-failed": "⚠️ Network error. Check internet."
    };
    alert(map[err.code] || ("Error: " + err.message));
  } finally {
    submitBtn.disabled = false;
  }
});

// ================== Utility: Emergency Contacts ==================
function getEmergencyContactsData() {
  const contacts = [];
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    const name = item.querySelector('input[name="contactName[]"]').value;
    const phone = item.querySelector('input[name="contactPhone[]"]').value;
    const relation = item.querySelector('select[name="contactRelation[]"]').value;
    if (name && phone && relation) {
      contacts.push({ name, phone, relation });
    }
  });
  return contacts;
}

