import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, View, Text, Alert } from "react-native";
import { API_URL } from "@/constants/api";
import { AppButton } from "@/components/app-button";
import { spacing, colors, radius} from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";
import {useCommitments} from '@/hooks/use-commitments';
import { Pressable } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {useLoadTasks} from '@/hooks/use-load-tasks';
import {ModuleCard} from '@/components/ModuleCard';
import {useTasks} from '@/hooks/use-tasks';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';



export default function Plan() {
    const router = useRouter() 
    const {token, logout}  = useAuthToken()
    const[modules, setModules] = useState<{id:number; name: string, user_id: number, term: string}[]>([]);



  const loadModules = async () => {
    const response = await fetch(`${API_URL}/modules/`, {
      headers: { Authorization: 'Bearer ' + token }
    });
            if (response.status === 401) {
            logout() 
            return;}

    const data = await response.json();
    if (!response.ok) { console.log('modules fetch failed', response.status, data); return; }
    setModules(data);
  };
  useFocusEffect(
    useCallback( () => {
      if (token) {loadModules()};

    }, [token]))

  const {commitments} = useCommitments();
  const {tasks} = useTasks();

  
  const handleDelete = async (id:number) => {
    const response = await fetch(`${API_URL}/modules/${id}`, {
      method: "DELETE",
      headers: {Authorization: 'Bearer ' + token}

    });
     if (response.status === 401) {
            logout() 
            return;}
    if (!response.ok) {
    const data = await response.json();   // parse only now — a body is guaranteed here
    Alert.alert(data.detail);
    return;
  }


    loadModules() 

  }
 


    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <View style={styles.page}> 
            <View style={styles.section}>
              <Text style= {styles.sectionLabel}>Your Modules</Text>
              {modules.map((m) => (
                <ReanimatedSwipeable key ={m.id} renderRightActions={
                  () => (
                      <Pressable style = {styles.deleteAction} onPress={()=>handleDelete(m.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    )

                }>
                  <ModuleCard key = {m.id} onPress={() => router.push(`/module/${m.id}`)}
                  commitment = {commitments} tasks = {tasks} module = {m} />
                 </ReanimatedSwipeable>
              ))}
            </View>

            <View style ={styles.section}>
              
              <AppButton title="Add Module" onPress={() => router.push('/new-module')}/>
              
            </View>
        </View> 
      </SafeAreaView>
    )
}
const styles = StyleSheet.create({
  page: {
      flex: 1, 
      backgroundColor: colors.bg,
      padding: spacing.md,
      gap: spacing.sm 
    },
  section: {
    gap: spacing.sm,
  },
    sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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