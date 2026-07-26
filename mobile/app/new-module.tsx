
import { ThemedText} from "@/components/themed-text";
import { TextInput } from 'react-native'
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store'
import { API_URL } from '@/constants/api';
import { StyleSheet } from 'react-native';

import { useRouter } from 'expo-router'

import { AppButton } from "@/components/app-button";


export default function NewModule() {
    const router = useRouter() 
    
    
    
    const [token, setToken] = useState<string| null>(null);
    
    useEffect(() => {
        const restoreToken = async () => {
            const saved = await SecureStore.getItemAsync('token');
            if (saved) setToken(saved);
        };
        restoreToken();
    },[]);

    const[moduleName, setmoduleName] = useState('');
    const[moduleTerm, setmoduleTerm] = useState('') 
    const handleCreateModule = async () => {
        if (!moduleName || !moduleTerm) {
          console.log("Need module name or module term");
          return;
        }
        const response = await fetch(`${API_URL}/modules/`, {
          method:'POST',
          headers: { 'Content-Type': 'application/json', Authorization:'Bearer ' + token},
          body: JSON.stringify({name : moduleName, term: moduleTerm}),
        });
                if (response.status === 401) {
                await SecureStore.deleteItemAsync('token');
                setToken(null);
                router.replace('/');
                return;}
        const data = await response.json() 
        if (!response.ok) { console.log('create module failed', response.status, data); return; }
      
        router.back();   
      }

    return (
        <ThemedView style = {styles.section}>
            <ThemedText type="subtitle"> New Module </ThemedText>
            <TextInput 
                style = {styles.input}
                value = {moduleName} 
                onChangeText ={setmoduleName} 
                placeholder="Module Name"
            />
            <TextInput 
                style = {styles.input}
                value = {moduleTerm}
                onChangeText = {setmoduleTerm}
                placeholder="Module Term"
            />
            <AppButton title="Create New Module" onPress={handleCreateModule}/>

        </ThemedView>
    )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1 ,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom:8,
  },

  section: {
    gap: 8,
  },

});