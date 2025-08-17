import { saveUserSettings, loadUserSettings } from './backend/firebase.js';
import { createFeedbackWidget } from './message.js';
import { PLAN_LIMITS } from './backend/planLimits.js';
import { auth } from './backend/firebase.js';


if (!document.getElementById('plan-modal-styles')) {
  const style = document.createElement('style');
  style.id = 'plan-modal-styles';
  style.textContent = `
@keyframes gradient-wave-blue {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes gradient-wave-purple {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes gradient-wave-gold {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.pm-plan-card {
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(30,41,59,0.18);
  padding: 22px 20px 18px 20px;
  margin-bottom: 18px;
  color: #fff;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  cursor: pointer;
  border: none;
  background-size: 400% 400%;
  background-position: 0% 50%; /* Add this line */
}
.pm-plan-card.free {
  background: linear-gradient(120deg, #2563eb 0%, #38bdf8 40%, #60a5fa 80%, #2563eb 100%);
  animation: gradient-wave-blue 8s ease-in-out infinite;
}
.pm-plan-card.basic {
  background: linear-gradient(120deg, #a855f7 0%, #6366f1 40%, #7c3aed 80%, #a855f7 100%);
  animation: gradient-wave-purple 8s ease-in-out infinite;
}
.pm-plan-card.pro {
  background: linear-gradient(120deg, #fbbf24 0%, #f59e42 40%, #fcd34d 80%, #fbbf24 100%);
  animation: gradient-wave-gold 8s ease-in-out infinite;
  color: #2d1600;
}
.pm-plan-card:hover {
  box-shadow: 0 16px 48px 0 rgba(30,41,59,0.28);
  transform: translateY(-4px) scale(1.02);
}
.pm-plan-card .pm-plan-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pm-plan-card .pm-plan-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  background: rgba(255,255,255,0.85);
  color: #2563eb;
  margin-left: 10px;
}
.pm-plan-card.pro .pm-plan-badge { color: #b45309; }
.pm-plan-card .pm-plan-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.92);
  margin-bottom: 10px;
}
.pm-plan-card .pm-plan-usage {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.pm-plan-card .pm-usage-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  align-items: center;
  background: rgba(255,255,255,0.08);
  border-radius: 7px;
  padding: 5px 10px;
}
.pm-plan-card .pm-usage-row .pm-usage-label {
  color: #e0e7ef;
}
.pm-plan-card .pm-usage-row .pm-usage-val {
  font-weight: 700;
  color: #fff;
}
.pm-plan-card .pm-usage-row .pm-usage-exceeded {
  color: #ffb4b4;
  font-weight: 800;
  margin-left: 8px;
}
.pm-plan-card .pm-plan-btn {
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  background: linear-gradient(90deg,#38bdf8, #7c3aed);
  color: #071033;
  cursor: pointer;
  transition: none;
}
.pm-plan-card .pm-plan-btn:hover {
  /* No background change on hover */
  background: linear-gradient(90deg,#38bdf8, #7c3aed);
  color: #071033;
}
  `;
  document.head.appendChild(style);
}

function createSidebar() {
  // State variables
  let sidebarOpen = false;
  let settingsOpen = false;
  let feedbackWidget = null;
  let activeSection = '';


const navigationItems = [
  { name: 'Calendar', path: '/frontend/Calendar/Calendar.html', icon: 'calendar' },
  { name: 'Just Chat', path: '/frontend/Just_Chat/Just_Chat.html', icon: 'message-circle' },
  { name: 'Responses', path: '/frontend/responses_centre/Responses.html', icon: 'responses' },
  { name: 'Doc Live', path: '/frontend/DocLive/documentHub.html', icon: 'doclive' },
  { name: 'Help', path: '/frontend/help', icon: 'help' },
  { name: 'Feedback', path: '#', icon: 'message-square' }
];

// Automatically set activeSection based on current URL
const currentPath = window.location.pathname;
for (const item of navigationItems) {
  if (item.path && currentPath.endsWith(item.path.replace('./', ''))) {
    activeSection = item.name;
    break;
  }
}

  // Create SVG icons
  function createIcon(iconName, size = 20) {
    const icons = {
      'responses': `
  <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M8 8l-4 0 0-4M16 16l4 0 0 4" />
`,
  'doclive': `<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/><polyline points="4 7 4 3 20 3 20 21 4 21 4 17"/>`, // written document
  'help': `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="1.2"/>`,
'message-square': `<rect x="3" y="7" width="18" height="14" rx="2"/><polyline points="8 10 12 14 16 10"/>`,
      'file': `<rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/>`, // document icon
  'activity': `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`, // activity/ai
      'calendar': `<path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>`,
      'message-circle': `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
      'file-text': `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>`,
      'video': `<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`,
      'help-circle': `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><point cx="12" cy="17"/>`,
      'user': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
      'menu': `<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>`,
      'x': `<path d="m18 6-12 12"/><path d="m6 6 12 12"/>`,
      'chevron-right': `<path d="m9 18 6-6-6-6"/>`,
      'bell': `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
      'credit-card': `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`,
      'settings': `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`
    };
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[iconName] || ''}</svg>`;
  }

  // Create mobile overlay
  function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 40;
      display: ${sidebarOpen ? 'block' : 'none'};
    `;
    
    overlay.addEventListener('click', () => {
      sidebarOpen = false;
      render();
    });

    // Hide on desktop
    if (window.innerWidth >= 768) {
      overlay.style.display = 'none';
    }

    return overlay;
  }

window.addEventListener('openSettingsModal', () => {
  settingsOpen = true;
  render();
});


