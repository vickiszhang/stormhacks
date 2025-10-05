export interface ApplicationData {
    ApplicationID: string;
    Company: string;
    DateAccepted: string;
    DateApplied: string;
    DateInterview: string;
    DateRejected: string;
    DateScreening: string;
    DidCL: boolean;
    JobURL: string;
    Notes: string;
    ResumeURL: string;
    Role: string;
}

export const sampleApplicationData: ApplicationData[] = [
    {
        ApplicationID: "1",
        Company: "Google",
        DateAccepted: "",
        DateApplied: "2025-09-15",
        DateInterview: "",
        DateRejected: "",
        DateScreening: "",
        DidCL: true,
        JobURL: "https://careers.google.com/jobs/1",
        Notes: "",
        ResumeURL: "",
        Role: "Software Developer"
    },
    {
        ApplicationID: "2",
        Company: "Meta",
        DateAccepted: "",
        DateApplied: "2025-09-18",
        DateInterview: "",
        DateRejected: "",
        DateScreening: "2025-09-22",
        DidCL: true,
        JobURL: "https://careers.meta.com/jobs/2",
        Notes: "",
        ResumeURL: "",
        Role: "Frontend Engineer"
    },
    {
        ApplicationID: "3",
        Company: "Amazon",
        DateAccepted: "",
        DateApplied: "2025-09-20",
        DateInterview: "",
        DateRejected: "2025-09-25",
        DateScreening: "",
        DidCL: false,
        JobURL: "https://amazon.jobs/jobs/3",
        Notes: "",
        ResumeURL: "",
        Role: "Backend Developer"
    },
    {
        ApplicationID: "4",
        Company: "Microsoft",
        DateAccepted: "",
        DateApplied: "2025-09-22",
        DateInterview: "2025-09-30",
        DateRejected: "",
        DateScreening: "2025-09-26",
        DidCL: true,
        JobURL: "https://careers.microsoft.com/jobs/4",
        Notes: "",
        ResumeURL: "",
        Role: "Full Stack Developer"
    },
    {
        ApplicationID: "5",
        Company: "Netflix",
        DateAccepted: "",
        DateApplied: "2025-09-25",
        DateInterview: "",
        DateRejected: "2025-10-02",
        DateScreening: "2025-09-29",
        DidCL: true,
        JobURL: "https://jobs.netflix.com/jobs/5",
        Notes: "",
        ResumeURL: "",
        Role: "DevOps Engineer"
    },
    {
        ApplicationID: "6",
        Company: "Airbnb",
        DateAccepted: "",
        DateApplied: "2025-09-28",
        DateInterview: "",
        DateRejected: "",
        DateScreening: "2025-10-02",
        DidCL: false,
        JobURL: "https://careers.airbnb.com/jobs/6",
        Notes: "",
        ResumeURL: "",
        Role: "Data Engineer"
    },
    {
        ApplicationID: "7",
        Company: "OpenAI",
        DateAccepted: "2025-09-20",
        DateApplied: "2025-09-01",
        DateInterview: "2025-09-12",
        DateRejected: "",
        DateScreening: "2025-09-05",
        DidCL: true,
        JobURL: "https://openai.com/careers/jobs/7",
        Notes: "",
        ResumeURL: "",
        Role: "Machine Learning Engineer"
    },
    {
        ApplicationID: "8",
        Company: "Apple",
        DateAccepted: "",
        DateApplied: "2025-10-02",
        DateInterview: "",
        DateRejected: "",
        DateScreening: "",
        DidCL: true,
        JobURL: "https://jobs.apple.com/jobs/8",
        Notes: "",
        ResumeURL: "",
        Role: "iOS Developer"
    },
    {
        ApplicationID: "9",
        Company: "Spotify",
        DateAccepted: "",
        DateApplied: "2025-09-03",
        DateInterview: "2025-09-15",
        DateRejected: "",
        DateScreening: "2025-09-08",
        DidCL: false,
        JobURL: "https://spotify.com/jobs/9",
        Notes: "",
        ResumeURL: "",
        Role: "Android Developer"
    },
    {
        ApplicationID: "10",
        Company: "Salesforce",
        DateAccepted: "",
        DateApplied: "2025-10-04",
        DateInterview: "",
        DateRejected: "",
        DateScreening: "",
        DidCL: true,
        JobURL: "https://salesforce.com/careers/jobs/10",
        Notes: "",
        ResumeURL: "",
        Role: "Cloud Solutions Architect"
    },
    {
        ApplicationID: "11",
        Company: "Uber",
        DateAccepted: "",
        DateApplied: "2025-09-12",
        DateInterview: "",
        DateRejected: "",
        DateScreening: "2025-09-18",
        DidCL: false,
        JobURL: "https://uber.com/careers/jobs/11",
        Notes: "",
        ResumeURL: "",
        Role: "Site Reliability Engineer"
    },
    {
        ApplicationID: "12",
        Company: "Cloudflare",
        DateAccepted: "",
        DateApplied: "2025-09-10",
        DateInterview: "2025-09-21",
        DateRejected: "",
        DateScreening: "2025-09-14",
        DidCL: true,
        JobURL: "https://cloudflare.com/careers/jobs/12",
        Notes: "",
        ResumeURL: "",
        Role: "Security Engineer"
    },
    {
        ApplicationID: "13",
        Company: "Shopify",
        DateAccepted: "",
        DateApplied: "2025-09-08",
        DateInterview: "2025-09-18",
        DateRejected: "2025-09-22",
        DateScreening: "2025-09-12",
        DidCL: true,
        JobURL: "https://shopify.com/careers/jobs/13",
        Notes: "",
        ResumeURL: "",
        Role: "QA Engineer"
    },
    {
        ApplicationID: "14",
        Company: "Stripe",
        DateAccepted: "2025-09-24",
        DateApplied: "2025-09-05",
        DateInterview: "2025-09-17",
        DateRejected: "",
        DateScreening: "2025-09-10",
        DidCL: true,
        JobURL: "https://stripe.com/jobs/14",
        Notes: "",
        ResumeURL: "",
        Role: "Product Manager"
    },
    {
        ApplicationID: "15",
        Company: "Adobe",
        DateAccepted: "",
        DateApplied: "2025-09-01",
        DateInterview: "2025-09-13",
        DateRejected: "",
        DateScreening: "2025-09-06",
        DidCL: false,
        JobURL: "https://adobe.com/careers/jobs/15",
        Notes: "",
        ResumeURL: "",
        Role: "UI/UX Designer"
    }
]
