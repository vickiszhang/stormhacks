# 🎯 Quick Reference: When Does It Detect a Job?

## ✅ YES - These Are Detected:

```
✅ linkedin.com/jobs/view/123456
✅ indeed.com/viewjob?jk=abc123
✅ greenhouse.io/company/jobs/456789
✅ lever.co/stripe/uuid-here
✅ company.com/careers/software-engineer
✅ company.com/jobs/intern-2024
✅ workday.com/company/job/JR-12345
```

## ❌ NO - These Are NOT Detected:

```
❌ linkedin.com/jobs/search?q=engineer
❌ indeed.com/jobs?q=software
❌ google.com/search?q=internships
❌ company.com/jobs (no specific job)
❌ company.com/careers (listing page)
❌ bing.com/search?q=jobs
```

## 🔍 The 3 Rules:

1. **URL must have job ID** → `/jobs/[something]` or `/careers/[something]`
2. **Page must have job title** → H1 tag or job-title element
3. **Page must have company OR apply button** → Confirms it's a real job posting

## 🎨 What You See:

When all 3 rules pass:
```
┌─────────────────────────────────────┐
│ 🎯 Job Application Detected!        │
│                                     │
│ Role: Software Engineer             │
│ Company: TechCorp                   │
│                                     │
│ [Track This Application]            │
└─────────────────────────────────────┘
```

That's it! Simple and accurate. 🚀
