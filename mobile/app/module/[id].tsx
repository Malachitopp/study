import { router, useLocalSearchParams} from "expo-router";
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native'
import { useState } from 'react';
import { API_URL } from '@/constants/api';
import { AppButton } from "@/components/app-button";
import { colors, radius, spacing } from '@/constants/design';
import { useAuthToken } from '@/hooks/use-auth-token';
import {useModuleTasks} from '@/hooks/use-module-tasks';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Pressable } from "react-native";
import {Module} from '@/constants/types'
import { useEffect } from "react";
import { TaskRow } from "@/components/TaskRow";
import { useCommitments } from "@/hooks/use-commitments";




export default function ModuleScreen() {
    const{id} = useLocalSearchParams();
    const {token, logout} = useAuthToken(); 
    const {commitments} =useCommitments();
    const {tasks, loadTasks} = useModuleTasks(Number(id));


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

      loadTasks()
    }

    const [module, setModule] = useState<Module>();
    const [loading, setLoading] = useState(true);


    const loadModule = async () => {
      const response = await fetch(`${API_URL}/modules/`, {
        headers: { Authorization: 'Bearer ' + token }
      });
              if (response.status === 401) {
              logout() 
              return;}

      const data = await response.json();
  
      if (!response.ok) {
          console.log('Module fetch failed', response.status, data);
          setLoading(false);
          return;
        };
      const found = data.find( ( t: Module) => t.id === Number(id))
      setModule(found);
      setLoading(false);
    };

    
     useEffect( () => {
       if (token) {
        loadModule();
            }}, [token]);



    return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
   
        <Text style={styles.title}>{module && module.name}</Text>

        <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tasks</Text>
            {tasks.map((c) => (
          <ReanimatedSwipeable key = {c.id}
          renderRightActions={
            () => (
              <Pressable style = {styles.deleteAction} onPress={()=>handleDelete(c.id, c.module_id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            )
          }>
            <TaskRow
              task={c}
              commitments={commitments}
              onStake={() => router.push(`/new-commitments?taskId=${c.id}`)}
            />
          
          </ReanimatedSwipeable>
        ))}
        <AppButton title="Add Tasks" ghost onPress = {() => router.push(`/new-task?moduleId=${id}`)}/>
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