import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { API_URL } from "@/constants/api";
import { AppButton } from "@/components/app-button";
import { spacing, colors } from "@/constants/design";
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
        <View style={styles.page}> 
            <View style={styles.section}>
              <Text style= {styles.sectionLabel}>Your Modules</Text>
              {modules.map((m) => (
                <AppButton key={m.id} title={m.name} onPress={() => router.push(`/module/${m.id}`)} />
              ))}
            </View>

            <View style ={styles.section}>
              
              <AppButton title="Add Module" onPress={() => router.push('/new-module')}/>
              
            </View>
        </View> 

    )
}
const styles = StyleSheet.create({
  page: {
      flex: 1, 
      backgroundColor: colors.bg,
      padding: spacing.md 
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
});