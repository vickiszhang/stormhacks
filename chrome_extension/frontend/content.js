/*
  Job Application Page Detector and Data Extractor
  Detects if the current page is a job application page and extracts:
  - Role (job title/position)
  - Company name
  - Job URL
*/

function isJobApplicationPage() {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  const bodyText = document.body.innerText.toLowerCase();
  
  // Exclude search pages and listings
  const excludePatterns = [
    /search/i, /results/i, /browse/i, /explore/i,
    /google\.com/i, /bing\.com/i, /yahoo\.com/i,
    /\/jobs$/i, // Just "/jobs" with nothing after
  ];
  
  // If URL matches exclusion patterns, it's not a job page
  if (excludePatterns.some(pattern => pattern.test(url))) {
    return false;
  }
  
  // Must have specific job URL patterns (more strict)
  const jobUrlPatterns = [
    /\/jobs?\/[a-zA-Z0-9]/i, // /jobs/ or /job/ followed by ID or slug
    /\/careers?\/[a-zA-Z0-9]/i, // /careers/ or /career/ followed by content
    /\/apply\//i, // /apply/ in URL
    /\/positions?\/[a-zA-Z0-9]/i, // /positions/ or /position/ with ID
    /\/opportunities\/[a-zA-Z0-9]/i, // /opportunities/ with ID
    /greenhouse\.io\/.*\/jobs\//i, // Greenhouse with job ID
    /lever\.co\/.*\/[a-f0-9-]{36}/i, // Lever with UUID
    /workday.*\/job\//i, // Workday job pages
    /myworkdayjobs\.com\/.*\/job\//i, // Workday job pages
    /linkedin\.com\/jobs\/view\//i, // LinkedIn specific job view
    /indeed\.com\/viewjob/i, // Indeed job view
    /glassdoor\.com\/job-listing/i, // Glassdoor job listing
  ];
  
  const hasJobUrl = jobUrlPatterns.some(pattern => pattern.test(url));
  
  // Only proceed if URL looks like a specific job page
  if (!hasJobUrl) {
    return false;
  }
  
  // Additional confirmation: check for job-specific content
  const hasJobTitle = !!(
    document.querySelector('h1') ||
    document.querySelector('[class*="job-title"]') ||
    document.querySelector('[class*="position-title"]')
  );
  
  const hasCompanyInfo = !!(
    document.querySelector('[class*="company"]') ||
    document.querySelector('[itemprop="hiringOrganization"]') ||
    document.querySelector('meta[property="og:site_name"]')
  );
  
  const hasApplyButton = !!(
    document.querySelector('button[class*="apply"]') ||
    document.querySelector('a[class*="apply"]') ||
    document.querySelector('[id*="apply"]') ||
    document.querySelector('input[type="submit"][value*="apply" i]')
  );
  
  // Must have at least job title + (company info OR apply button)
  return hasJobTitle && (hasCompanyInfo || hasApplyButton);
}

function extractJobData() {
  // Extract role/position
  let role = null;
  const h1 = document.querySelector('h1');
  if (h1) {
    role = h1.innerText.trim();
  }
  // Try meta tags
  if (!role) {
    role = document.querySelector('meta[property="og:title"]')?.content ||
              document.querySelector('meta[name="title"]')?.content;
  }
  // Try common job title selectors
  if (!role) {
    const jobTitleSelectors = [
      '[class*="job-title"]', '[class*="position-title"]', '[id*="job-title"]',
      '[class*="job-name"]', '[data-testid*="job-title"]'
    ];
    for (const selector of jobTitleSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        role = el.innerText.trim();
        break;
      }
    }
  }
  
  // Extract company name
  let company = null;
  const companySelectors = [
    '[class*="company-name"]', '[class*="employer-name"]', '[id*="company"]',
    '[data-testid*="company"]', 'meta[property="og:site_name"]', 
    '[class*="organization"]', '[itemprop="hiringOrganization"]'
  ];
  for (const selector of companySelectors) {
    const el = document.querySelector(selector);
    if (el) {
      company = el.tagName === 'META' ? el.content : el.innerText.trim();
      if (company) break;
    }
  }
  // Fallback to domain
  if (!company) {
    company = location.hostname.replace(/^www\./, '').split('.')[0];
  }
  
  return {
    isJobPage: true,
    role: role || 'Unknown Position',
    company: company || 'Unknown Company',
    url: window.location.href
  };
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req?.type === "CHECK_JOB_PAGE") {
    try {
      const isJob = isJobApplicationPage();
      if (isJob) {
        const jobData = extractJobData();
        sendResponse(jobData);
      } else {
        sendResponse({ isJobPage: false });
      }
    } catch (err) {
      sendResponse({ isJobPage: false, error: err?.message || String(err) });
    }
  }
  return true; // Required for async response
});

// Auto-detect and show notification when page loads
window.addEventListener('load', () => {
  // Wait a bit for the page to fully render
  setTimeout(() => {
    if (isJobApplicationPage()) {
      showJobDetectedNotification();
    }
  }, 1000);
});

function showJobDetectedNotification() {
  // Check if notification already exists
  if (document.getElementById('job-tracker-notification')) {
    return;
  }

  const notification = document.createElement('div');
  notification.id = 'job-tracker-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10559A 0%, #3CA2C8 100%);
      color: white;
      padding: 18px 22px;
      border-radius: 14px;
      box-shadow: 0 6px 24px rgba(16, 85, 154, 0.35);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Arial, sans-serif;
      min-width: 320px;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
      border: 3px solid #F9C6D7;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 26px;">🎯</span>
          <span style="font-weight: 700; font-size: 17px; letter-spacing: 0.3px;">Job Detected!</span>
        </div>
        <button id="job-tracker-close" style="
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 20px;
          line-height: 1;
          transition: all 0.2s;
          font-weight: bold;
        ">×</button>
      </div>
      <p style="margin: 0 0 14px 0; font-size: 13px; opacity: 0.95; line-height: 1.5; font-weight: 500;">
        Track this application with <strong>Beacon</strong>
      </p>
      <button id="job-tracker-action" style="
        background: #ffffff;
        color: #DB4C77;
        border: 2px solid #F9C6D7;
        padding: 10px 18px;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        font-size: 14px;
        transition: all 0.2s;
      ">
        📌 Track This Application
      </button>
    </div>
  `;

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    #job-tracker-action:hover {
      background: #f7b3cc !important;
      transform: translateY(-2px);
    }
    #job-tracker-close:hover {
      background: rgba(255, 255, 255, 0.3) !important;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Add event listeners
  document.getElementById('job-tracker-close').addEventListener('click', () => {
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  });

  document.getElementById('job-tracker-action').addEventListener('click', () => {
    // Send message to background to open popup by simulating icon click
    chrome.runtime.sendMessage({ type: 'OPEN_POPUP' }, (response) => {
      // Fallback: show message if popup can't be opened programmatically
      if (chrome.runtime.lastError) {
        alert('Please click the extension icon in your toolbar to track this application.');
      }
    });
    // Hide notification
    notification.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  });

  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (document.getElementById('job-tracker-notification')) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}