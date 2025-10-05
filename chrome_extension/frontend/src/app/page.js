"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [jobData, setJobData] = useState({
    position: "",
    company: "",
    location: "",
    industry: "",
    skills: [],
    jobUrl: "",
    didSubmitCL: false
  });

  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    // TODO: Add Gemini API integration to scan current page
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //   // Use tabs[0].url to get current URL
    // });
    setIsScanning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Add API call to save application
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Job Application Tracker</h1>
      </header>

      <button 
        className={styles.scanButton}
        onClick={handleScan}
        disabled={isScanning}
      >
        {isScanning ? "Scanning..." : "Scan Job Page"}
      </button>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="position">Position</label>
          <input
            id="position"
            className={styles.input}
            value={jobData.position}
            onChange={(e) => setJobData({...jobData, position: e.target.value})}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="company">Company</label>
          <input
            id="company"
            className={styles.input}
            value={jobData.company}
            onChange={(e) => setJobData({...jobData, company: e.target.value})}
          />
        </div>

        <div className={styles.checkbox}>
          <input
            type="checkbox"
            id="coverLetter"
            checked={jobData.didSubmitCL}
            onChange={(e) => setJobData({...jobData, didSubmitCL: e.target.checked})}
          />
          <label htmlFor="coverLetter">Submitted Cover Letter</label>
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={!jobData.didSubmitCL}
        >
          Save Application
        </button>
      </form>
    </div>
  );
}