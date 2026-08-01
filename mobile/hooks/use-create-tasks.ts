import { useState } from "react";
import {API_URL} from '@/constants/api';
import {useAuthToken} from '@/hooks/use-auth-token';


// The hook receives what varies (which module, what to do after a create)
// and owns what it encapsulates (the form state and the POST).
export function useCreateTasks(moduleId: string | number, onCreated: () => void) {
        const [taskTitle, setTaskTitle] = useState('');
        const [selectedKind, setSelectedKind] = useState<string | null>(null);
        const [taskDueDate, setTaskDueDate] = useState(new Date());
        const {token, logout} = useAuthToken();


        const handleCreateTask = async () => {
            if (!taskTitle || !selectedKind) {
                console.log("need a title and a kind");
                return;
            }
            const response = await fetch(`${API_URL}/modules/${moduleId}/tasks/`, {
                method : 'POST',
                headers: {'Content-Type': 'application/json',Authorization: 'Bearer ' + token},
                body: JSON.stringify({title: taskTitle, kind : selectedKind,
                     due_at: taskDueDate.toISOString()})
            });
            if (response.status === 401) {
            logout();
            return;}
            const data = await response.json()
            if (!response.ok) {console.log('failed', response.status, data); return;}
            onCreated();
            setTaskTitle('');
            setSelectedKind(null);

        };

        return {
            taskTitle, setTaskTitle,
            selectedKind, setSelectedKind,
            taskDueDate, setTaskDueDate,
            handleCreateTask,
        };
}
