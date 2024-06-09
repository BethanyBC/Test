interface ShowConfiguration {
    show: string;
    times: string[];
    tiers: Array<{
        [tier: string]: {
            [category: string]: string[];
        };
    }>;
}

interface ShowRow {
    tier: string;
    category: string;
    description: string;
}

interface SubmissionRequest {
    show: string;
    date: string;
    time: string;
    rows: ShowRow[];
}

interface BasicContext {
    username: string;
    password: string;
    configuration: ShowConfiguration;
}

interface SubmissionContext extends BasicContext {
    date: string;
    time: string;
    rows: ShowRow[];
}
