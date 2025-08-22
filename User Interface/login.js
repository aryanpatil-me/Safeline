// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrvmtKo-H8J8YoEr245ldtn23H0chmP6U",
  authDomain: "continue-8d736.firebaseapp.com",
  databaseURL: "https://continue-8d736-default-rtdb.firebaseio.com",
  projectId: "continue-8d736",
  storageBucket: "continue-8d736.appspot.com",
  messagingSenderId: "339897273702",
  appId: "1:339897273702:web:3f014dab3dbbfd209a8ca7",
  measurementId: "G-N9PGLGHLSJ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginBtn.disabled = true;

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Login successful!");
    window.location.href = "home.html";
  } catch (err) {
    const map = {
      "auth/user-not-found": "⚠️ No account found for this email.",
      "auth/wrong-password": "⚠️ Wrong password.",
      "auth/invalid-email": "⚠️ Invalid email."
    };
    alert(map[err.code] || err.message);
  } finally {
    loginBtn.disabled = false;
  }
});
