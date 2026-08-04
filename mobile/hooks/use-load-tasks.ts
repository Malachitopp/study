import {useState} from 'react';
import {API_URL} from '@/constants/api';
import {useAuthToken} from '@/hooks/use-auth-token';
import {useFocusEffect} from 'expo-router';
import {useCallback} from 'react';
import { Task } from '@/constants/types';




export function useLoadTasks(moduleId: string|number){
    const { token, logout } = useAuthToken();
    const [task, setTask] = useState<Task[]>([]);


    
        const loadtasks = async () => {
            const response = await fetch(`${API_URL}/modules/${moduleId}/tasks/`, {
            headers: {Authorization: 'Bearer ' + token }
            });
            if (response.status === 401) {
            logout();
            return;
        }
            const data = await response.json();
            if (!response.ok) {console.log('tasks fetch failed', response.status, data);
            return;
            }
    
            setTask(data)
            };

        useFocusEffect(
            useCallback(()=>{
                if (token) loadtasks();
            }, [token,moduleId])
        );

    

    return {task, loadtasks}
    

}