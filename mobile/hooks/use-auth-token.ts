import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store'
import {useRouter} from 'expo-router'



export function useAuthToken() {
    const[token, setToken] = useState<string | null>(null) ;
    const router = useRouter()
      useEffect(() => {
        const restoreToken = async () => {
          const saved = await SecureStore.getItemAsync('token');
          if (saved) {
            setToken(saved)
          };
          if (!saved) router.replace('/login')
        };
        restoreToken();
      }, []);
       const logout = async () => {
              await SecureStore.deleteItemAsync('token');
              router.replace('/login');
              setToken(null);
            };

    return {token, logout} ; 
}