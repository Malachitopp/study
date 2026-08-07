
import { useLocalSearchParams} from "expo-router";
import { TextInput, StyleSheet, View, Text} from 'react-native'
import { useState } from 'react';
import { API_URL } from '@/constants/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppButton } from "@/components/app-button";
import { colors, radius, spacing } from '@/constants/design';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useRouter } from "expo-router";
import { Alert  } from "react-native";

export default function newCommitment() {
    const{taskId} = useLocalSearchParams();
    const {token, logout} = useAuthToken();
    const router = useRouter();
    
    const[stakePounds, setStakePounds] = useState('');
    const [deadlineDate, setDeadlineDate] = useState(new Date((Date.now()) + 2 * 60 * 60 * 1000))
    const [requiredMinutes, setRequiredSeconds] = useState('');




    const handleCreateCommitment = async () =>{
        const available = deadlineDate.getTime() -Date.now() 
        const timeNeeded = Number(requiredMinutes) * 60 * 1000 
        if (!(Number(stakePounds) > 0 ) || !(Number(requiredMinutes) > 0 ) || (available < timeNeeded )) {
            Alert.alert('Missing details', 'Enter a stake and the minutes you need');
            return;
        }
        const response = await fetch(`${API_URL}/tasks/${taskId}/commitments/`,
            {
                method: 'POST',
                headers: {Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json'
                 },
                 body: JSON.stringify({
                    stake_pence: Math.round(Number(stakePounds) * 100 ), 
                    deadline: deadlineDate.toISOString(),
                    verification_type:'timer',
                    required_seconds:(Number(requiredMinutes) *60) 
                 }),
            }
        );
        if (response.status === 401) {
        logout();
        return;}
        const data = await response.json();
        if (!response.ok) {console.log('create failed', response.status, data); return;}
        router.back() 
    }

    return(
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
                    value = {requiredMinutes}
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
                    <AppButton title={stakePounds ? `Put £${stakePounds} on the line`: `Set Stake`}
                     onPress={handleCreateCommitment} />
                  </View>
    )
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