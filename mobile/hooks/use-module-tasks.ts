import { Task } from '@/constants/types';
import { useApiList } from '@/hooks/use-api-list';

// One module's tasks — the flat all-tasks list lives in use-tasks.
export function useModuleTasks(moduleId: string | number) {
    const { items, load } = useApiList<Task>(`/modules/${moduleId}/tasks/`);
    return { tasks: items, loadTasks: load };
}
