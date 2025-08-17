import { saveUserSettings, loadUserSettings } from './backend/firebase.js';
import { createFeedbackWidget } from './message.js';
console.log('[Sidebar_Chat.js] Loaded');
function createSidebar() {
  // State variables
  let feedbackWidget = null;
  let sidebarOpen = true;
  let settingsOpen = false;
  let activeSection = 'Calendar';

const navigationItems = [
  { name: 'Calendar', path: './Calendar/Calendar.html', icon: 'calendar' },
  { name: 'Just Chat', path: './Just_Chat/Just_Chat.html', icon: 'message-circle' },
  { name: 'Responses', path: './responses_centre/Responses.html', icon: 'activity' }, // updated
  { name: 'Doc Live', path: './DocLive/documentHub.html', icon: 'file' }, // updated
  { name: 'Help', path: '/help', icon: 'help-circle' },
  { name: 'Feedback', path: '#', icon: 'message-square' }, // Add this as the last item
];

  // Create SVG icons
  function createIcon(iconName, size = 20) {
    const icons = {
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

  // Create sidebar
function createSidebarElement() {
   console.log('[Sidebar] createSidebarElement called. sidebarOpen:', sidebarOpen);
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
     window.dispatchEvent(new CustomEvent('sidebarNavClose'));
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

    const button = document.createElement('button');
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
    userInfo.innerHTML = `
      <p style="font-weight: 500; margin: 0; font-size: 14px;">John Doe</p>
      <p style="font-size: 12px; color: rgb(148 163 184); margin: 0;">Pro Member</p>
    `;
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
    window.dispatchEvent(new CustomEvent('openSettingsModal'));
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
  `;

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
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px; color: white;">Bio</label>
              <input id="settingsBio" type="text" value="" style="width: 100%; padding: 12px; background: rgba(71, 85, 105, 0.5); border: 1px solid rgba(100, 116, 139, 0.5); border-radius: 8px; color: white; font-size: 14px; box-sizing: border-box;">
            </div>
          </div>
        </div>

        <!-- Subscription Section -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <h3 style="font-size: 18px; font-weight: 500; display: flex; align-items: center; gap: 8px; margin: 0; color: white;">
            ${createIcon('credit-card', 20)}
            Subscription
          </h3>
          <div style="background: rgba(71, 85, 105, 0.3); border-radius: 8px; padding: 16px; border: 1px solid rgba(100, 116, 139, 0.5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-weight: 500; color: white;">Pro Plan</span>
              <span style="padding: 4px 8px; background: rgba(34, 197, 94, 0.2); color: rgb(74 222 128); border-radius: 9999px; font-size: 12px;">Active</span>
            </div>
            <p style="font-size: 14px; color: rgb(148 163 184); margin: 0;">$9.99/month • Renews Dec 15, 2024</p>
          </div>
        </div>

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
      </form>
    </div>
  `;

  // Load user settings from Firebase and set values
  loadUserSettings().then(data => {
    const settings = data || {};
    modalContent.querySelector('#settingsName').value = settings.name || '';
    modalContent.querySelector('#settingsBio').value = settings.bio || '';
    modalContent.querySelector('#settingsEmailNotif').checked = !!settings.emailNotifications;
    modalContent.querySelector('#settingsPushNotif').checked = !!settings.pushNotifications;
    modalContent.querySelector('#settingsSMSNotif').checked = !!settings.smsNotifications;
  });

  // Toggle switches
  modalContent.querySelectorAll('label').forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    const toggleBg = label.querySelector('.toggle-bg');
    const toggleDot = label.querySelector('.toggle-dot');
    function updateToggle() {
      if (!checkbox) return;
      if (checkbox.checked) {
        toggleBg.style.background = 'rgb(37 99 235)';
        toggleDot.style.transform = 'translateX(20px)';
      } else {
        toggleBg.style.background = 'rgb(100 116 139)';
        toggleDot.style.transform = 'translateX(0)';
      }
    }
    updateToggle();
    label.addEventListener('click', () => {
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        updateToggle();
      }
    });
  });

  // Save/cancel/close handlers
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
    const name = modalContent.querySelector('#settingsName').value.trim();
    const bio = modalContent.querySelector('#settingsBio').value.trim();
    const emailNotifications = modalContent.querySelector('#settingsEmailNotif').checked;
    const pushNotifications = modalContent.querySelector('#settingsPushNotif').checked;
    const smsNotifications = modalContent.querySelector('#settingsSMSNotif').checked;
    await saveUserSettings({ name, bio, emailNotifications, pushNotifications, smsNotifications });
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
    console.log('[Sidebar] render called. sidebarOpen:', sidebarOpen);
  container.innerHTML = '';
  container.appendChild(createSidebarElement());
    
    // Add mobile overlay
    if (window.innerWidth < 768 && sidebarOpen) {
      container.appendChild(createMobileOverlay());
    }
    
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

    show: () => {
      sidebarOpen = true;
      render();
    },
    hide: () => {
      sidebarOpen = false;
      render();
    },
    
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
    
    // Check if sidebar is open
    isOpen: () => sidebarOpen,
    
    // Open settings modal
    openSettings: () => {
      settingsOpen = true;
      render();
    },
    
    // Close settings modal
    closeSettings: () => {
      settingsOpen = false;
      render();
    }
  };

  // Initial render
  render();

  return sidebarAPI;
}

export { createSidebar };