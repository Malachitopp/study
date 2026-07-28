import { TextInput, StyleSheet, View, Text } from 'react-native'
import { useState} from 'react';
import { API_URL } from '@/constants/api';
import { useRouter } from 'expo-router'
import { AppButton } from "@/components/app-button";
import { colors, radius, spacing } from '@/constants/design';
import { useAuthToken } from '@/hooks/use-auth-token';

export default function NewModule() {
    const router = useRouter() 
    const {token, logout} = useAuthToken() 


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
                logout();
                return;}
        const data = await response.json() 
        if (!response.ok) { console.log('create module failed', response.status, data); return; }
      
        router.back();   
      }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>New Module</Text>
            <TextInput
                style={styles.input}
                value={moduleName}
                onChangeText={setmoduleName}
                placeholder="Module name"
                placeholderTextColor={colors.textMuted}
            />
            <TextInput
                style={styles.input}
                value={moduleTerm}
                onChangeText={setmoduleTerm}
                placeholder="Term"
                placeholderTextColor={colors.textMuted}
            />
            <AppButton title="Create New Module" onPress={handleCreateModule}/>
        </View>
    )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
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
});