// Add at the top of the file
window.tutorialTour = null;

const tour = new Shepherd.Tour({
  defaultStepOptions: {
    scrollTo: true,
    cancelIcon: { enabled: true },
    modalOverlayOpeningPadding: 5,
    classes: 'ai-tour-step'
  },
  useModalOverlay: true
});

// Store tour in global scope
window.tutorialTour = tour;

async function markTutorialSeen() {
  try {
    const { loadUserSettings, saveUserSettings } = await import("./backend/firebase.js");
    const settings = await loadUserSettings();
    await saveUserSettings({ ...settings, tutorialSeen: true });
  } catch (e) {
    // Ignore errors
  }
}

tour.on('cancel', () => {
  markTutorialSeen();
});

// Helper to wait for an element to appear in the DOM
function waitForElement(selector, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);
      if (Date.now() - start > timeout) return reject(new Error(`Timeout waiting for ${selector}`));
      requestAnimationFrame(check);
    };
    check();
  });
}

function getNextDayCellSelector() {
  const today = new Date();
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);
  const dateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
  return `[data-date="${dateStr}"]`;
}

// Step 1: Welcome screen
tour.addStep({
  id: 'welcome',
  text: `
    <div style="text-align:center;">
      <span style="font-size:2em;">🚀</span><br>
      <b>Welcome to AI Calendar!</b><br>
      <span style="color:#a78bfa;">It’s time to fuel the start, not just schedule.</span>
    </div>
  `,
  buttons: [
    {
      text: 'Let’s go!',
      action: () => tour.next(),
      classes: 'shepherd-button-primary'
    }
  ]
});

// Step 2: Click tomorrow’s cell
tour.addStep({
  id: 'click-tomorrow',
  text: `
    <b>Pick Tomorrow</b><br>
    Click on tomorrow’s cell to start planning your first event.
  `,
  attachTo: {
    element: getNextDayCellSelector(),
    on: 'bottom'
  },
  buttons: [],
  canClickTarget: true,
  advanceOn: {
    selector: getNextDayCellSelector(),
    event: 'click'
  },
  when: {
    show: () => waitForElement(getNextDayCellSelector()).catch(() => {})
  }
});

// Step 3: Highlight both Simple and Complex Task buttons
tour.addStep({
  id: 'task-type-buttons',
  text: `
    <b>Simple Task:</b> For basic reminders or straightforward tasks.<br>
    <b>Complex Task:</b> For creative help from AI (essays, posts, etc).<br>
    <span style="color:#a78bfa;">Choose what fits your need!</span>
  `,
  // Removed attachTo so nothing is highlighted
  buttons: [
    {
      text: 'Next',
      action: () => tour.next(),
      classes: 'shepherd-button-primary'
    }
  ],
  when: {
    show: async () => {
      await waitForElement('#simpleTaskBtn').catch(() => {});
      await waitForElement('#complexTaskBtn').catch(() => {});
    }
  }
});

// Step 4: Click Simple Task button
tour.addStep({
  id: 'click-simple-task',
  text: `
    <b>Start a Simple Task</b><br>
    Click here to begin a quick event.
  `,
  attachTo: {
    element: '#simpleTaskBtn',
    on: window.innerWidth < 768 ? 'top' : 'right'
  },
  buttons: [],
  canClickTarget: true,
  advanceOn: {
    selector: '#simpleTaskBtn',
    event: 'click'
  },
  when: {
    show: () => waitForElement('#simpleTaskBtn').catch(() => {})
  }
});

// Step 5: Type in Title field
tour.addStep({
  id: 'type-title',
  text: `
    <b>Event Title</b><br>
    Type something like: <span style="color:#a78bfa;">Welcome to AI Calendar</span>
  `,
  attachTo: { element: '#title', on: 'bottom' },
  buttons: [
    { text: 'Next', action: tour.next, classes: 'shepherd-button-primary', disabled: true }
  ],
  when: {
    show() {
      waitForElement('#title').then(input => {
        const nextBtn = this.el.querySelector('.shepherd-button-primary');   // use the *current* step element
        const update = () => { nextBtn.disabled = input.value.trim().length === 0; };
        update();                       // set initial state
        input.addEventListener('input', update, { once: false });
      });
    }
  }
});

