import { db } from "../backend/firebase.js"; // Firestore instance
import {
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { initializeFirebase } from "../backend/firebase.js";

let auth;

// Initialize Firebase
initializeFirebase()
  .then(() => {
    auth = getAuth();
    console.log("Firebase services are ready.");
  })
  .catch((error) => {
    console.error("Firebase initialization failed:", error);
    showPopup("Could not initialize Firebase.", null, "error");
  });

/**
 * showPopup
 * @param {string} message    The text to show
 * @param {string|null} redirectUrl  URL to go to after 2s (or null to stay)
 * @param {"success"|"error"} [type="success"]  Styling type
 */
function showPopup(message, redirectUrl = null, type = "success") {
  // Create overlay container
  const popup = document.createElement("div");
  popup.className = `
    fixed left-1/2 top-1/2 
    transform -translate-x-1/2 -translate-y-1/2
    z-50 px-6 py-4 rounded-2xl shadow-2xl
    backdrop-blur-md bg-white/10 text-white
    max-w-xs text-center
    animate-fade-in-up
  `;
  // Border color based on type
  popup.style.border = type === "error"
    ? "2px solid rgba(255,50,50,0.8)"
    : "2px solid rgba(50,255,100,0.8)";
  // Insert icon + message
  const icon = document.createElement("div");
  icon.innerHTML =
    type === "error" ? "❌" : "✅";
  icon.className = "text-2xl mb-2";
  popup.append(icon);

  const text = document.createElement("div");
  text.textContent = message;
  text.className = "text-sm";
  popup.append(text);

  document.body.append(popup);

  // After 2s, remove popup & maybe redirect
  setTimeout(() => {
    popup.remove();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, 2000);
}

// Map Firebase error codes to friendly messages
function displayError(errorCode) {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already in use. Please log in instead.",
    "auth/invalid-email": "Invalid email format. Please provide a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
  };
  return errorMessages[errorCode] || "An error occurred. Please try again. Your password may be incorrect.";
}

// SIGN UP
document.getElementById("signupButton").addEventListener("click", async () => {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  if (!email || !password) {
    showPopup("Please provide both email and password.", null, "error");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email,
    });

    // Show extra info form
    showPopup("Signup successful. Welcome!", null, "success");
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("extraInfoForm").classList.remove("hidden");

    // Save extra info
    document.getElementById("saveExtraInfoButton").onclick = async () => {
      const name = document.getElementById("extraName").value.trim();
      const bio = document.getElementById("extraBio").value.trim();
      try {
        // Save to Firestore under users/{uid}/settings
        await setDoc(doc(db, "users", user.uid, "settings", "profile"), {
          name,
          bio,
          updatedAt: new Date().toISOString()
        });
        window.location.href = "../Calendar/Calendar.html";
      } catch (err) {
        showPopup("Could not save extra info.", null, "error");
        window.location.href = "../Calendar/Calendar.html";
      }
    };
  } catch (error) {
    console.error("Error during signup:", error);
    showPopup(displayError(error.code), null, "error");
  }
});

// LOG IN
document.getElementById("loginButton").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if (!email || !password) {
    showPopup("Please provide both email and password.", null, "error");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showPopup("Login successful. Welcome back!", "../Calendar/Calendar.html", "success");
  } catch (error) {
    console.error("Error during login:", error);
    showPopup(displayError(error.code), null, "error");
  }
});

// TOGGLE FORMS
document.getElementById("showLogin").addEventListener("click", () => {
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
});
document.getElementById("showSignup").addEventListener("click", () => {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.remove("hidden");
});

// REDIRECT IF ALREADY LOGGED IN
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Slight delay so on-page popup (if any) can show
    setTimeout(() => {
      window.location.href = "../Calendar/Calendar.html";
    }, 300);
  }
});
