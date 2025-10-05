let jobData = null;
let selectedResume = null;
let tempSavedData = null; // Temporarily store data in case user is applying

// Initialize on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await checkJobPage();
});

async function checkJobPage() {
  const contentDiv = document.getElementById('main-content');
  const header = document.querySelector('.header');
  
  contentDiv.innerHTML = '<div class="loading"><div class="loader"></div><div class="loading-text">Checking page...</div></div>';

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      // Set header to pink (not detected)
      header.classList.remove('blue');
      header.classList.add('pink');
      
      contentDiv.innerHTML = `
        <div class="status-banner error">
          Timeout
        </div>
        <p style="text-align: center; color: #666; padding: 20px; font-size: 13px;">
          Unable to scan this page. Try refreshing or navigating to a job posting.
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <button class="retry-btn standalone-refresh-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Try Again
          </button>
        </div>
      `;
      document.querySelector('.retry-btn')?.addEventListener('click', checkJobPage);
    }, 3000); // 3 second timeout

    chrome.tabs.sendMessage(tab.id, { type: 'CHECK_JOB_PAGE' }, async (response) => {
      clearTimeout(timeout);
      
      if (chrome.runtime.lastError) {
        // Set header to pink (not detected/error)
        header.classList.remove('blue');
        header.classList.add('pink');
        
        contentDiv.innerHTML = `
          <div class="status-banner error">
            Error scanning page
          </div>
          <p style="text-align: center; color: #666; padding: 20px; font-size: 13px;">
            Please refresh the page and try again.
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <button class="retry-btn standalone-refresh-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Retry Scan
            </button>
          </div>
        `;
        document.querySelector('.retry-btn')?.addEventListener('click', checkJobPage);
        return;
      }

      if (!response || !response.isJobPage) {
        // Check if we're on Beacon website
        if (response && response.isBeacon) {
          // Set header to special gradient (pink to blue)
          header.classList.remove('blue');
          header.classList.add('pink');
          
          contentDiv.innerHTML = `
            <div style="
              background: linear-gradient(135deg, #DB4C77 0%, #10559A 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              margin-bottom: 20px;
              box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3);
            ">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="margin: 0 auto 12px;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Welcome to Beacon!</h3>
              <p style="font-size: 14px; opacity: 0.95; line-height: 1.5;">
                You're currently on your Beacon dashboard. Navigate to a job posting to start tracking applications.
              </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
              <h4 style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 12px;">Quick Tips:</h4>
              <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px; color: #666;">
                <li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10559A" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Browse LinkedIn, Indeed, or company career pages
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10559A" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Beacon will auto-detect job postings
                </li>
                <li style="padding: 8px 0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10559A" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Click the Beacon icon to track your application
                </li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="https://localhost:3000/dashboard" target="_blank" style="
                display: inline-block;
                background: linear-gradient(135deg, #10559A 0%, #3CA2C8 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                transition: transform 0.2s;
              " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                View Dashboard
              </a>
            </div>
          `;
          return;
        }

        // Set header to pink (not a job page)
        header.classList.remove('blue');
        header.classList.add('pink');
        
        contentDiv.innerHTML = `
          <div class="status-banner not-job">
            Not a job posting
          </div>
          <p style="text-align: center; color: #666; padding: 20px; font-size: 13px; line-height: 1.6;">
            This doesn't appear to be a job application page.<br><br>
            Navigate to a job posting on sites like LinkedIn, Indeed, or company career pages to start tracking.
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <button class="retry-btn standalone-refresh-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh Detection
            </button>
          </div>
        `;
        document.querySelector('.retry-btn')?.addEventListener('click', checkJobPage);
        return;
      }

      // Set header to blue (job detected!)
      header.classList.remove('pink');
      header.classList.add('blue');

      jobData = response;
      
      // Temporarily save extracted data (in case user is filling out application)
      tempSavedData = {
        role: jobData.role || '',
        company: jobData.company || '',
        jobURL: jobData.url || ''
      };
      
      // Prompt user to track this application
      renderPromptForm();
    });
  });
}

function renderPromptForm() {
  const contentDiv = document.getElementById('main-content');
  
  contentDiv.innerHTML = `
    <div class="status-banner job-detected">
      Job posting detected!
    </div>

    <div class="form-group">
      <label>Role/Position</label>
      <input type="text" id="role" value="${escapeHtml(tempSavedData.role)}" placeholder="e.g., Software Engineer" />
    </div>

    <div class="form-group">
      <label>Company</label>
      <input type="text" id="company" value="${escapeHtml(tempSavedData.company)}" placeholder="e.g., Google" />
    </div>

    <div class="form-group">
      <label>Job URL</label>
      <input type="text" id="job-url" value="${escapeHtml(tempSavedData.jobURL)}" placeholder="https://..." />
    </div>

    <div class="form-group">
      <label>Date Applied</label>
      <input type="date" id="date-applied" value="${new Date().toISOString().split('T')[0]}" />
      <p class="info-text">Leave as today or change if needed</p>
    </div>

    <div class="form-group">
      <label>Upload Resume (PDF)</label>
      <input type="file" id="resume-upload" accept=".pdf" />
      <p class="info-text">Optional - stored securely in AWS S3</p>
    </div>

    <div class="form-group">
      <div class="checkbox-group">
        <input type="checkbox" id="cover-letter" />
        <label for="cover-letter">I submitted a cover letter</label>
      </div>
    </div>

    <div class="form-group">
      <label>Notes (Optional)</label>
      <textarea id="notes" placeholder="Add any notes about this application..."></textarea>
    </div>

    <div class="button-group">
      <button id="refresh-btn">Refresh</button>
      <button id="save-btn">Save Application</button>
    </div>

    <div id="message-area"></div>
  `;

  // Add event listeners
  document.getElementById('resume-upload').addEventListener('change', (e) => {
    selectedResume = e.target.files[0];
  });

  document.getElementById('refresh-btn').addEventListener('click', () => {
    checkJobPage();
  });

  document.getElementById('save-btn').addEventListener('click', saveApplication);
}

async function saveApplication() {
  const saveBtn = document.getElementById('save-btn');
  const messageArea = document.getElementById('message-area');
  
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  messageArea.innerHTML = '';

  // Collect form data
  const formData = new FormData();
  formData.append('role', document.getElementById('role').value.trim());
  formData.append('company', document.getElementById('company').value.trim());
  formData.append('jobURL', document.getElementById('job-url').value.trim());
  
  const dateApplied = document.getElementById('date-applied').value;
  if (dateApplied) {
    formData.append('dateApplied', dateApplied);
  }
  
  formData.append('didCL', document.getElementById('cover-letter').checked);
  
  const notes = document.getElementById('notes').value.trim();
  if (notes) {
    formData.append('notes', notes);
  }
  
  if (selectedResume) {
    formData.append('resume', selectedResume);
  }

  try {
    const response = await fetch('http://localhost:3000/upload-job', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      messageArea.innerHTML = '<div class="success-message">✓ Application tracked successfully!</div>';
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      throw new Error(result.message || 'Failed to save application');
    }
  } catch (error) {
    console.error('Error saving application:', error);
    messageArea.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Track Application';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
