import {useState} from 'react';
import { API_URL } from '@/constants/api';
import { Task } from '@/constants/types';
import { useAuthToken } from '@/hooks/use-auth-token';
import {useFocusEffect} from 'expo-router'
import {useCallback} from 'react'
    
    
    
    
    
      

    
    
    
    
export function useTasks() {
    const {token, logout} = useAuthToken()
    const[tasks, setTasks] = useState<Task[]>([]);


    const loadTasks = async() => {
          const response = await fetch(`${API_URL}/tasks/`, {
            headers: {Authorization: 'Bearer ' + token}
          });
                  if (response.status === 401) {
                  logout();
                  return;}
          const data = await response.json() ;
          if (!response.ok) {
            console.log('tasks fetch failed', response.status, data)
            return;
          };
          setTasks(data);
  
        };

    useFocusEffect(
    useCallback(() => {
        if (token) {loadTasks()};
    }, [token])
    );

    return {tasks, loadTasks};



}