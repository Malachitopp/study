import { useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store'
import { TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { API_URL } from "@/constants/api";
import { AppButton } from "@/components/app-button";

import { colors, radius, spacing } from "@/constants/design";

export default function Login() {

    const router = useRouter()

    const[email, setEmail] = useState('') ;
    const[password, setPassword] = useState('');
    

      const handleLogin = async ()=>{
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded' },
          body: `username=${email}&password=${password}`,
        });
        const data = await response.json();
        if (!response.ok) { 
            console.log('Incorrect password or Username', response.status, data); return; }
        if (!data.access_token) {
            console.log("Access denied"); return;
        }
        await SecureStore.setItemAsync('token', data.access_token)
        router.replace('/')
      }
    

    return (
                <ThemedView style ={styles.page}>
                    <ThemedView>
                    <TextInput
                      style = {styles.input}
                      value = {email}
                      onChangeText = {setEmail}
                      
                      placeholder='Email'
                      placeholderTextColor='colors.text'/>
                      
        
                    <TextInput
                      style = {styles.input}
                      value = {password}
                      onChangeText = {setPassword}
                      placeholder='Password'
                      placeholderTextColor='colors.text'/>
                      
                      <AppButton title = {'Log in'} onPress={handleLogin}/>
                      
                    </ThemedView>
                    
        
                  
                </ThemedView>
    );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1 ,
    borderColor: colors.borders,
    borderRadius: radius.pill,
    padding: spacing.sm,
    marginBottom:8,
    color: colors.text
  },
  page: {
    padding: 16,
    gap:16
  },
});