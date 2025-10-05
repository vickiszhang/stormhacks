
export enum status {
    APPLIED,
    ONLINE_ASSESSMENT,
    INTERVIEW,
    OFFER
}

export const sampleApplicationData = [
    {
        title: "Software Developer",
        company: "Google",
        dateApplied: new Date("2025-09-15"),
        status: status.APPLIED
    },
    {
        title: "Frontend Engineer",
        company: "Meta",
        dateApplied: new Date("2025-09-18"),
        status: status.ONLINE_ASSESSMENT
    },
    {
        title: "Backend Developer",
        company: "Amazon",
        dateApplied: new Date("2025-09-20"),
        status: status.APPLIED
    },
    {
        title: "Full Stack Developer",
        company: "Microsoft",
        dateApplied: new Date("2025-09-22"),
        status: status.INTERVIEW
    },
    {
        title: "DevOps Engineer",
        company: "Netflix",
        dateApplied: new Date("2025-09-25"),
        status: status.APPLIED
    },
    {
        title: "Data Engineer",
        company: "Airbnb",
        dateApplied: new Date("2025-09-28"),
        status: status.ONLINE_ASSESSMENT
    },
    {
        title: "Machine Learning Engineer",
        company: "OpenAI",
        dateApplied: new Date("2025-10-01"),
        status: status.OFFER
    },
    {
        title: "iOS Developer",
        company: "Apple",
        dateApplied: new Date("2025-10-02"),
        status: status.APPLIED
    },
    {
        title: "Android Developer",
        company: "Spotify",
        dateApplied: new Date("2025-10-03"),
        status: status.INTERVIEW
    },
    {
        title: "Cloud Solutions Architect",
        company: "Salesforce",
        dateApplied: new Date("2025-10-04"),
        status: status.APPLIED
    },
    {
        title: "Site Reliability Engineer",
        company: "Uber",
        dateApplied: new Date("2025-09-12"),
        status: status.ONLINE_ASSESSMENT
    },
    {
        title: "Security Engineer",
        company: "Cloudflare",
        dateApplied: new Date("2025-09-10"),
        status: status.INTERVIEW
    },
    {
        title: "QA Engineer",
        company: "Shopify",
        dateApplied: new Date("2025-09-08"),
        status: status.APPLIED
    },
    {
        title: "Product Manager",
        company: "Stripe",
        dateApplied: new Date("2025-09-05"),
        status: status.OFFER
    },
    {
        title: "UI/UX Designer",
        company: "Adobe",
        dateApplied: new Date("2025-09-01"),
        status: status.INTERVIEW
    }
]
