export type Commitment = {
    id: number;
    stake_pence: number;
    deadline: string;
    status: 'active' | 'completed' | 'failed' | 'cancelled';
    required_seconds: number;
    task: {
        title: string;
        kind: string;
    };
    module_title: string 
};
