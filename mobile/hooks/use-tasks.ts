import { Task } from '@/constants/types';
import { useApiList } from '@/hooks/use-api-list';

// Every task across all modules — one module's tasks live in use-module-tasks.
export function useTasks() {
    const { items, load } = useApiList<Task>('/tasks/');
    return { tasks: items, loadTasks: load };
}
