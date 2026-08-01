import {useState} from 'react';
import { API_URL } from '@/constants/api';
import { Commitment } from '@/constants/types';
import { useAuthToken } from '@/hooks/use-auth-token';
import {useFocusEffect} from 'expo-router'
import {useCallback} from 'react'
    
    
    
    
    
      

    
    
    
    
export function useCommitments() {
    const {token, logout} = useAuthToken()
    const[commitments, setCommitments] = useState<Commitment[]>([]);


    const loadCommitments = async() => {
          const response = await fetch(`${API_URL}/commitments/`, {
            headers: {Authorization: 'Bearer ' + token}
          });
                  if (response.status === 401) {
                  logout();
                  return;}
          const data = await response.json() ;
          if (!response.ok) {
            console.log('commitments fetch failed', response.status, data)
            return;
          };
          setCommitments(data);
  
        };

    useFocusEffect(
    useCallback(() => {
        if (token) {loadCommitments()};
    }, [token])
    );

    return {commitments, loadCommitments};



}
    
    
    






    
    
    
  

  