// Step 6: Type in Description field
tour.addStep({
  id: 'type-description',
  text: `
    <b>Event Description</b><br>
    Suggestion: <span style="color:#a78bfa;">First time in AI Calendar — excited but confused.</span>
  `,
  attachTo: { element: '#description', on: 'bottom' },
  buttons: [
    { text: 'Next', action: tour.next, classes: 'shepherd-button-primary', disabled: true }
  ],
  when: {
    show() {
      waitForElement('#description').then(input => {
        const nextBtn = this.el.querySelector('.shepherd-button-primary');
        const update = () => { nextBtn.disabled = input.value.trim().length === 0; };
        update();
        input.addEventListener('input', update, { once: false });
      });
    }
  }
});

// Step 7: Toggle AI Assistance
tour.addStep({
  id: 'toggle-ai',
  text: `
    <b>Enable AI Assistance</b><br>
    Toggle this to let the AI help with your task.
  `,
  attachTo: {
    element: '.toggle-slider.ai-toggle',
    on: window.innerWidth < 768 ? 'top' : 'right'
  },
  buttons: [],
  canClickTarget: true,
  advanceOn: {
    selector: '.toggle-slider.ai-toggle',
    event: 'click'
  },
  when: {
    show: () => waitForElement('.toggle-slider.ai-toggle').catch(() => {})
  }
});

// Step 8: Click Save
tour.addStep({
  id: 'save-task',
  text: `
    <b>Save Your First Event</b><br>
    Click this to save and complete the tutorial!
  `,
  attachTo: {
    element: '#saveSimpleTaskBtn',
    on: window.innerWidth < 768 ? 'top' : 'bottom'
  },
  canClickTarget: true,
  when: {
    show: async () => {
      console.log('🎯 Tutorial Step 8 - Show handler starting');
      try {
        const saveBtn = await waitForElement('#saveSimpleTaskBtn');
        console.log('✅ Save button found:', saveBtn);
        
        // Remove overlay
        const overlay = document.querySelector('.shepherd-modal-overlay-container');
        if (overlay) {
          console.log('🎨 Found overlay, hiding it');
          overlay.style.display = 'none';
        } else {
          console.warn('⚠️ No overlay found to hide');
        }

        // Add special class and debug click handler
        saveBtn.classList.add('shepherd-highlight');
        saveBtn.addEventListener('click', () => {
          console.log('🖱️ Save button clicked in tutorial context');
        });
        
        console.log('✅ Step 8 show handler completed');
      } catch (error) {
        console.error('❌ Error in Step 8 show handler:', error);
      }
    },
    hide: () => {
      console.log('🔄 Tutorial Step 8 - Hide handler starting');
      try {
        const overlay = document.querySelector('.shepherd-modal-overlay-container');
        if (overlay) {
          console.log('🎨 Restoring overlay visibility');
          overlay.style.display = '';
        }

        const btn = document.querySelector('#saveSimpleTaskBtn');
        if (btn) {
          console.log('🎨 Removing highlight from save button');
          btn.classList.remove('shepherd-highlight');
        }
        console.log('✅ Step 8 hide handler completed');
      } catch (error) {
        console.error('❌ Error in Step 8 hide handler:', error);
      }
    }
  }
});




// Step 9: Show info only, then Next
tour.addStep({
  id: 'sidebar-info',
  text: `
    <b>Navigate to Responses</b><br>
    Let's check out your event's AI response!<br>
    <span style="color:#a78bfa;">First, open the sidebar and go to the Responses section.</span>
  `,
  buttons: [
    {
      text: 'Next',
      action: () => tour.next(),
      classes: 'shepherd-button-primary'
    }
  ]
});

// Step 10: Highlight hamburger icon (desktop or mobile)
tour.addStep({
  id: 'sidebar-hamburger',
  text: `
    <b>Open the Sidebar</b><br>
    Click the hamburger icon to expand the sidebar menu.
  `,
  attachTo: {
    element: window.innerWidth < 768
      ? '#mobileSidebarHamburger'
      : '#sidebarMenuButton',
    on: window.innerWidth < 768 ? 'bottom' : 'right'
  },
  classes: window.innerWidth < 768 ? 'mobile-narrow' : '',
  canClickTarget: true,
  advanceOn: {
    selector: window.innerWidth < 768
      ? '#mobileSidebarHamburger'
      : '#sidebarMenuButton',
    event: 'click'
  },
  when: {
    show: async () => {
      const selector = window.innerWidth < 768 ? '#mobileSidebarHamburger' : '#sidebarMenuButton';
      await waitForElement(selector).catch(() => {});
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.add('shepherd-highlight');
        btn.style.zIndex = '9999';
      }
    },
    hide: () => {
      const selector = window.innerWidth < 768 ? '#mobileSidebarHamburger' : '#sidebarMenuButton';
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.remove('shepherd-highlight');
        btn.style.zIndex = '';
      }
    }
  }
});

