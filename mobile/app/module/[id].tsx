import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { ThemedText} from "@/components/themed-text";
import { TextInput } from 'react-native'
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store'
import { API_URL } from '@/constants/api';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import ParallaxScrollView from "@/components/parallax-scroll-view";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router'

import { AppButton } from "@/components/app-button";





export default function ModuleScreen() {
    const router = useRouter() 

    const{id} = useLocalSearchParams();

    const [token, setToken] = useState<string| null>(null);

    useEffect(() => {
        const restoreToken = async () => {
            const saved = await SecureStore.getItemAsync('token');
            if (saved) setToken(saved);
        };
        restoreToken();
    },[]);

    const [task, setTask] = useState<{id:number; title:string}[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const loadtasks = async () => {
        const response = await fetch(`${API_URL}/modules/${id}/tasks/`, {
        headers: {Authorization: 'Bearer ' + token }
        });
        if (response.status === 401) {
        await SecureStore.deleteItemAsync('token');
        setToken(null);
        router.replace('/');
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
        }, [token,id])
    );
    
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedKind, setSelectedKind] = useState<string | null>(null);
    const [taskDueDate, setTaskDueDate] = useState(new Date());

    const handleCreateTask = async () => {
        if (!taskTitle || !selectedKind) {
            console.log("need a title and a kind");
            return;
        }
        const response = await fetch(`${API_URL}/modules/${id}/tasks/`, {
            method : 'POST',
            headers: {'Content-Type': 'application/json',Authorization: 'Bearer ' + token},
            body: JSON.stringify({title: taskTitle, kind : selectedKind,
                 due_at: taskDueDate.toISOString()})
        });
        if (response.status === 401) {
        await SecureStore.deleteItemAsync('token');
        setToken(null);
        router.replace('/');
        return;}
        const data = await response.json() 
        if (!response.ok) {console.log('failed', response.status, data); return;}
        loadtasks();
        setTaskTitle('');
        setSelectedKind(null);

    };
    const TASK_KINDS = ['problem_sheet', 'revision', 'reading', 'coursework'];
   

    

 
    const[stakePounds, setStakePounds] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(new Date())

    const handleCreateCommitment = async () =>{
        if (!selectedTaskId) {console.log("no id selected"); return;}
        const response = await fetch(`${API_URL}/tasks/${selectedTaskId}/commitments/`,
            {
                method: 'POST',
                headers: {Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({
                    stake_pence: Math.round(Number(stakePounds) * 100 ), 
                    deadline: deadlineDate.toISOString(),
                    verification_type:'timer'
                 }),
            }
        );
        if (response.status === 401) {
        await SecureStore.deleteItemAsync('token');
        setToken(null);
        router.replace('/');
        return;}
        const data = await response.json();
        if (!response.ok) {console.log('create failed', response.status, data); return;}
        setStakePounds('');
    }







    return (
    <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.reactLogo}
            />
          }>
     <ThemedText>module {id}</ThemedText>
     <ThemedView style={styles.page}>
        <TextInput
            style = {styles.input}
            value = { taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Title"
            placeholderTextColor='#f8f8f8'
        />
        <DateTimePicker
            value = {taskDueDate}
            mode = "datetime"
            onChange={(event, selectedDate) => {
                if (selectedDate) setTaskDueDate(selectedDate)
            }}
            />
        {TASK_KINDS.map((k) => (
            <AppButton
            key={k}
            title={k}
            selected = {selectedKind === k }
            onPress={() => setSelectedKind(k)}
            />
        ))}
        <AppButton title = {"Create Task"} onPress={handleCreateTask}/>
     </ThemedView> 
        <ThemedView>
            {task.map((c) => (
            <ThemedView key = {c.id} style = {styles.row}>
                <ThemedText key = {c.id} > {c.title}</ThemedText>
                <AppButton 
                key = {c.id}
                title = {'Select ID'}
                selected = {selectedTaskId === c.id }
                onPress={() => setSelectedTaskId(c.id)}/>
            </ThemedView>
        ))}

        </ThemedView>
        <ThemedView style = {styles.section}>
            <ThemedText type='subtitle'>New Commitment</ThemedText>
            <TextInput
            style = {styles.input}
            keyboardType='numeric'
            value={stakePounds}
            onChangeText={setStakePounds}
            placeholder='£ Stake'
            />
            <DateTimePicker
               value ={deadlineDate}
               mode = 'datetime'
               onChange={(event, selectedDate) => {
                if (selectedDate) setDeadlineDate(selectedDate)
               }}/>
            <ThemedText> {deadlineDate.toISOString()}</ThemedText>
            

            <AppButton title="Create commitment" onPress={handleCreateCommitment} />
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