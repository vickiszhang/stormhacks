let jobData = null;
let selectedResume = null;
let tempSavedData = null; // Temporarily store data in case user is applying

// Initialize on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await checkJobPage();
});

async function checkJobPage() {
  const contentDiv = document.getElementById('main-content');
  contentDiv.innerHTML = '<div class="loading"><div class="loader"></div><div class="loading-text">Checking if this is a job application...</div></div>';

  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: 'CHECK_JOB_PAGE' }, async (response) => {
      if (chrome.runtime.lastError) {
        contentDiv.innerHTML = `
          <div class="error-message">
            Error: Could not scan page. Please refresh and try again.
          </div>
        `;
        return;
      }

      if (!response || !response.isJobPage) {
        contentDiv.innerHTML = `
          <div class="status-banner not-job">
            ℹ️ Not a job application page
          </div>
          <p style="text-align: center; color: #666; padding: 20px;">
            Navigate to a job posting to track your application.
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
      Job application detected!
    </div>

    <p style="text-align: center; color: #666; margin: 15px 0; font-size: 13px;">
      We've detected you're viewing a job posting. Would you like to track this application?
    </p>

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
      <p class="info-text">Leave blank if you haven't applied yet</p>
    </div>

    <div class="form-group">
      <label>Upload Resume (PDF)</label>
      <input type="file" id="resume-upload" accept=".pdf" />
      <p class="info-text">Your resume will be stored securely in AWS S3</p>
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
      <button id="save-btn">💾 Track Application</button>
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
