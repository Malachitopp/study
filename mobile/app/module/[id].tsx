import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { TextInput, StyleSheet, View, Text, ScrollView, Alert } from 'react-native'
import { useState, useCallback } from 'react';
import { API_URL } from '@/constants/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppButton } from "@/components/app-button";
import { colors, radius, spacing } from '@/constants/design';
import { useAuthToken } from '@/hooks/use-auth-token';
import {useLoadTasks} from '@/hooks/use-load-tasks';
import {useCreateTasks} from '@/hooks/use-create-tasks';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Pressable } from "react-native";








export default function ModuleScreen() {
    const{id} = useLocalSearchParams();
    const {token, logout} = useAuthToken() 



    const {task, loadtasks} = useLoadTasks(String(id));
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);


    


    const {taskTitle, setTaskTitle, selectedKind, setSelectedKind, taskDueDate,
        setTaskDueDate, handleCreateTask} = useCreateTasks(String(id), loadtasks);


    const TASK_KINDS = ['problem sheet', 'revision', 'reading', 'coursework'];
   

    

 
    const[stakePounds, setStakePounds] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(new Date())
    const [requiredSeconds, setRequiredSeconds] = useState('');

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
                    verification_type:'timer',
                    required_seconds:(Number(requiredSeconds) *60) 
                 }),
            }
        );
        if (response.status === 401) {
        logout();
        return;}
        const data = await response.json();
        if (!response.ok) {console.log('create failed', response.status, data); return;}
        setStakePounds('');
        setRequiredSeconds('');
    }



    const handleDelete = async (id:number, module_id: number) => {
      const response = await fetch(`${API_URL}/modules/${module_id}/tasks/${id}`, {
        method : "DELETE",
        headers: {Authorization: 'Bearer ' + token}
      })
           if (response.status === 401) {
                  logout() 
                  return;}
          if (!response.ok) {
          const data = await response.json();   // parse only now — a body is guaranteed here
          Alert.alert(data.detail);
          return;
        }

      loadtasks() 
    }



    return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Module {id}</Text>

        <View style={styles.section}>
            <Text style={styles.sectionLabel}>New Task</Text>
            <TextInput
                style = {styles.input}
                value = { taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Title"
                placeholderTextColor={colors.textMuted}
            />

            <DateTimePicker
                value = {taskDueDate}
                mode = "datetime"
                themeVariant="dark"
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
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tasks</Text>
            {task.map((c) => (
          <ReanimatedSwipeable key = {c.id}
          renderRightActions={
            () => (
              <Pressable style = {styles.deleteAction} onPress={()=>handleDelete(c.id, c.module_id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            )
          }>
            <View key = {c.id} style = {styles.row}>
                <Text style={styles.taskTitle}>{c.title}</Text>
                <AppButton
                title = {'Select'}
                selected = {selectedTaskId === c.id }
                onPress={() => setSelectedTaskId(c.id)}/>
            </View>
          </ReanimatedSwipeable>
        ))}
        </View>

        <View style = {styles.section}>
            <Text style={styles.sectionLabel}>New Commitment</Text>
            <TextInput
            style = {styles.input}
            keyboardType='numeric'
            value={stakePounds}
            onChangeText={setStakePounds}
            placeholder='£ Stake'
            placeholderTextColor={colors.textMuted}
            />
            <TextInput 
            style = {styles.input}
            keyboardType='numeric'
            value = {requiredSeconds}
            onChangeText={setRequiredSeconds}
            placeholder="Required study time (Minutes)"
            placeholderTextColor={colors.textMuted}/>
            <DateTimePicker
               value ={deadlineDate}
               mode = 'datetime'
               themeVariant="dark"
               onChange={(event, selectedDate) => {
                if (selectedDate) setDeadlineDate(selectedDate)
               }}/>
            <AppButton title="Create commitment" onPress={handleCreateCommitment} />
          </View>
    </ScrollView>
    );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: radius.button,
    padding: spacing.md,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 15,
  },
  section: {
    gap: spacing.sm,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  deleteAction: {
    width: 80,
    backgroundColor: colors.danger,
    borderRadius: radius.card,
    justifyContent: 'center',
    alignItems: 'center',
},
deleteText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
},
});