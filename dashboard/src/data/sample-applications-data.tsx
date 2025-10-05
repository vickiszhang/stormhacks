
export enum status {
    APPLIED,
    ONLINE_ASSESSMENT,
    INTERVIEW,
    OFFER,
    REJECTED
}

export const sampleApplicationData = [
    {
        title: "Software Developer",
        company: "Google",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-15") }
        ],
        currentStatus: status.APPLIED
    },
    {
        title: "Frontend Engineer",
        company: "Meta",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-18") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-22") }
        ],
        currentStatus: status.ONLINE_ASSESSMENT
    },
    {
        title: "Backend Developer",
        company: "Amazon",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-20") },
            { status: status.REJECTED, date: new Date("2025-09-25") }
        ],
        currentStatus: status.REJECTED
    },
    {
        title: "Full Stack Developer",
        company: "Microsoft",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-22") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-26") },
            { status: status.INTERVIEW, date: new Date("2025-09-30") }
        ],
        currentStatus: status.INTERVIEW
    },
    {
        title: "DevOps Engineer",
        company: "Netflix",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-25") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-29") },
            { status: status.REJECTED, date: new Date("2025-10-02") }
        ],
        currentStatus: status.REJECTED
    },
    {
        title: "Data Engineer",
        company: "Airbnb",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-28") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-10-02") }
        ],
        currentStatus: status.ONLINE_ASSESSMENT
    },
    {
        title: "Machine Learning Engineer",
        company: "OpenAI",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-01") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-05") },
            { status: status.INTERVIEW, date: new Date("2025-09-12") },
            { status: status.OFFER, date: new Date("2025-09-20") }
        ],
        currentStatus: status.OFFER
    },
    {
        title: "iOS Developer",
        company: "Apple",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-10-02") }
        ],
        currentStatus: status.APPLIED
    },
    {
        title: "Android Developer",
        company: "Spotify",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-03") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-08") },
            { status: status.INTERVIEW, date: new Date("2025-09-15") }
        ],
        currentStatus: status.INTERVIEW
    },
    {
        title: "Cloud Solutions Architect",
        company: "Salesforce",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-10-04") }
        ],
        currentStatus: status.APPLIED
    },
    {
        title: "Site Reliability Engineer",
        company: "Uber",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-12") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-18") }
        ],
        currentStatus: status.ONLINE_ASSESSMENT
    },
    {
        title: "Security Engineer",
        company: "Cloudflare",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-10") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-14") },
            { status: status.INTERVIEW, date: new Date("2025-09-21") }
        ],
        currentStatus: status.INTERVIEW
    },
    {
        title: "QA Engineer",
        company: "Shopify",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-08") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-12") },
            { status: status.INTERVIEW, date: new Date("2025-09-18") },
            { status: status.REJECTED, date: new Date("2025-09-22") }
        ],
        currentStatus: status.REJECTED
    },
    {
        title: "Product Manager",
        company: "Stripe",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-05") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-10") },
            { status: status.INTERVIEW, date: new Date("2025-09-17") },
            { status: status.OFFER, date: new Date("2025-09-24") }
        ],
        currentStatus: status.OFFER
    },
    {
        title: "UI/UX Designer",
        company: "Adobe",
        statusHistory: [
            { status: status.APPLIED, date: new Date("2025-09-01") },
            { status: status.ONLINE_ASSESSMENT, date: new Date("2025-09-06") },
            { status: status.INTERVIEW, date: new Date("2025-09-13") }
        ],
        currentStatus: status.INTERVIEW
    }
]