// Step 11: Go to Responses section in sidebar
tour.addStep({
  id: 'sidebar-responses',
  text: `
    <b>Go to Responses</b><br>
    Now, tap the <span style="color:#a78bfa;">Responses</span> section in the sidebar to view your event's AI-generated insights.
  `,
  ...(window.innerWidth < 768
    ? {
        // MOBILE: No attachTo, no overlay, custom class for side positioning
        classes: 'mobile-narrow sidebar-modal-side',
        modalOverlayOpeningPadding: 0,
        buttons: [],
        when: {
          show: async () => {
            // Hide Shepherd overlay manually (like step 8)
            const overlay = document.querySelector('.shepherd-modal-overlay-container');
            if (overlay) {
              console.log('[Step 11 Mobile] Hiding Shepherd overlay');
              overlay.style.display = 'none';
            } else {
              console.warn('[Step 11 Mobile] No Shepherd overlay found to hide');
            }
          },
          hide: () => {
            // Restore Shepherd overlay
            const overlay = document.querySelector('.shepherd-modal-overlay-container');
            if (overlay) {
              console.log('[Step 11 Mobile] Restoring Shepherd overlay');
              overlay.style.display = '';
            }
          }
        }
      }
    : {
        // DESKTOP: Keep original behavior
        attachTo: {
          element: '#sidebarResponsesBtn',
          on: 'right'
        },
        attachToOptions: {
          padding: 8
        },
        classes: '',
        canClickTarget: true,
        advanceOn: {
          selector: '#sidebarResponsesBtn',
          event: 'click'
        },
        when: {
          show: async () => {
            await waitForElement('#sidebarResponsesBtn');
            const btn = document.querySelector('#sidebarResponsesBtn');
            if (btn) {
              btn.classList.add('shepherd-highlight');
              btn.style.zIndex = '9999';
            }
          },
          hide: () => {
            const btn = document.querySelector('#sidebarResponsesBtn');
            if (btn) {
              btn.classList.remove('shepherd-highlight');
              btn.style.zIndex = '';
            }
          }
        }
      }
  )
});

// Step 12: Highlight upcoming responses section
tour.addStep({
  id: 'upcoming-responses',
  text: `
    <b>Upcoming Responses</b><br>
    Here you'll see your event for tomorrow.<br>
    <span style="color:#a78bfa;">Come back tomorrow to see your AI-generated response!</span>
  `,
  attachTo: {
    element: '#upcoming-events-container',
    on: 'bottom'
  },
  buttons: [
    {
      text: 'Next',
      action: () => tour.next(),
      classes: 'shepherd-button-primary'
    }
  ],
  when: {
    show: async () => {
      await waitForElement('#upcoming-events-container').catch(() => {});
      const upcoming = document.querySelector('#upcoming-events-container');
      if (upcoming) {
        upcoming.classList.add('shepherd-highlight');
        upcoming.style.zIndex = '9999';
      }
    },
    hide: () => {
      const upcoming = document.querySelector('#upcoming-events-container');
      if (upcoming) {
        upcoming.classList.remove('shepherd-highlight');
        upcoming.style.zIndex = '';
      }
    }
  }
});

// Step 13: Final message
tour.addStep({
  id: 'tutorial-finish',
  text: `
    <div style="text-align:center;">
      <span style="font-size:2em;">🎉</span><br>
      <b>Continue Exploring!</b><br>
      If you ever need help, visit the <span style="color:#a78bfa;">Help</span> section in the sidebar.<br>
      Have suggestions or spot a bug? Use the <span style="color:#a78bfa;">Feedback</span> button in the sidebar.<br>
      <span style="color:#a78bfa;">Enjoy AI Calendar!</span>
    </div>
  `,
  buttons: [
    {
      text: 'Finish',
  action: () => {
    markTutorialSeen();
    tour.complete();
  },
  classes: 'shepherd-button-primary'
}
  ]
});



