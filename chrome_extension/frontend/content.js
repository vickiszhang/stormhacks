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
  
  // Check if on Beacon dashboard
  if (url.includes('localhost:3000') || url.includes('beacon-dashboard')) {
    return { isBeaconDashboard: true };
  }
  
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
    /sap\.com\/.*\/job-detail/i, // SAP careers pages
    /jobs\.sap\.com\//i, // SAP jobs site
    /careers\.sap\.com\//i, // SAP careers site
    /\/jobdetail\//i, // Generic job detail pages
    /\/job-detail\//i, // Generic job detail pages with hyphen
    /requisition.*id/i, // Pages with requisition IDs
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
    document.querySelector('[class*="position-title"]') ||
    document.querySelector('[class*="jobTitle"]') ||
    document.querySelector('[data-job-title]')
  );
  
  const hasCompanyInfo = !!(
    document.querySelector('[class*="company"]') ||
    document.querySelector('[itemprop="hiringOrganization"]') ||
    document.querySelector('meta[property="og:site_name"]') ||
    document.querySelector('[class*="employer"]')
  );
  
  const hasApplyButton = !!(
    document.querySelector('button[class*="apply"]') ||
    document.querySelector('a[class*="apply"]') ||
    document.querySelector('[id*="apply"]') ||
    document.querySelector('input[type="submit"][value*="apply" i]') ||
    document.querySelector('button:contains("Apply")') ||
    document.querySelector('a:contains("Apply")')
  );
  
  // Check for requisition ID (common in enterprise job postings)
  const hasRequisitionId = !!(
    bodyText.includes('requisition') ||
    bodyText.includes('req id') ||
    bodyText.includes('job id') ||
    document.querySelector('[class*="requisition"]') ||
    document.querySelector('[id*="requisition"]')
  );
  
  // Must have at least job title + (company info OR apply button OR requisition ID)
  return hasJobTitle && (hasCompanyInfo || hasApplyButton || hasRequisitionId);
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
    '[class*="organization"]', '[itemprop="hiringOrganization"]',
    '[class*="companyName"]', '[data-company]'
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
    const hostname = location.hostname.replace(/^www\./, '');
    // Special handling for common job sites
    if (hostname.includes('sap.com') || hostname.includes('jobs.sap')) {
      company = 'SAP';
    } else if (hostname.includes('greenhouse.io')) {
      // Extract company from greenhouse URL path
      const pathParts = location.pathname.split('/').filter(p => p);
      company = pathParts[0] || hostname.split('.')[0];
    } else if (hostname.includes('lever.co')) {
      // Extract company from lever URL
      const pathParts = location.pathname.split('/').filter(p => p);
      company = pathParts[0] || hostname.split('.')[0];
    } else {
      company = hostname.split('.')[0];
    }
    // Capitalize first letter
    if (company) {
      company = company.charAt(0).toUpperCase() + company.slice(1);
    }
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
      const result = isJobApplicationPage();
      
      // Check if on Beacon dashboard
      if (result?.isBeaconDashboard) {
        sendResponse({ 
          isJobPage: false, 
          isBeaconDashboard: true 
        });
        return true;
      }
      
      // Check if it's a job page
      if (result) {
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
    const result = isJobApplicationPage();
    // Only show notification if it's a job page (not Beacon dashboard)
    if (result && !result.isBeaconDashboard) {
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
      padding: 20px 24px;
      border-radius: 16px;
      box-shadow: 0 6px 24px rgba(16, 85, 154, 0.35);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Arial, sans-serif;
      min-width: 340px;
      max-width: 420px;
      animation: slideInRight 0.3s ease-out;
      border: 3px solid #F9C6D7;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="flex-shrink: 0;">
            <circle cx="12" cy="12" r="10" fill="white" opacity="0.9"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10559A"/>
          </svg>
          <span style="font-weight: 700; font-size: 18px; letter-spacing: 0.5px;">Job Detected!</span>
        </div>
        <button id="job-tracker-close" style="
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 22px;
          line-height: 1;
          transition: all 0.2s;
          font-weight: bold;
        ">×</button>
      </div>
      <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.95; line-height: 1.6; font-weight: 500;">
        Track this application with <strong style="font-weight: 700;">Beacon</strong> - your job application navigator
      </p>
      <button id="job-tracker-action" style="
        background: #ffffff;
        color: #DB4C77;
        border: 2px solid #F9C6D7;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        font-size: 14px;
        transition: all 0.2s;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        Track This Application
      </button>
    </div>
  `;

  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(420px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    #job-tracker-action:hover {
      background: #F9C6D7 !important;
      border-color: #DB4C77 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3);
    }
    #job-tracker-close:hover {
      background: rgba(255, 255, 255, 0.35) !important;
      transform: scale(1.1);
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