// Simplified background script for faster loading
console.log("Job Application Tracker loaded!");

// Listen for messages to open popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'OPEN_POPUP') {
    // Show badge notification to attract attention
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#F9C6D7' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);
    sendResponse({ success: true });
  }
  return true;
});