import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { API_URL } from "@/constants/api";
import { AppButton } from "@/components/app-button";
import { ThemedText } from '@/components/themed-text';
import { spacing } from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";


export default function Plan() {
    const router = useRouter() 
    const {token, logout}  = useAuthToken()
    const[modules, setModules] = useState<{id:number; name: string}[]>([]);

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
    useCallback(
        ()=> {
            if(token) {loadModules()}
        }, [token]
    )
  );
  
    return (
        <ThemedView style={styles.page}> 
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Your Modules</ThemedText>
              {modules.map((m) => (
                <AppButton key={m.id} title={m.name} onPress={() => router.push(`/module/${m.id}`)} />
              ))}
            </ThemedView>

            <ThemedView style ={styles.section}>
              
              <AppButton title="Add Module" onPress={() => router.push('/new-module')}/>
              
            </ThemedView>
        </ThemedView> 

    )
}
const styles = StyleSheet.create({
  page: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
});