// Replace your createSidebarElement function with this:
function createSidebarElement() {
  // Keep this variable inside the closure so it resets on each render
  let feedbackFormOpen = false;
  if (typeof createSidebarElement._feedbackFormOpen === "undefined") {
    createSidebarElement._feedbackFormOpen = false;
  }
  feedbackFormOpen = createSidebarElement._feedbackFormOpen;

  const sidebar = document.createElement('div');
  sidebar.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(8px);
    border-right: 1px solid rgba(71, 85, 105, 0.5);
    transition: all 0.3s ease-in-out;
    z-index: 50;
    width: ${sidebarOpen ? '320px' : window.innerWidth < 768 ? '0' : '80px'};
    transform: ${sidebarOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)'};
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 16px;
    border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  `;

  const headerContent = document.createElement('div');
  headerContent.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  if (sidebarOpen) {
    const title = document.createElement('h2');
    title.textContent = 'Navigator';
    title.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      background: linear-gradient(to right, rgb(96 165 250), rgb(168 85 247));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    `;
    headerContent.appendChild(title);
  }

  const menuButton = document.createElement('button');
  menuButton.innerHTML = sidebarOpen ? createIcon('x', 20) : createIcon('menu', 24);
  menuButton.style.cssText = `
    padding: 8px;
    border-radius: 8px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  menuButton.id = 'sidebarMenuButton';
  menuButton.addEventListener('mouseenter', () => {
    menuButton.style.background = 'rgba(71, 85, 105, 0.5)';
  });
  menuButton.addEventListener('mouseleave', () => {
    menuButton.style.background = 'none';
  });
  menuButton.addEventListener('click', () => {
    // Toggle sidebar open/close
    sidebarOpen = !sidebarOpen;
    render();
  });

  headerContent.appendChild(menuButton);
  header.appendChild(headerContent);
  sidebar.appendChild(header);

  // Navigation
  const nav = document.createElement('nav');
nav.style.cssText = `
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
`;

navigationItems.forEach(item => {
  if (item.name === 'Feedback') return; // We'll handle Feedback separately
  // Only ONE button per item!
  const button = document.createElement('button');
  if (item.name === 'Responses') {
    button.id = 'sidebarResponsesBtn'; // <-- Set the id here
  }
  const isActive = activeSection === item.name;
    button.style.cssText = `
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      background: ${isActive ? 'linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(147, 51, 234, 0.2))' : 'none'};
      border: ${isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent'};
      color: ${isActive ? 'rgb(147 197 253)' : 'rgb(148 163 184)'};
      justify-content: center;
    `;

    const iconSize = !sidebarOpen && window.innerWidth >= 768 ? 28 : 20;
    button.innerHTML = createIcon(item.icon, iconSize);

    // Only show text if sidebar is open
    if (sidebarOpen) {
      button.innerHTML += `
        <span style="font-weight: 500; font-size: 14px;">${item.name}</span>
        <span style="margin-left: auto; opacity: 0.5;">${createIcon('chevron-right', 16)}</span>
      `;
      button.style.justifyContent = 'flex-start';
    }

    button.addEventListener('mouseenter', () => {
      if (!isActive) {
        button.style.background = 'rgba(71, 85, 105, 0.5)';
        button.style.color = 'white';
      }
    });

    button.addEventListener('mouseleave', () => {
      if (!isActive) {
        button.style.background = 'none';
        button.style.color = 'rgb(148 163 184)';
      }
    });

button.addEventListener('click', () => {
  activeSection = item.name;
  if (window.innerWidth < 768) {
    sidebarOpen = false;
  }
  render();
  // Actually navigate if path is an HTML file
  if (item.path && item.path.endsWith('.html')) {
    // Use window.location to go to the correct relative path
    window.location.href = item.path;
  } else {
    window.dispatchEvent(new CustomEvent('sidebarNavigation', { 
      detail: { section: item.name, path: item.path } 
    }));
  }
});

    nav.appendChild(button);
  });

  // --- Feedback Button (special styling) ---
  const feedbackBtn = document.createElement('button');
  feedbackBtn.style.cssText = `
    width: 100%;
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
    background: ${feedbackFormOpen ? 'linear-gradient(90deg, #2563eb 0%, #a855f7 100%)' : 'rgba(30, 41, 59, 0.7)'};
    border: 2px dashed rgba(59, 130, 246, 0.7);
    color: ${feedbackFormOpen ? 'white' : 'rgb(168 85 247)'};
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-start;
    box-shadow: ${feedbackFormOpen ? '0 4px 24px 0 rgba(59,130,246,0.15)' : 'none'};
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  `;
  feedbackBtn.innerHTML = `${createIcon('message-square', 20)} <span${sidebarOpen ? '' : ' style="display:none"'}>Feedback</span>`;

  feedbackBtn.addEventListener('click', () => {
    createSidebarElement._feedbackFormOpen = !createSidebarElement._feedbackFormOpen;
    render();
  });

  nav.appendChild(feedbackBtn);

  // --- Feedback Form (inline in sidebar, styled like message.js) ---
if (feedbackFormOpen && sidebarOpen) {
  nav.appendChild(createSidebarFeedbackForm());
}

  sidebar.appendChild(nav);

  // User Profile
  const userSection = document.createElement('div');
  userSection.style.cssText = `
    padding: 16px;
    border-top: 1px solid rgba(71, 85, 105, 0.5);
  `;

  const userButton = document.createElement('button');
  userButton.style.cssText = `
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    background: none;
    color: rgb(148 163 184);
    justify-content: ${!sidebarOpen && window.innerWidth >= 768 ? 'center' : 'flex-start'};
  `;

const avatarSize = !sidebarOpen && window.innerWidth >= 768 ? '40px' : '32px';
const avatar = document.createElement('div');
avatar.style.cssText = `
  width: ${avatarSize};
  height: ${avatarSize};
  min-width: ${avatarSize};
  min-height: ${avatarSize};
  max-width: ${avatarSize};
  max-height: ${avatarSize};
  border-radius: 50%;
  background: linear-gradient(to right, rgb(59 130 246), rgb(147 51 234));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  overflow: hidden;
`;
avatar.innerHTML = createIcon('user', !sidebarOpen && window.innerWidth >= 768 ? 20 : 16);

  userButton.appendChild(avatar);

  if (sidebarOpen) {
  const userInfo = document.createElement('div');
  userInfo.style.cssText = `
    flex: 1;
    text-align: left;
  `;
  // Async load user info
  loadUserSettings().then(settings => {
    const userName = settings?.name || '';
    const userPlan = PLAN_LIMITS[settings?.plan]?.planName || '';
    userInfo.innerHTML = `
      <p style="font-weight: 500; margin: 0; font-size: 14px;">${userName}</p>
      <p style="font-size: 12px; color: rgb(148 163 184); margin: 0;">${userPlan}</p>
    `;
  }).catch(() => {
    userInfo.innerHTML = `
      <p style="font-weight: 500; margin: 0; font-size: 14px;"></p>
      <p style="font-size: 12px; color: rgb(148 163 184); margin: 0;"></p>
    `;
  });
  userButton.appendChild(userInfo);
}

  userButton.addEventListener('mouseenter', () => {
    userButton.style.background = 'rgba(71, 85, 105, 0.5)';
    userButton.style.color = 'white';
  });

  userButton.addEventListener('mouseleave', () => {
    userButton.style.background = 'none';
    userButton.style.color = 'rgb(148 163 184)';
  });

userButton.addEventListener('click', () => {
  if (window.sidebar && typeof window.sidebar.openSettings === 'function') {
    window.sidebar.openSettings();
  }
});
  userSection.appendChild(userButton);
  sidebar.appendChild(userSection);

  return sidebar;
}

function createSidebarFeedbackForm() {
  const formContainer = document.createElement('div');
  formContainer.style.cssText = `
    background: #1e293b;
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeIn 0.2s;
  `;

  formContainer.innerHTML = `
    <label style="color: white; font-weight: 500; font-size: 14px;">Type</label>
    <select id="sidebarFeedbackType" style="padding: 8px; border-radius: 6px; border: 1px solid #64748b; background: #ef4444; color: #fff; font-weight: 600;">
      <option value="bug" style="background:#ef4444; color:#fff;">Report Bug</option>
      <option value="feedback" style="background:#2563eb; color:#fff;">General Feedback</option>
      <option value="feature" style="background:#a855f7; color:#fff;">Suggest Feature</option>
    </select>
    <label style="color: white; font-weight: 500; font-size: 14px;">Message</label>
    <textarea id="sidebarFeedbackText" rows="3" style="padding: 8px; border-radius: 6px; border: 1px solid #64748b; background: #1e293b; color: white; resize: vertical;"></textarea>
    <button id="sidebarFeedbackSend" style="background: rgb(37 99 235); color: white; border: none; border-radius: 8px; padding: 10px; font-weight: 600; cursor: pointer; margin-top: 4px;">
      Send Feedback
    </button>
    <div id="sidebarFeedbackMsg" style="color: rgb(34 197 94); font-size: 13px; margin-top: 4px; display: none;"></div>
  `;

  // Color the dropdown background based on selection
  const select = formContainer.querySelector('#sidebarFeedbackType');
  function updateSelectBg() {
    if (select.value === 'bug') {
      select.style.background = '#ef4444';
    } else if (select.value === 'feedback') {
      select.style.background = '#2563eb';
    } else if (select.value === 'feature') {
      select.style.background = '#a855f7';
    }
    select.style.color = '#fff';
  }
  select.addEventListener('change', updateSelectBg);
  updateSelectBg();

  formContainer.querySelector('#sidebarFeedbackSend').onclick = () => {
    const type = formContainer.querySelector('#sidebarFeedbackType').value;
    const text = formContainer.querySelector('#sidebarFeedbackText').value.trim();
    const msgDiv = formContainer.querySelector('#sidebarFeedbackMsg');
    if (!text) {
      msgDiv.style.display = 'block';
      msgDiv.style.color = 'rgb(239 68 68)';
      msgDiv.textContent = 'Please enter your feedback.';
      return;
    }
    // Here you can send feedback to your backend or Firestore
    msgDiv.style.display = 'block';
    msgDiv.style.color = 'rgb(34 197 94)';
    msgDiv.textContent = 'Thank you for your feedback!';
    formContainer.querySelector('#sidebarFeedbackText').value = '';
    setTimeout(() => {
      msgDiv.style.display = 'none';
    }, 2000);
  };

  return formContainer;
}

  // Create settings modal
function createSettingsModal() {
  if (!settingsOpen) return null;

  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 16px;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: rgb(30 41 59);
    border-radius: 12px;
    border: 1px solid rgba(71, 85, 105, 0.5);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  `;

  // Set modal content HTML first
  modalContent.innerHTML = `
    <div style="padding: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
        <h2 style="font-size: 20px; font-weight: 600; margin: 0; color: white;">Settings</h2>
        <button id="closeSettings" style="padding: 8px; border-radius: 8px; background: none; border: none; color: white; cursor: pointer; transition: background-color 0.2s;">
          ${createIcon('x', 20)}
        </button>
      </div>
      <form id="settingsForm" style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Profile Section -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
  <h3 style="font-size: 18px; font-weight: 500; display: flex; align-items: center; gap: 8px; margin: 0; color: white;">
    ${createIcon('user', 20)}
    Profile
  </h3>
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <div>
      <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px; color: white;">Name</label>
      <input id="settingsName" type="text" value="" style="width: 100%; padding: 12px; background: rgba(71, 85, 105, 0.5); border: 1px solid rgba(100, 116, 139, 0.5); border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
    </div>
  </div>
</div>
        <!-- Subscription Section -->
        <div id="planCardContainer"></div>

        <div id="planChooserContainer" style="display:none;"></div>
        <!-- Notifications Section -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <h3 style="font-size: 18px; font-weight: 500; display: flex; align-items: center; gap: 8px; margin: 0; color: white;">
            ${createIcon('bell', 20)}
            Notifications
          </h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: white;">Email Notifications</span>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer;">
                <input id="settingsEmailNotif" type="checkbox" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <div class="toggle-bg" style="width: 44px; height: 24px; background: rgb(100 116 139); border-radius: 12px; position: relative; transition: background-color 0.2s;">
                  <div class="toggle-dot" style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s;"></div>
                </div>
              </label>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: white;">Push Notifications</span>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer;">
                <input id="settingsPushNotif" type="checkbox" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <div class="toggle-bg" style="width: 44px; height: 24px; background: rgb(100 116 139); border-radius: 12px; position: relative; transition: background-color 0.2s;">
                  <div class="toggle-dot" style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s;"></div>
                </div>
              </label>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: white;">SMS Notifications</span>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer;">
                <input id="settingsSMSNotif" type="checkbox" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <div class="toggle-bg" style="width: 44px; height: 24px; background: rgb(100 116 139); border-radius: 12px; position: relative; transition: background-color 0.2s;">
                  <div class="toggle-dot" style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.2s;"></div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px; padding-top: 16px;">
          <button type="submit" style="flex: 1; background: rgb(37 99 235); color: white; padding: 12px; border-radius: 8px; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer;">
            Save Changes
          </button>
          <button id="cancelSettings" type="button" style="flex: 1; background: rgb(71 85 105); color: white; padding: 12px; border-radius: 8px; font-weight: 500; transition: background-color 0.2s; border: none; cursor: pointer;">
            Cancel
          </button>
        </div>
        <button id="logoutBtn" type="button" style="background: #ef4444; color: white; padding: 12px; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; margin-top: 18px;">
          Log Out
        </button>
      </form>
    </div>
  `;

  // Now add the loading overlay (AFTER setting innerHTML)
  const loadingOverlay = document.createElement('div');
  loadingOverlay.style.cssText = `
    position: absolute;
    inset: 0;
    background: rgba(30,41,59,0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: opacity 0.2s;
  `;
  loadingOverlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
      <div class="loader" style="border: 4px solid #64748b; border-top: 4px solid #38bdf8; border-radius: 50%; width: 38px; height: 38px; animation: spin 1s linear infinite;"></div>
      <span style="color:#dbeafe;font-size:15px;">Loading...</span>
    </div>
    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
    </style>
  `;
  modalContent.appendChild(loadingOverlay);

  // Show loader until data is fetched
  loadingOverlay.style.display = 'flex';

  // ...rest of your code for logoutBtn, loadUserSettings, etc...
  // (copy from your current function, but REMOVE the old loadingOverlay creation)

  // --- LOGOUT HANDLER ---
  const logoutBtn = modalContent.querySelector('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await auth.signOut();
      window.location.href = 'signup.html';
    });
  }

  // --- LOAD USER SETTINGS ---
   // --- LOAD USER SETTINGS ---
    loadUserSettings().then(data => {
    const settings = data || {};
    modalContent.querySelector('#settingsName').value = settings.name || '';
    modalContent.querySelector('#settingsEmailNotif').checked = !!settings.emailNotifications;
    modalContent.querySelector('#settingsPushNotif').checked = !!settings.pushNotifications;
    modalContent.querySelector('#settingsSMSNotif').checked = !!settings.smsNotifications;
  
      // --- Plan Card Rendering ---
      const planKey = settings.plan || 'free';
      const plan = PLAN_LIMITS[planKey] || PLAN_LIMITS.free;
      const planName = plan.planName || 'Free';
      const planCardContainer = modalContent.querySelector('#planCardContainer');
      const planClass = planKey === 'pro' ? 'pro' : planKey === 'basic' ? 'basic' : 'free';
  
      // Usage snapshot
      const usage = settings.usage || {};
      const keys = Object.keys(plan).filter(k => typeof plan[k] === 'number' && plan[k] > 0);
  const usageHtml = keys
    .map(k => {
      const used = (settings.usage && settings.usage[k]) || 0;
      const max = plan[k];
      return `
        <div class="pm-usage-row">
          <span class="pm-usage-label">${k.replace(/([A-Z])/g, ' $1').replace(/PerDay/g, ' / day').replace(/^./, s => s.toUpperCase())}</span>
          <span class="pm-usage-val">${used} / ${max}${used > max ? '<span class="pm-usage-exceeded">• Exceeded</span>' : ''}</span>
        </div>
      `;
    }).join('');
  
      planCardContainer.innerHTML = `
        <div class="pm-plan-card ${planClass}">
          <div class="pm-plan-title">
            ${planName}
            ${planKey !== 'free' ? `<span class="pm-plan-badge">Current</span>` : ''}
          </div>
          <div class="pm-plan-desc">Plan: ${planKey} • Click below to change</div>
          <div class="pm-plan-usage">${usageHtml}</div>
          <button id="changePlanBtn" class="pm-plan-btn" type="button">Upgrade / Change Plan</button>
        </div>
      `;
  
      // Plan change button
      planCardContainer.querySelector('#changePlanBtn').onclick = () => {
    console.log('Upgrade/Change Plan button clicked', settings);
    // Hide settings content, show plan chooser
    planCardContainer.style.display = 'none';
    const chooserContainer = modalContent.querySelector('#planChooserContainer');
    chooserContainer.style.display = '';
    renderPlanChooserInModal(settings, chooserContainer, planCardContainer);
  };
  
      // Hide loader
      loadingOverlay.style.opacity = '0';
      setTimeout(() => { loadingOverlay.style.display = 'none'; }, 200);
      updateAllToggleVisuals();
    }).catch(() => {
      loadingOverlay.innerHTML = `<span style="color:#f87171;">Failed to load settings.</span>`;
    });
  
  // Update toggle visuals
  function updateAllToggleVisuals() {
  modalContent.querySelectorAll('label').forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    const toggleBg = label.querySelector('.toggle-bg');
    const toggleDot = label.querySelector('.toggle-dot');

    // Only operate on toggle-style labels
    if (!checkbox || !toggleBg || !toggleDot) return;

    // update single toggle UI based on checkbox state
    const updateToggle = () => {
      if (checkbox.checked) {
        toggleBg.style.background = 'rgb(37 99 235)'; // on
        toggleDot.style.transform = 'translateX(20px)';
      } else {
        toggleBg.style.background = 'rgb(100 116 139)'; // off
        toggleDot.style.transform = 'translateX(0)';
      }
    };

    // initialize UI
    updateToggle();

    checkbox.addEventListener('change', updateToggle);
  });
}

  // --- Save/cancel/close handlers ---
  modalContent.querySelector('#closeSettings').addEventListener('click', () => {
    settingsOpen = false;
    render();
  });
  modalContent.querySelector('#cancelSettings').addEventListener('click', () => {
    settingsOpen = false;
    render();
  });

  modalContent.querySelector('#settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const prevSettings = await loadUserSettings();

  const name = modalContent.querySelector('#settingsName').value.trim();
  const emailNotifications = modalContent.querySelector('#settingsEmailNotif').checked;
  const pushNotifications = modalContent.querySelector('#settingsPushNotif').checked;
  const smsNotifications = modalContent.querySelector('#settingsSMSNotif').checked;

  // Update email in Firebase Auth if changed
  if (window.auth && window.auth.currentUser && email && email !== prevSettings.email) {
    try {
      await window.auth.currentUser.updateEmail(email);
    } catch (err) {
      alert('Failed to update email in authentication: ' + err.message);
      return;
    }
  }

await saveUserSettings({
  ...prevSettings,
  name,
  emailNotifications,
  pushNotifications,
  smsNotifications,
  plan: prevSettings.plan, // preserve plan
  timezone: prevSettings.timezone, // preserve timezone
  tutorialSeen: prevSettings.tutorialSeen // preserve tutorial seen
});

  settingsOpen = false;
  render();
});

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      settingsOpen = false;
      render();
    }
  });

  modal.appendChild(modalContent);
  return modal;
}

  // Create main container
  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    z-index: 10;
  `;

  // Render function
  function render() {
    container.innerHTML = '';
    
    // Add mobile overlay
    if (window.innerWidth < 768 && sidebarOpen) {
      container.appendChild(createMobileOverlay());
    }
    
    // Add sidebar
    container.appendChild(createSidebarElement());
    
    // Add settings modal
    const settingsModal = createSettingsModal();
    if (settingsModal) {
      container.appendChild(settingsModal);
    }
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    render();
  });

  // Public methods
  const sidebarAPI = {
    // Get the sidebar container
    getElement: () => container,
    // Get current active section
    getActiveSection: () => activeSection,
    // Set active section programmatically
    setActiveSection: (section) => {
      activeSection = section;
      render();
    },
    // Toggle sidebar open/close
    toggle: () => {
      sidebarOpen = !sidebarOpen;
      render();
    },
    isOpen: () => sidebarOpen,
    openSettings: () => {
      settingsOpen = true;
      render();
    },
    closeSettings: () => {
      settingsOpen = false;
      render();
    }
  };

  // Attach to window for global access
  window.sidebar = sidebarAPI;

  // Initial render
  render();

  return sidebarAPI;
}
const sidebar = createSidebar();
window.sidebar = sidebar; // Expose globally
export { createSidebar };

