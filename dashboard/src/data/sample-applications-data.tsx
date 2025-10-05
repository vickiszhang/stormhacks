
export enum status {
    APPLIED,
    ONLINE_ASSESSMENT,
    INTERVIEW,
    OFFER
}

export const sampleApplicationData = [
    {
        title: "Software Developer",
        dateApplied: new Date("2025-09-15"),
        status: status.APPLIED
    },
    {
        title: "Frontend Engineer",
        dateApplied: new Date("2025-09-18"),
        status: status.ONLINE_ASSESSMENT
    },
    {
        title: "Backend Developer",
        dateApplied: new Date("2025-09-20"),
        status: status.APPLIED
    },
    {
        title: "Full Stack Developer",
        dateApplied: new Date("2025-09-22"),
        status: status.INTERVIEW
    },
    {
        title: "DevOps Engineer",
        dateApplied: new Date("2025-09-25"),
        status: status.APPLIED
    },
    {
        title: "Data Engineer",
        dateApplied: new Date("2025-09-28"),
        status: status.ONLINE_ASSESSMENT
    },
    {
        title: "Machine Learning Engineer",
        dateApplied: new Date("2025-10-01"),
        status: status.OFFER
    },
    {
        title: "iOS Developer",
        dateApplied: new Date("2025-10-02"),
        status: status.APPLIED
    },
    {
        title: "Android Developer",
        dateApplied: new Date("2025-10-03"),
        status: status.INTERVIEW
    },
    {
        title: "Cloud Solutions Architect",
        dateApplied: new Date("2025-10-04"),
        status: status.APPLIED
    },
    {
        title: "Site Reliability Engineer",
        dateApplied: new Date("2025-09-12"),
        status: status.ONLINE_ASSESSMENT
    },
    {
        title: "Security Engineer",
        dateApplied: new Date("2025-09-10"),
        status: status.INTERVIEW
    },
    {
        title: "QA Engineer",
        dateApplied: new Date("2025-09-08"),
        status: status.APPLIED
    },
    {
        title: "Product Manager",
        dateApplied: new Date("2025-09-05"),
        status: status.OFFER
    },
    {
        title: "UI/UX Designer",
        dateApplied: new Date("2025-09-01"),
        status: status.INTERVIEW
    }
]
