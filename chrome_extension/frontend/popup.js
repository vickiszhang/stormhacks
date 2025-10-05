let jobData = null;
let selectedResume = null;
let tempSavedData = null; // Temporarily store data in case user is applying

// Initialize on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await checkJobPage();
});

async function checkJobPage() {
  const contentDiv = document.getElementById('main-content');
  contentDiv.innerHTML = '<div class="loading"><div class="loader"></div><div class="loading-text">Checking page...</div></div>';

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      contentDiv.innerHTML = `
        <div class="status-banner error">
          ⚠️ Timeout
        </div>
        <p style="text-align: center; color: #666; padding: 20px; font-size: 13px;">
          Unable to scan this page. Try refreshing or navigating to a job posting.
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <button id="retry-btn" style="padding: 12px 24px; background: #3CA2C8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🔄 Try Again
          </button>
        </div>
      `;
      document.getElementById('retry-btn')?.addEventListener('click', checkJobPage);
    }, 3000); // 3 second timeout

    chrome.tabs.sendMessage(tab.id, { type: 'CHECK_JOB_PAGE' }, async (response) => {
      clearTimeout(timeout);
      
      if (chrome.runtime.lastError) {
        contentDiv.innerHTML = `
          <div class="status-banner error">
            ⚠️ Error scanning page
          </div>
          <p style="text-align: center; color: #666; padding: 20px; font-size: 13px;">
            Please refresh the page and try again.
          </p>
        `;
        return;
      }

      if (!response || !response.isJobPage) {
        contentDiv.innerHTML = `
          <div class="status-banner not-job">
            Not a job posting
          </div>
          <p style="text-align: center; color: #666; padding: 20px; font-size: 13px; line-height: 1.6;">
            This doesn't appear to be a job application page.<br><br>
            Navigate to a job posting on sites like LinkedIn, Indeed, or company career pages to start tracking.
          </p>
        `;
        return;
      }

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
      ✅ Job posting detected!
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
      <button id="refresh-btn">🔄 Refresh</button>
      <button id="save-btn">💾 Save Application</button>
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
    messageArea.innerHTML = `<div class="error-message">❌ Error: ${error.message}</div>`;
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 Track Application';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
