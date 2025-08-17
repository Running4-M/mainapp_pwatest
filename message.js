function createFeedbackWidget() {
  // Create the main container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 50;
  `;

  // State variables
  let feedbackOpen = false;
  let feedbackType = null;
  let showThankYou = false;

  const feedbackOptions = [
    { type: 'bug', label: 'Report Bug', color: 'bg-red-500 hover:bg-red-600', textColor: 'text-red-400' },
    { type: 'feedback', label: 'Give Feedback', color: 'bg-yellow-500 hover:bg-yellow-600', textColor: 'text-yellow-400' },
    { type: 'feature', label: 'Suggest Feature', color: 'bg-green-500 hover:bg-green-600', textColor: 'text-green-400' },
  ];

  const thankYouMessages = {
    bug: "Thank you! We will fix it right away.",
    feedback: "Thanks for your feedback!",
    feature: "Thank you for your suggestions! We will definitely take a look."
  };

  // Create floating button
  function createFloatingButton() {
    const button = document.createElement('button');
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;
    button.style.cssText = `
      width: 56px;
      height: 56px;
      background: rgb(37 99 235);
      color: white;
      border-radius: 50%;
      border: none;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgb(29 78 216)';
      button.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgb(37 99 235)';
      button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('click', () => {
      feedbackOpen = true;
      renderWidget();
    });

    return button;
  }

  // Create feedback panel
  function createFeedbackPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      background: rgba(30, 41, 59, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(71, 85, 105, 0.5);
      border-radius: 12px;
      padding: 16px;
      width: 320px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;

    if (!feedbackType && !showThankYou) {
      // Main menu
      panel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="font-size: 14px; font-weight: 500; color: white; margin: 0;">How can we help?</h3>
          <button id="closeBtn" style="color: rgb(148 163 184); background: none; border: none; cursor: pointer; padding: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${feedbackOptions.map(option => `
            <button class="feedback-option" data-type="${option.type}" style="
              width: 100%;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              border-radius: 8px;
              transition: all 0.2s;
              color: white;
              background: ${option.type === 'bug' ? 'rgb(239 68 68)' : option.type === 'feedback' ? 'rgb(234 179 8)' : 'rgb(34 197 94)'};
              border: none;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">
              ${option.type === 'bug' ? `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m8 2 1.88 1.88"/>
                  <path d="M14.12 3.88 16 2"/>
                  <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
                  <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
                  <path d="M12 20v-9"/>
                  <path d="M6.53 9C4.6 8.8 3 7.1 3 5"/>
                  <path d="M6 13H2"/>
                  <path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>
                  <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/>
                  <path d="M22 13h-4"/>
                  <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
                </svg>
              ` : option.type === 'feedback' ? `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              ` : `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
              `}
              ${option.label}
            </button>
          `).join('')}
        </div>
      `;

      // Add event listeners for options
      panel.querySelectorAll('.feedback-option').forEach(btn => {
        btn.addEventListener('mouseenter', (e) => {
          const type = e.target.getAttribute('data-type');
          if (type === 'bug') e.target.style.background = 'rgb(220 38 38)';
          else if (type === 'feedback') e.target.style.background = 'rgb(202 138 4)';
          else e.target.style.background = 'rgb(22 163 74)';
        });
        
        btn.addEventListener('mouseleave', (e) => {
          const type = e.target.getAttribute('data-type');
          if (type === 'bug') e.target.style.background = 'rgb(239 68 68)';
          else if (type === 'feedback') e.target.style.background = 'rgb(234 179 8)';
          else e.target.style.background = 'rgb(34 197 94)';
        });

        btn.addEventListener('click', (e) => {
          feedbackType = e.target.getAttribute('data-type');
          renderWidget();
        });
      });

    } else if (showThankYou) {
      // Thank you message
      panel.innerHTML = `
        <div style="text-align: center; padding: 16px 0;">
          <div style="
            width: 48px;
            height: 48px;
            margin: 0 auto 12px;
            border-radius: 50%;
            background: rgba(34, 197, 94, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(74 222 128)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p style="font-size: 14px; color: white; font-weight: 500; margin: 0 0 4px;">Thank you!</p>
          <p style="font-size: 12px; color: rgb(148 163 184); margin: 0;">${thankYouMessages[feedbackType]}</p>
        </div>
      `;
    } else {
      // Input form
      const option = feedbackOptions.find(opt => opt.type === feedbackType);
      panel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="backBtn" style="color: rgb(148 163 184); background: none; border: none; cursor: pointer; padding: 4px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
            <h3 style="font-size: 14px; font-weight: 500; color: ${option.type === 'bug' ? 'rgb(248 113 113)' : option.type === 'feedback' ? 'rgb(250 204 21)' : 'rgb(74 222 128)'}; margin: 0;">
              ${option.label}
            </h3>
          </div>
          <button id="closeBtn" style="color: rgb(148 163 184); background: none; border: none; cursor: pointer; padding: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 6-12 12"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <textarea 
            id="feedbackText" 
            placeholder="Tell us about your ${feedbackType}..."
            style="
              width: 100%;
              height: 80px;
              background: rgba(71, 85, 105, 0.5);
              border: 1px solid rgba(100, 116, 139, 0.5);
              border-radius: 8px;
              padding: 12px;
              font-size: 14px;
              color: white;
              resize: none;
              box-sizing: border-box;
              font-family: inherit;
            "
          ></textarea>
          <button 
            id="sendBtn" 
            disabled
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 12px;
              background: rgb(37 99 235);
              color: white;
              border-radius: 8px;
              transition: all 0.2s;
              border: none;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
              opacity: 0.5;
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/>
              <path d="M22 2 11 13"/>
            </svg>
            Send
          </button>
        </div>
      `;

      // Add event listeners for form
      const textarea = panel.querySelector('#feedbackText');
      const sendBtn = panel.querySelector('#sendBtn');
      
      textarea.addEventListener('input', () => {
        if (textarea.value.trim()) {
          sendBtn.disabled = false;
          sendBtn.style.opacity = '1';
          sendBtn.style.cursor = 'pointer';
        } else {
          sendBtn.disabled = true;
          sendBtn.style.opacity = '0.5';
          sendBtn.style.cursor = 'not-allowed';
        }
      });

      sendBtn.addEventListener('click', () => {
        if (textarea.value.trim()) {
          showThankYou = true;
          renderWidget();
          
          setTimeout(() => {
            showThankYou = false;
            feedbackType = null;
            feedbackOpen = false;
            renderWidget();
          }, 3000);
        }
      });

      panel.querySelector('#backBtn').addEventListener('click', () => {
        feedbackType = null;
        renderWidget();
      });
    }

    // Close button functionality
    const closeBtn = panel.querySelector('#closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        feedbackOpen = false;
        feedbackType = null;
        showThankYou = false;
        renderWidget();
      });
    }

    return panel;
  }

  // Render the widget based on current state
  function renderWidget() {
    container.innerHTML = '';
    
    if (!feedbackOpen) {
      container.appendChild(createFloatingButton());
    } else {
      container.appendChild(createFeedbackPanel());
    }
  }

  // Initial render
  renderWidget();

  // Return container to be appended to body
  return container;
}

export {createFeedbackWidget};