chrome.runtime.onInstalled.addListener(() => {
  // Prompt user to enter API key on first install
  chrome.storage.sync.get(["geminiApiKey"], (res) => {
    if (!res.geminiApiKey) {
      chrome.tabs.create({url: "options.html"});
    }
  });
  
  console.log("Job Application Tracker installed successfully!");
});