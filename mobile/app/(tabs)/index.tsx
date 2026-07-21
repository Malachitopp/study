import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { useState, useEffect } from 'react';
import { Button } from 'react-native';
import { TextInput } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';


const API_URL = 'http://192.168.0.100:8000';


export default function HomeScreen() {
  
  const[count, setCount] = useState(0) ;
  const[health, setHealth] = useState<string| null > (null);
  const[modules, setModules] = useState<{id:number; name: string}[]>([]);

  useEffect( () => {
    const loadHealth = async () => { 
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setHealth(data.status);
    };
    loadHealth();
  }, []);

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
  }
  
  useEffect(() => {
    if (!token) return;
    const loadModules = async () => {
      const response = await fetch(`${API_URL}/modules/`, {
        headers: {Authorization: 'Bearer ' + token}
      });
      const data = await response.json();

      if (!response.ok) {
        console.log('modules fetch failed', response.status, data);
        return;
      }
      setModules(data);
    };
    loadModules();
  }, [token]);


  const[commitments, setCommitments] = useState<{id:number; stake_pence: number;
    deadline: string; status: string;
  }[]>([]);

  const loadCommitments = async() => {
        const response = await fetch(`${API_URL}/commitments/`, {
          headers: {Authorization: 'Bearer ' + token}  
        });
        const data = await response.json() ;
        if (!response.ok) {
          console.log('commitments fetch failed', response.status, data)
          return;
        };
        setCommitments(data);

      };
  useEffect(()=>{
    if (token) loadCommitments();
  }, [token]);
  const[stakePounds, setStakePounds] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(new Date())




  const handleCreateCommitment = async() => {
    const response = await fetch(`${API_URL}/tasks/1/commitments/`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token 
      },
      body: JSON.stringify({
        stake_pence: Math.round(Number(stakePounds)* 100),
        deadline: deadlineDate.toISOString(),
        verification_type: 'timer',
      }),

    });
    const data = await response.json();
    if (!response.ok) {console.log('create failed', response.status, data); return;}
    loadCommitments();
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
    const data = await response.json() 
    if (!response.ok) {console.log('checkin failed', response.status, data);
      return;
    };
    setRunning(false);
    setSeconds(0);
    loadCommitments();
    
  };



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
      
      
          <ThemedView>
            <TextInput
              style = {styles.input}
              value = {email}
              onChangeText = {setEmail}
              placeholder='Email'/>
              
            <TextInput
              style = {styles.input}
              value = {password}
              onChangeText = {setPassword}
              placeholder='Password'/>
              <Button title = {'Log in'} onPress={handleLogin}/>
              <ThemedText>{token ? 'Logged in ✓' : 'Not logged in'}</ThemedText>
          </ThemedView>
          
          <ThemedView style = {styles.section}>
            <ThemedText type = "subtitle"> Commitments</ThemedText>
            <TextInput 
            style = {styles.input} 
            keyboardType='numeric'
            value={stakePounds}
            onChangeText={setStakePounds}
            placeholder='£ Stake'
            />
            <DateTimePicker
               value ={deadlineDate}
               mode = "datetime"
               onChange={(event, selectedDate) => {
                if (selectedDate) setDeadlineDate(selectedDate)
               }}/>
            <ThemedText> {deadlineDate.toISOString()}</ThemedText>

            {commitments.map((c)=>(
              <ThemedView key={c.id} style = {styles.row}>
                <ThemedText>£{(c.stake_pence/100).toFixed(2)} | {c.status} due {c.deadline}</ThemedText>
                <Button title = "Check in" onPress={() => handleCheckin(c.id)}/>
              </ThemedView>
            ))}
            <Button title="Create commitment" onPress={handleCreateCommitment} />

          </ThemedView>

          <ThemedView>
            <Button title={running ? 'Pause' : 'Start'} onPress={
              () => setRunning(!running)} />
            <ThemedText>{seconds}s</ThemedText>
              
          </ThemedView>
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
