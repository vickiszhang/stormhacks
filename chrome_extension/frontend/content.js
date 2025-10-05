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
  
  // Check URL patterns
  const jobUrlPatterns = [
    /jobs?/i, /careers?/i, /apply/i, /positions?/i, /opportunities/i,
    /greenhouse\.io/i, /lever\.co/i, /workday/i, /myworkdayjobs/i,
    /linkedin\.com\/jobs/i, /indeed\.com/i, /glassdoor/i, /monster\.com/i
  ];
  
  const hasJobUrl = jobUrlPatterns.some(pattern => pattern.test(url));
  
  // Check for job-related keywords in title and content
  const jobKeywords = ['apply', 'application', 'job', 'career', 'position', 'opening', 'hiring', 'employment'];
  const hasJobKeywords = jobKeywords.some(keyword => 
    title.includes(keyword) || bodyText.substring(0, 1000).includes(keyword)
  );
  
  // Check for common job application form elements
  const hasJobFormElements = !!(
    document.querySelector('input[type="file"]') || // Resume upload
    document.querySelector('textarea[placeholder*="experience"]') ||
    document.querySelector('input[placeholder*="resume"]') ||
    document.querySelector('[class*="job-apply"]') ||
    document.querySelector('[id*="job-application"]')
  );
  
  return hasJobUrl || (hasJobKeywords && hasJobFormElements);
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