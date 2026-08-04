export type Commitment = {
    id: number;
    stake_pence: number;
    deadline: string;
    status: 'active' | 'completed' | 'failed' | 'cancelled';
    required_seconds: number;
    task: Task;
    module_title: string 
    created_at: string
};

export type Task = {
    title: string 
    kind: "problem_sheet"|"revision"|"reading"|"coursework"
    id: number 
    module_id: number
    due_at: string
    recurrence: string | null 
    
}


export type Module = {
    id: number 
    user_id: number 
    name: string
    term: string


}