import { Task } from "./components/Chart";

export const sampleTasks: Task[] = [
    {
        id: 1,
        name: "Project Kickoff",
        plannedStartDate: "2025-01-01T00:00:00",
        plannedEndDate: "2025-01-05T23:59:59",
        actualStartDate: "2025-01-01T00:00:00",
        actualEndDate: "2025-01-07T23:59:59"
    },
    {
        id: 2,
        name: "Requirements Gathering",
        plannedStartDate: "2025-01-06T00:00:00",
        plannedEndDate: "2025-01-20T23:59:59",
        actualStartDate: "2025-01-08T00:00:00",
        actualEndDate: "2025-01-22T23:59:59"
    },
    {
        id: 3,
        name: "Design Phase",
        plannedStartDate: "2025-01-21T00:00:00",
        plannedEndDate: "2025-02-10T23:59:59",
        actualStartDate: "2025-01-23T00:00:00",
        actualEndDate: "2025-02-08T23:59:59"
    },
    {
        id: 4,
        name: "Development",
        plannedStartDate: "2025-02-11T00:00:00",
        plannedEndDate: "2025-03-15T23:59:59",
        actualStartDate: "2025-02-09T00:00:00",
        actualEndDate: "2025-03-20T23:59:59"
    },
    {
        id: 5,
        name: "Testing",
        plannedStartDate: "2025-03-16T00:00:00",
        plannedEndDate: "2025-04-05T23:59:59",
        actualStartDate: "2025-03-21T00:00:00",
        actualEndDate: "2025-04-10T23:59:59"
    },
    {
        id: 6,
        name: "Deployment",
        plannedStartDate: "2025-04-06T00:00:00",
        plannedEndDate: "2025-04-15T23:59:59",
        actualStartDate: "2025-04-11T00:00:00",
        actualEndDate: "2025-04-18T23:59:59"
    },
    {
        id: 7,
        name: "Post-Launch Support",
        plannedStartDate: "2025-04-16T00:00:00",
        plannedEndDate: "2025-05-15T23:59:59",
        actualStartDate: "2025-04-19T00:00:00",
        actualEndDate: "" 
    }
];

export default sampleTasks;