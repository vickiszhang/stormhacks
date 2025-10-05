chrome.runtime.onInstalled.addListener(() => {
  // Prompt user to enter API key on first install
  chrome.storage.sync.get(["geminiApiKey"], (res) => {
    if (!res.geminiApiKey) {
      chrome.tabs.create({url: "options.html"});
    }
  });
  
  console.log("Job Application Tracker installed successfully!");
});

// Listen for messages to open popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_POPUP') {
    // Open the popup by opening it in a new way - Chrome doesn't allow programmatic popup opening
    // Instead, we'll use chrome.action.openPopup() if available
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup()
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.log('Could not open popup programmatically:', error);
          // Fallback: show badge to attract attention
          chrome.action.setBadgeText({ text: '!' });
          chrome.action.setBadgeBackgroundColor({ color: '#F9C6D7' });
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
          }, 5000);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response
    } else {
      // Show badge notification as fallback
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#F9C6D7' });
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 5000);
      sendResponse({ success: false, message: 'Please click the extension icon' });
    }
  }
});