function renderPlanChooserInModal(settings, chooserContainer, planCardContainer) {
  chooserContainer.innerHTML = ''; // Clear previous

  // Add/ensure styles for grid and animation
  if (!document.getElementById('plan-chooser-modern-styles')) {
    const style = document.createElement('style');
    style.id = 'plan-chooser-modern-styles';
    style.textContent = `
.pm-plan-chooser-grid {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 24px;
}
.pm-plan-chooser-card {
  flex: 1 1 220px;
  min-width: 220px;
  max-width: 320px;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(30,41,59,0.18);
  color: #fff;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: none;
  background-size: 400% 400%;
  background-position: 0% 50%;
  transition: box-shadow 0.2s, transform 0.2s, max-height 0.3s cubic-bezier(.4,0,.2,1);
  margin-bottom: 0;
  margin-top: 0;
  margin-right: 0;
  margin-left: 0;
  padding: 0;
  min-height: 160px;
}
.pm-plan-chooser-card.free {
  background: linear-gradient(120deg, #2563eb 0%, #38bdf8 40%, #60a5fa 80%, #2563eb 100%);
  animation: gradient-wave-blue 8s ease-in-out infinite;
}
.pm-plan-chooser-card.basic {
  background: linear-gradient(120deg, #a855f7 0%, #6366f1 40%, #7c3aed 80%, #a855f7 100%);
  animation: gradient-wave-purple 8s ease-in-out infinite;
}
.pm-plan-chooser-card.pro {
  background: linear-gradient(120deg, #fbbf24 0%, #f59e42 40%, #fcd34d 80%, #fbbf24 100%);
  animation: gradient-wave-gold 8s ease-in-out infinite;
  color: #2d1600;
}
  .pm-plan-chooser-card.pro .pm-plan-details {
  background: linear-gradient(120deg, #fffbe6 60%, #fbbf24 100%);
  color: #2d1600;
}
.pm-plan-chooser-card.pro .pm-plan-details ul,
.pm-plan-chooser-card.pro .pm-plan-details li {
  color: #2d1600;
}
.pm-plan-chooser-card.selected {
  box-shadow: 0 16px 48px 0 rgba(30,41,59,0.28);
  transform: scale(1.04);
  z-index: 2;
}
.pm-plan-chooser-card .pm-plan-title {
  font-size: 22px;
  font-weight: 900;
  margin: 0;
  padding: 28px 24px 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.pm-plan-chooser-card .pm-plan-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  background: rgba(255,255,255,0.85);
  color: #2563eb;
  margin-left: 10px;
}
.pm-plan-chooser-card.pro .pm-plan-badge { color: #b45309; }
.pm-plan-chooser-card .pm-plan-price {
  font-size: 18px;
  font-weight: 700;
  margin: 8px 24px 0 24px;
  color: #fff;
}
.pm-plan-chooser-card.pro .pm-plan-price { color: #b45309; }
.pm-plan-chooser-card .pm-plan-summary {
  font-size: 15px;
  margin: 16px 24px 24px 24px;
  color: rgba(255,255,255,0.96);
}
.pm-plan-chooser-card .pm-plan-details {
  background: rgba(255,255,255,0.10);
  border-radius: 0 0 18px 18px;
  padding: 18px 24px 24px 24px;
  font-size: 15px;
  color: #fff;
  animation: fadeIn 0.3s;
}
.pm-plan-chooser-card .pm-plan-limits-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.pm-plan-chooser-card .pm-plan-limits-btn:hover {
  background: rgba(255,255,255,0.28);
}
.pm-plan-chooser-card .pm-plan-action-btn {
  margin-top: 18px;
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(90deg,#38bdf8, #7c3aed);
  color: #071033;
  cursor: pointer;
  transition: background 0.2s;
}
.pm-plan-chooser-card .pm-plan-action-btn:hover {
  /* Remove ugly hover effect, keep same as normal */
  background: inherit;
  color: inherit;
  filter: none;
  box-shadow: 0 2px 8px 0 rgba(30,41,59,0.08);
  transition: none;
  background: linear-gradient(90deg,#7c3aed, #38bdf8);
}
.pm-plan-chooser-card .pm-plan-back-btn {
  margin-top: 18px;
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 16px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
  .pm-plan-chooser-card.pro .pm-plan-back-btn,
.pm-plan-chooser-card.pro .pm-plan-limits-btn {
  background: #18181b !important;
  color: #fff !important;
  border: 1px solid #b45309 !important;
}
.pm-plan-chooser-card.pro .pm-plan-back-btn:hover,
.pm-plan-chooser-card.pro .pm-plan-limits-btn:hover {
  background: #27272a !important;
  color: #fff !important;
}
.pm-plan-chooser-card .pm-plan-back-btn:hover {
  background: rgba(255,255,255,0.28);
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
    .pm-benefit-badge {
  display: inline-block;
  background: #fff;
  color: #2563eb;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 700;
  margin: 0 4px 4px 0;
  box-shadow: 0 2px 8px 0 rgba(30,41,59,0.10);
  border: 1px solid #e0e7ef;
  text-shadow: 0 1px 2px rgba(30,41,59,0.08);
}
.pm-benefit-badge-pro {
  background: #23272f;
  color: #fbbf24;
  border: 1px solid #fbbf24;
  text-shadow: 0 1px 2px rgba(30,41,59,0.10);
}
.pm-benefit-badge-new {
  background: #e0f2fe;
  color: #2563eb;
  border: 1px solid #bae6fd;
}

    `;
    document.head.appendChild(style);
  }

  // User-friendly names for limits
const LIMIT_LABELS = {
  responsesGeneratedPerDay: "AI-enabled simple events per day",
  complexEventsPerDay: "Complex events per day",
  complexEventsWithAttachmentPerDay: "Complex events with attachments per day",
  justChatNanoPerDay: "Nano AI chat messages (GPT-4.1)",
  justChatMiniPerDay: "Mini AI chat messages (GPT-4.1 Mini)",
  justChatFullPerDay: "Full AI chat messages (GPT-4.1 Full)",
  justChatFileAndUrlPerDay: "Chat with files/links per day",
  justChatEventModePerDay: "Just Chat Event Mode per day",
  focusNanoPerDay: "Nano Focus sessions (GPT-4.1)",
  focusMiniPerDay: "Mini Focus sessions (GPT-4.1 Mini)",
  focusFullPerDay: "Full Focus sessions (GPT-4.1 Full)",
  focusFileAndUrlPerDay: "Focus with files/links per day",
  smartPlanContextAttachPerDay: "Attach context to plans per day",
  docLiveNanoPerDay: "Doc Live (GPT 4.1 Nano) per day",
  docLiveMiniPerDay: "Doc Live (GPT 4.1 Mini) per day",
  docLiveFullPerDay: "Doc Live (GPT 4.1 Full) per day",
  docFileAndUrlPerDay: "Doc Live with files/links per day",
  docContextAttachPerDay: "Attach context to Doc Live per day",
  docActionClickPerDay: "Doc Live action buttons, clicks per day",
  smartPlanGenPerDay: "Smart plan generations per day",
  smartPlanUpdatePerDay: "Smart plan updates per day",
};

  // Plan descriptions with benefit highlights
  const PLAN_DESCRIPTIONS = {
  free: {
    summary: "Perfect for getting started. Try out basic features and simple event planning.",
    details: `
      <div>
        <span class="pm-benefit-badge">Basic calendar & events</span>
        <span class="pm-benefit-badge">Nano AI chat</span>
        <span class="pm-benefit-badge">Doc Live (Nano)</span>
      </div>
      <ul style="margin:10px 0 0 18px;padding:0;">
        <li>Great for personal use and testing</li>
        <li>Upgrade to unlock file uploads, context, connect responses, and more AI power!</li>
      </ul>
    `
  },
  basic: {
    summary: "Unlock more productivity. More events, uploads, and smarter planning.",
    details: `
      <div>
        <span class="pm-benefit-badge pm-benefit-badge-new">File & image uploads</span>
        <span class="pm-benefit-badge pm-benefit-badge-new">Attach context</span>
        <span class="pm-benefit-badge">Just Chat Mini (GPT-4.1 Mini)</span>
        <span class="pm-benefit-badge">Focus Mini</span>
        <span class="pm-benefit-badge">More Doc Live</span>
        <span class="pm-benefit-badge pm-benefit-badge-new">Connect responses in Doc Live</span>
      </div>
      <ul style="margin:10px 0 0 18px;padding:0;">
        <li>All Free features, plus:</li>
        <li><b>Upload files, images, and use context in your plans</b></li>
        <li>Access smarter AI (GPT-4.1 Mini) for chat and focus</li>
        <li><b>Connect responses from the Response Centre in Doc Live for richer writing context</b></li>
        <li>Perfect for regular users and small teams</li>
      </ul>
    `
  },
  pro: {
    summary: "All features unlocked. Premium AI, all chat models, and maximum productivity.",
    details: `
      <div>
        <span class="pm-benefit-badge pm-benefit-badge-pro">GPT-4.1 Full access</span>
        <span class="pm-benefit-badge pm-benefit-badge-pro">Early access to new features</span>
        <span class="pm-benefit-badge pm-benefit-badge-pro">Priority support</span>
        <span class="pm-benefit-badge">All chat & focus models</span>
        <span class="pm-benefit-badge">Max uploads & Doc Live</span>
        <span class="pm-benefit-badge pm-benefit-badge-pro">Connect responses in Doc Live</span>
      </div>
      <ul style="margin:10px 0 0 18px;padding:0;">
        <li>Everything in Basic, plus:</li>
        <li><span class="pm-plan-highlight">Unlimited access to all chat models (including GPT-4.1 Full)</span></li>
        <li><span class="pm-plan-highlight">Early access to new features</span></li>
        <li><span class="pm-plan-highlight">Priority support</span></li>
        <li><b>Connect responses from the Response Centre in Doc Live for the ultimate writing experience</b></li>
        <li>Best for power users, professionals, and teams</li>
      </ul>
    `
  }
};

  // Limitation sections mapping
const LIMIT_SECTIONS = [
    {
      title: "Calendar",
      keys: [
        "responsesGeneratedPerDay",
        "complexEventsPerDay",
        "complexEventsWithAttachmentPerDay"
      ]
    },
    {
      title: "Responses",
      keys: [
        "smartPlanGenPerDay",
        "smartPlanUpdatePerDay"
      ]
    },
    {
      title: "Focus Mode",
      keys: [
        "focusNanoPerDay",
        "focusMiniPerDay",
        "focusFullPerDay",
        "focusFileAndUrlPerDay",
        "smartPlanContextAttachPerDay" // moved here as requested
      ]
    },
    {
      title: "Just Chat",
      keys: [
        "justChatNanoPerDay",
        "justChatMiniPerDay",
        "justChatFullPerDay",
        "justChatFileAndUrlPerDay",
        "justChatEventModePerDay" // added event mode here
      ]
    },
    {
      title: "Doc Live",
      keys: [
        "docLiveNanoPerDay",
        "docLiveMiniPerDay",
        "docLiveFullPerDay",
        "docFileAndUrlPerDay",
        "docContextAttachPerDay",
        "docActionClickPerDay"
      ]
    }
    // Removed Uploads section as requested
  ];

  // Header
  const header = document.createElement('div');
  header.style = "display:flex;align-items:center;justify-content:space-between;gap:12px;";
  header.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;">
      <button id="chooser-back" class="pm-back-btn" aria-label="Back" style="font-size:20px;background:none;border:none;cursor:pointer;">←</button>
      <div style="font-weight:900;font-size:20px;">Choose a Plan</div>
    </div>
    <div style="font-size:13px;color:#9fb0db;">Current: <b style="color:#fff;margin-left:6px;">${PLAN_LIMITS[settings.plan]?.planName || 'Free'}</b></div>
  `;
  chooserContainer.appendChild(header);

  // Plan grid
  const grid = document.createElement('div');
  grid.className = 'pm-plan-chooser-grid';

  let expanded = settings.plan || 'free'; // Start with current plan expanded
  let showLimits = {};

  Object.entries(PLAN_LIMITS).forEach(([planKey]) => {
    showLimits[planKey] = false;
  });

  function renderCards() {
    grid.innerHTML = '';
    Object.entries(PLAN_LIMITS).forEach(([planKey, plan]) => {
      const card = document.createElement('div');
      card.className = `pm-plan-chooser-card ${planKey} ${expanded === planKey ? 'selected' : ''}`;
      card.tabIndex = 0;
      card.dataset.plan = planKey;

      // Card content
      let cardContent = `
        <div class="pm-plan-title">
          ${plan.planName}
          ${planKey === settings.plan ? `<span class="pm-plan-badge">Current</span>` : ''}
        </div>
        <div class="pm-plan-price">${planKey === 'free' ? 'Free' : planKey === 'basic' ? '£6.99 / mo' : '£12.99 / mo'}</div>
        <div class="pm-plan-summary">${PLAN_DESCRIPTIONS[planKey].summary}</div>
        <div class="pm-plan-details" style="display:${expanded === planKey ? 'block' : 'none'};">
      `;

      // Expanded view
      if (expanded === planKey) {
        if (showLimits[planKey]) {
          // Show limitations view
          cardContent += renderLimits(planKey, plan, planKey === settings.plan ? (settings.usage || {}) : null);
          cardContent += `<button class="pm-plan-back-btn">Back</button>`;
        } else {
          // Show description view
          cardContent += PLAN_DESCRIPTIONS[planKey].details;
          cardContent += `<button class="pm-plan-limits-btn">View detailed limits</button>`;
          if (planKey === settings.plan) {
            cardContent += `<div style="margin-top:16px;font-weight:700;font-size:16px;color:#fff;text-align:center;">Current Plan</div>`;
          } else {
            cardContent += `<button class="pm-plan-action-btn">${planKey === 'free' ? 'Downgrade' : 'Upgrade'}</button>`;
          }
        }
        cardContent += `</div>`;
      } else {
        cardContent += `<div class="pm-plan-details" style="display:none;"></div>`;
      }

      card.innerHTML = cardContent;

      // Expand/collapse logic
      card.onclick = (e) => {
        // If clicking on current plan, close chooser
        if (planKey === settings.plan && expanded === planKey && !showLimits[planKey]) {
          chooserContainer.style.display = 'none';
          planCardContainer.style.display = '';
          return;
        }
        // Don't collapse if clicking the action/limits/back button
        if (
          e.target.classList.contains('pm-plan-action-btn') ||
          e.target.classList.contains('pm-plan-limits-btn') ||
          e.target.classList.contains('pm-plan-back-btn')
        ) return;
        if (expanded !== planKey || showLimits[planKey]) {
          expanded = planKey;
          Object.keys(showLimits).forEach(k => showLimits[k] = false);
          renderCards();
        }
      };

      // Limits button logic
      if (expanded === planKey && !showLimits[planKey]) {
        const limitsBtn = card.querySelector('.pm-plan-limits-btn');
        if (limitsBtn) {
          limitsBtn.onclick = (e) => {
            e.stopPropagation();
            showLimits[planKey] = true;
            renderCards();
          };
        }
      }

      // Back button logic (from limits view)
      if (expanded === planKey && showLimits[planKey]) {
        const backBtn = card.querySelector('.pm-plan-back-btn');
        if (backBtn) {
          backBtn.onclick = (e) => {
            e.stopPropagation();
            showLimits[planKey] = false;
            renderCards();
          };
        }
      }

      // Upgrade/downgrade button logic
      if (expanded === planKey && !showLimits[planKey] && planKey !== settings.plan) {
        const actionBtn = card.querySelector('.pm-plan-action-btn');
        if (actionBtn) {
          actionBtn.onclick = async (e) => {
            e.stopPropagation();
            if (!confirm(`Switch to ${plan.planName}?`)) return;
            settings.plan = planKey;
            settings.planStartedAt = new Date().toISOString();
            await saveUserSettings(settings);
            chooserContainer.style.display = 'none';
            planCardContainer.style.display = '';
            window.dispatchEvent(new CustomEvent('openSettingsModal'));
          };
        }
      }

      grid.appendChild(card);
    });
  }

  // Render limits with sections and (if current plan) usage
  function renderLimits(planKey, plan, usage) {
    let html = '';
    LIMIT_SECTIONS.forEach(section => {
      // Only show section if at least one key is present in plan and value > 0
      const sectionKeys = section.keys.filter(k => typeof plan[k] === 'number' && plan[k] > 0);
      if (sectionKeys.length === 0) return;
      html += `<div style="margin-bottom:12px;">
        <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:#fff;">${section.title}</div>
        <ul style="margin:0 0 0 18px;padding:0;">`;
      sectionKeys.forEach(k => {
        const val = plan[k];
        let usageStr = '';
        if (usage && typeof usage[k] === 'number') {
          usageStr = ` <span style="color:#a5b4fc;font-size:13px;">(used: ${usage[k]} / ${val})</span>`;
        }
        html += `<li>${LIMIT_LABELS[k] || k}: <b>${val}</b>${usageStr}</li>`;
      });
      html += `</ul></div>`;
    });
    return html;
  }

  renderCards();
  chooserContainer.appendChild(grid);

  // Back button logic
  header.querySelector('#chooser-back').onclick = () => {
    chooserContainer.style.display = 'none';
    planCardContainer.style.display = '';
  };
}

function openPlanChooser(settings) {
  console.log('openPlanChooser called with:', settings);
  if (document.querySelector('.pm-chooser')) return;
  const s = settings || {};
  const humanize = (key) =>
    key.replace(/([A-Z])/g, ' $1')
      .replace(/PerDay/g, ' / day')
      .replace(/([a-z])([0-9])/g, '$1 $2')
      .replace(/^./, s => s.toUpperCase());

  const backdrop = document.createElement('div');
  backdrop.className = 'pm-chooser';
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

  const inner = document.createElement('div');
  inner.className = 'pm-chooser-inner';
  inner.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <div style="display:flex;gap:12px;align-items:center;">
        <button id="chooser-back" class="pm-back-btn" aria-label="Back">←</button>
        <div style="font-weight:900;font-size:18px;">Choose a Plan</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;">
        <div style="font-size:13px;color:#9fb0db;">Current: <b style="color:#fff;margin-left:6px;">${PLAN_LIMITS[s.plan]?.planName || 'Free'}</b></div>
      </div>
    </div>
    <div style="margin-top:12px;color:#9fb0db;font-size:13px;">
      Choose a plan. Click a card to see details and upgrade/downgrade.
    </div>
    <div class="pm-plan-grid" id="pm-plan-grid"></div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px;">
      <button id="chooser-close" class="pm-back-btn">Close</button>
    </div>
  `;
  backdrop.appendChild(inner);
  document.body.appendChild(backdrop);

  inner.querySelector('#chooser-back').onclick = () => backdrop.remove();
  inner.querySelector('#chooser-close').onclick = () => backdrop.remove();

  // Render plan cards
  const grid = inner.querySelector('#pm-plan-grid');
  grid.innerHTML = '';
  console.log('PLAN_LIMITS:', PLAN_LIMITS);
  Object.entries(PLAN_LIMITS).forEach(([planKey, plan]) => {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.tabIndex = 0;
    card.dataset.plan = planKey;
    const price = planKey === 'free' ? 'Free' : planKey === 'basic' ? '£6.99 / mo' : '£12.99 / mo';
    const limitItems = Object.entries(plan).filter(([k,v]) => typeof v === 'number' && k !== 'planName' && v > 0);
    const shortList = limitItems.slice(0,6).map(([k,v]) => `<div>${humanize(k)}: <b>${v}</b></div>`).join('');
    card.innerHTML = `
      <div class="title">
        <div>${plan.planName}</div>
        <div>${planKey === s.plan ? '<span class="badge">Current</span>' : `<span style="font-size:13px;color:#cbd5e1">${price}</span>`}</div>
      </div>
      <div class="price">${planKey === s.plan ? 'Active plan' : price}</div>
      <div class="limits">${shortList}</div>
      <div class="action">
        <button class="btn ${planKey === s.plan ? 'ghost' : ''}" data-action="choose">${planKey === s.plan ? 'Selected' : 'Choose'}</button>
      </div>
    `;
    card.querySelector('[data-action="choose"]').onclick = async () => {
      if (planKey === s.plan) return;
      if (!confirm(`Switch to ${plan.planName}?`)) return;
      s.plan = planKey;
      s.planStartedAt = new Date().toISOString();
      await saveUserSettings(s);
      backdrop.remove();
      // Optionally, re-open settings modal to reflect change
      window.dispatchEvent(new CustomEvent('openSettingsModal'));
    };
    grid.appendChild(card);
  });
}