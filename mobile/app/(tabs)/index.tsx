import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { useState, useEffect } from 'react';

import { TextInput } from 'react-native'

import * as SecureStore from 'expo-secure-store'
import {useRouter} from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react';

import { API_URL } from '@/constants/api';
import {AppButton} from '@/components/app-button';



export default function HomeScreen() {
  const router = useRouter();
  const[modules, setModules] = useState<{id:number; name: string}[]>([]);
  const[email, setEmail] = useState('') ;
  const[password, setPassword] = useState('');
  const[token, setToken] = useState<string | null>(null) ;

  const handleLogin = async ()=>{
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${email}&password=${password}`,
    });
    const data = await response.json();
    setToken(data.access_token);
    await SecureStore.setItemAsync('token', data.access_token)
  }

  const loadModules = async () => {
    const response = await fetch(`${API_URL}/modules/`, {
      headers: { Authorization: 'Bearer ' + token }
    });
            if (response.status === 401) {
            await SecureStore.deleteItemAsync('token');
            setToken(null);
            router.replace('/');
            return;}
    const data = await response.json();
    if (!response.ok) { console.log('modules fetch failed', response.status, data); return; }
    setModules(data);
  };

  


  const[commitments, setCommitments] = useState<{id:number; stake_pence: number;
    deadline: string; status: string;
  }[]>([]);

  const loadCommitments = async() => {
        const response = await fetch(`${API_URL}/commitments/`, {
          headers: {Authorization: 'Bearer ' + token}
        });
                if (response.status === 401) {
                await SecureStore.deleteItemAsync('token');
                setToken(null);
                router.replace('/');
                return;}
        const data = await response.json() ;
        if (!response.ok) {
          console.log('commitments fetch failed', response.status, data)
          return;
        };
        setCommitments(data);

      };


  const [seconds, setSeconds] = useState(0);
  const[running, setRunning] = useState(false);

  useEffect(()=>{
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => s + 1);

    }, 1000);
    return () => clearInterval(id);
  }, [running]);


  const handleCheckin = async(id: number) => {
    const response = await fetch(`${API_URL}/commitments/${id}/checkins/`, {
      method:  'POST',
      headers: {Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',

      },
      body: JSON.stringify({focus_seconds:seconds}),


    });
            if (response.status === 401) {
            await SecureStore.deleteItemAsync('token');
            setToken(null);
            router.replace('/');
            return;}
    const data = await response.json()
    if (!response.ok) {console.log('checkin failed', response.status, data);
      return;
    };
    setRunning(false);
    setSeconds(0);
    loadCommitments();

  };

  useEffect(() => {
    const restoreToken = async () => {
      const saved = await SecureStore.getItemAsync('token');
      if (saved) {
        setToken(saved)
      }
    };
    restoreToken();
  }, []);
  
  const [transactions, setTransactions] = useState<{id:number; 
    amount_pence: number; reason: string
  }[]>([]);

 
  const loadTransactions = async () => {
      const response = await fetch(`${API_URL}/transactions/`, {
        method: 'GET',
        headers: {Authorization: 'Bearer ' + token},
      });
              if (response.status === 401) {
              await SecureStore.deleteItemAsync('token');
              setToken(null);
              router.replace('/');
              return;}
      const data = await response.json();
      if (!response.ok) {console.log('transactions fetch failed', response.status,
        data); return; } 
      
      setTransactions(data);
    };


  
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token')
    setToken(null);
  };


    useFocusEffect(
    useCallback(() => {
        if (token) {loadCommitments(), loadTransactions(), loadModules()};
    }, [token])
    );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
        <ThemedView style ={styles.page}>
          {!token && (
            <ThemedView>
            <TextInput
              style = {styles.input}
              value = {email}
              onChangeText = {setEmail}
              placeholder='Email'
              placeholderTextColor='#888'/>
              

            <TextInput
              style = {styles.input}
              value = {password}
              onChangeText = {setPassword}
              placeholder='Password'
              placeholderTextColor='#888'/>
              
              <AppButton title = {'Log in'} onPress={handleLogin}/>
              <ThemedText>{token ? 'Logged in ✓' : 'Not logged in'}</ThemedText>
            </ThemedView>
            

          )}
          {token &&(
            <>
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Your Modules</ThemedText>
              {modules.map((m) => (
                <AppButton key={m.id} title={m.name} onPress={() => router.push(`/module/${m.id}`)} />
              ))}
            </ThemedView>

            <ThemedView style ={styles.section}>
              <AppButton title = "log out" onPress={handleLogout}/>
              <AppButton title="Create New Module" onPress={() => router.push('/new-module')}/>
              
            </ThemedView>
           
          <ThemedView style = {styles.section}>
            <ThemedText type = "subtitle"> Your Commitments</ThemedText>

            {commitments.map((c)=>(
              <ThemedView key={c.id} style = {styles.row}>
                <ThemedText>£{(c.stake_pence/100).toFixed(2)} | {c.status} due {c.deadline}</ThemedText>
                <AppButton title = "Check in" onPress={() => handleCheckin(c.id)}/>
              </ThemedView>
            ))}
            

          </ThemedView>

          <ThemedView>
            <AppButton title={running ? 'Pause' : 'Start'} onPress={
              () => setRunning(!running)} />
            <ThemedText>{seconds}s</ThemedText>

          </ThemedView>

          <ThemedView style = {styles.section}>
            <ThemedText type = "subtitle">Ledger</ThemedText>
            {transactions.map((t) => (
              <ThemedText key = {t.id}>£{(t.amount_pence / 100).toFixed(2)} - {t.reason}</ThemedText>
            ))}
          </ThemedView>
          </>
          )}
        </ThemedView>
    </ParallaxScrollView>

  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1 ,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom:8,
  },
  page: {
    padding: 16,
    gap:16
  },
  section: {
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

});
