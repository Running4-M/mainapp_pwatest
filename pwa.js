console.log("pwa.js loaded!");

const SNOOZE_DAYS = 14;
const APP_BASE = "/mainapp_pwatest";

const isMobile = () => {
  const result = window.matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  console.log("isMobile:", result, window.innerWidth);
  return result;
};
const isIos = () => {
  const result = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  console.log("isIos:", result);
  return result;
};
const isStandalone = () => {
  const result = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  console.log("isStandalone:", result);
  return result;
};

let deferredPrompt = null;
const installSection = document.getElementById("pwa-install-section");
const installBtn = document.getElementById("pwa-install-btn");
const installInfo = document.getElementById("pwa-install-info");

function snoozed() {
  const at = localStorage.getItem("pwaInstallDismissedAt");
  const result = at && (Date.now() - Number(at) < SNOOZE_DAYS * 24 * 60 * 60 * 1000);
  console.log("snoozed:", result);
  return result;
}

function showInstallUI(msg) {
  console.log("showInstallUI called", { isMobile: isMobile(), isStandalone: isStandalone(), snoozed: snoozed() });
  if (!isMobile() || isStandalone() || snoozed()) return;
  if (!installSection) return;
  installSection.style.display = "block";
  if (installInfo && msg) installInfo.textContent = msg;
  console.log("Install UI shown");
}

function hideInstallUI() {
  if (!installSection) return;
  installSection.style.display = "none";
  console.log("Install UI hidden");
}

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt event fired");
  e.preventDefault();
  deferredPrompt = e;
  showInstallUI("Install this app to open full-screen.");
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    console.log("Install button clicked");
    if (!deferredPrompt) {
      if (isIos()) {
        showInstallUI("On iPhone/iPad: tap Share → Add to Home Screen");
      }
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    hideInstallUI();
    if (choice && choice.outcome === "dismissed") {
      localStorage.setItem("pwaInstallDismissedAt", Date.now().toString());
    }
    console.log("Install prompt outcome:", choice);
  });
}

window.addEventListener("load", () => {
  console.log("window load event");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(`${APP_BASE}/service-worker.js`)
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.warn("SW registration failed:", err));
  }

  if (isMobile() && isIos() && !isStandalone() && !snoozed()) {
    showInstallUI("On iPhone/iPad: Tap Share → Add to Home Screen to install.");
  }
});
