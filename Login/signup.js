import { db, auth, initializeFirebase } from "../backend/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
await initializeFirebase();

import { PLAN_LIMITS } from "../backend/planLimits.js";
console.log("everything is loaded, ready to go!");
// --- Popup helper ---
function showPopup(message, type = "success") {
  const popup = document.createElement("div");
  popup.className = `
    fixed top-6 right-6
    z-[11000] px-6 py-4 rounded-2xl shadow-2xl
    backdrop-blur-md bg-white/10 text-white
    max-w-xs text-center
    animate-fade-in-up
  `;
  popup.style.border = type === "error"
    ? "2px solid rgba(255,50,50,0.8)"
    : "2px solid rgba(50,255,100,0.8)";
  popup.innerHTML = `<div class="text-2xl mb-2">${type === "error" ? "❌" : "✅"}</div>
    <div class="text-sm">${message}</div>`;
  document.body.append(popup);
  setTimeout(() => popup.remove(), 2000);
}

// --- Error messages ---
function displayError(errorCode) {
  const errorMessages = {
    "auth/email-already-in-use": "This email is already in use. Please log in instead.",
    "auth/invalid-email": "Invalid email format. Please provide a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters long.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
  };
  return errorMessages[errorCode] || "An error occurred. Please try again.";
}


  // --- All DOM code inside here! ---

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const primaryBtn = document.getElementById('primaryBtn');
  const backBtn = document.getElementById('backBtn');
  const toggleBtn = document.getElementById('toggleBtn');
  const googleBtn = document.getElementById('googleBtn');
  const googleBtnText = document.getElementById('googleBtnText');
  const cardTitle = document.getElementById('cardTitle');
  const cardDescription = document.getElementById('cardDescription');
  const toggleText = document.getElementById('toggleText');

  let isSignUp = true;
  let currentStep = 1;
  let userCredential = null;

  // --- UI State ---
  function updateUI() {
    if (isSignUp) {
      if (currentStep === 1) {
        cardTitle.textContent = 'Hello, New Friend! 👋';
        cardDescription.textContent = "Let's get you started on your journey";
        primaryBtn.textContent = 'Continue';
        googleBtnText.textContent = 'Sign up with Google';
        toggleText.textContent = 'Already have an account?';
        toggleBtn.textContent = 'Sign in';
        step1.classList.remove('hidden');
        step2.classList.add('hidden');
        backBtn.classList.add('hidden');
        googleBtn.classList.remove('hidden');
      } else {
        cardTitle.textContent = 'Tell Us About You';
        cardDescription.textContent = 'Just a few more details to complete your profile';
        primaryBtn.textContent = 'Create Account';
        googleBtn.classList.add('hidden');
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        backBtn.classList.remove('hidden');
      }
    } else {
      cardTitle.textContent = 'Welcome Back! 🎉';
      cardDescription.textContent = 'Great to see you again!';
      primaryBtn.textContent = 'Sign In';
      googleBtnText.textContent = 'Sign in with Google';
      toggleText.textContent = "Don't have an account?";
      toggleBtn.textContent = 'Sign up';
      step1.classList.remove('hidden');
      step2.classList.add('hidden');
      backBtn.classList.add('hidden');
      googleBtn.classList.remove('hidden');
    }
    validateForm();
  }

  // --- Validation ---
  function validateForm() {
    let isValid = false;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    if (isSignUp && currentStep === 1) {
      isValid = email !== '' && password !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    } else if (isSignUp && currentStep === 2) {
      isValid = fullName !== '';
    } else if (!isSignUp) {
      isValid = email !== '' && password !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    primaryBtn.disabled = !isValid;
    return isValid;
  }

  const selectedPlan = localStorage.getItem('selectedPlan') || "free";

  // --- Auth Actions ---
primaryBtn.onclick = async () => {
  if (!validateForm()) return;
  primaryBtn.disabled = true;
  if (isSignUp) {
    if (currentStep === 1) {
      currentStep = 2;
      updateUI();
      primaryBtn.disabled = false;
      return;
    } else {
      document.getElementById('loaderOverlay').style.display = 'flex';
      showPopup("Creating your account...", "success");
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const fullName = document.getElementById('fullName').value.trim();

      try {
        if (!userCredential) {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        }
        const user = userCredential.user;

        // --- Create Firestore user document ---
        const plan = selectedPlan || "free";
        const today = new Date().toISOString().slice(0, 10);
        const usage = {};
        Object.keys(PLAN_LIMITS[plan]).forEach(key => {
          if (typeof PLAN_LIMITS[plan][key] === 'number') usage[key] = 0;
        });
        usage.lastUsageReset = today;

        // Save main user doc
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          createdAt: new Date().toISOString(),
          plan: plan || "free"
        });

        // 2. Save all profile info in settings/profile
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await setDoc(doc(db, "users", user.uid, "settings", "profile"), {
          name: fullName,
          plan: plan || "free",
          planStartedAt: new Date().toISOString(),
          usage: usage,
          timezone: timezone,
          tutorialSeen: false
        });

        if (plan === "free") {
          // Hide loader, show gradient transition
          document.getElementById('loaderOverlay').style.display = 'none';
          const gradient = document.getElementById('gradientTransition');
          const bar = document.getElementById('gradientBar');
          gradient.style.display = 'block';
          bar.style.width = '0';
          setTimeout(() => {
            bar.style.width = '100vw';
          }, 50);
          setTimeout(() => {
            document.getElementById('transitionText').style.opacity = 1;
          }, 400);
          setTimeout(() => {
            window.location.href = "../Calendar/Calendar.html";
          }, 1800);
        } else {
          // Stripe Checkout for paid plans
          fetch('/api/createStripeSession', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan: plan,
              userId: user.uid,
              email: email
            })
          })
          .then(res => res.json())
          .then(data => {
            if (data.url) {
              window.location.href = data.url;
            } else {
              showPopup("Stripe session error: " + (data.error || "Unknown"), "error");
              document.getElementById('loaderOverlay').style.display = 'none';
              primaryBtn.disabled = false;
            }
          })
          .catch(err => {
            showPopup("Stripe session error: " + err.message, "error");
            document.getElementById('loaderOverlay').style.display = 'none';
            primaryBtn.disabled = false;
          });
          return; // Prevent further redirect
        }
      } catch (error) {
        document.getElementById('loaderOverlay').style.display = 'none';
        showPopup(displayError(error.code), "error");
        primaryBtn.disabled = false;
      }
    }
  } else {
    // Login
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      document.getElementById('loaderOverlay').style.display = 'flex';
      showPopup("Nice to see you again! Logging you in...");
      setTimeout(() => window.location.href = "../Calendar/Calendar.html", 1200);
    } catch (error) {
      showPopup(displayError(error.code), "error");
      primaryBtn.disabled = false;
    }
  }
};

  backBtn.onclick = () => {
    currentStep = 1;
    updateUI();
  };

  toggleBtn.onclick = () => {
    isSignUp = !isSignUp;
    currentStep = 1;
    userCredential = null;
    // Clear all fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('fullName').value = '';
    updateUI();
  };

  document.getElementById('email').oninput = validateForm;
  document.getElementById('password').oninput = validateForm;
  document.getElementById('fullName').oninput = validateForm;

  // Optional: Enter key submits
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !primaryBtn.disabled) {
      primaryBtn.click();
    }
  });

  // --- Redirect if already logged in ---
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setTimeout(() => {
        window.location.href = "../Calendar/Calendar.html";
      }, 300);
    }
  });

  // --- Google button (disabled for now) ---
  googleBtn.onclick = () => {
    showPopup("Google sign-in coming soon!", "error");
  };

  updateUI();
