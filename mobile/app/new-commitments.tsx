
import { useLocalSearchParams} from "expo-router";
import { StyleSheet, View, Text} from 'react-native'
import { useState, useEffect } from 'react';
import { API_URL } from '@/constants/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppButton } from "@/components/app-button";
import { colors, radius, spacing } from '@/constants/design';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useRouter } from "expo-router";
import { Alert  } from "react-native";
import { Task } from "@/constants/types"


const STAKES = [5, 7.5, 10, 15, 20];
const MINUTES = [15, 30, 45, 60];

export default function newCommitment() {
    const{taskId} = useLocalSearchParams();
    const {token, logout} = useAuthToken();
    const router = useRouter();

    const [task, setTask] = useState<Task|null>(null);
    const [stakePounds, setStakePounds] = useState('');
    const [requiredMinutes, setRequiredMinutes] = useState('');
    // seeded from the task once it loads — the task's due date is the default
    // deadline, not the deadline itself: a sheet due Friday can carry a
    // commitment for tonight.
    const [deadlineDate, setDeadlineDate] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000));

    const loadTask = async() =>{
      const response = await fetch(`${API_URL}/tasks/`,{
        headers: {Authorization: "Bearer " + token}}
      )
      if (response.status === 401) {
        logout();
        return;}
      const data = await response.json();
      if (!response.ok) {console.log('task fetch failed', response.status, data); return;}
      const found = data.find((t:Task) => t.id === Number(taskId));
      if (!found) return;
      setTask(found);
      setDeadlineDate(new Date(found.due_at));
    }

    useEffect(() => { if (token) loadTask(); }, [token]);

    const handleCreateCommitment = async () =>{
        if (!task) { return; }
        const available = deadlineDate.getTime() - Date.now()
        const timeNeeded = Number(requiredMinutes) * 60 * 1000
        if (!(Number(stakePounds) > 0 ) || !(Number(requiredMinutes) > 0 )) {
            Alert.alert('Missing details', 'Pick a stake and how many minutes you need.');
            return;
        }
        if (available < timeNeeded) {
            Alert.alert('Deadline too soon', `There isn't ${requiredMinutes} minutes left before this deadline.`);
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
        if (!response.ok) {
            console.log('create failed', response.status, data);
            Alert.alert('Could not stake', data.detail ?? 'Something went wrong.');
            return;
        }
        router.back()
    }

    return(
    <View style = {styles.sheet}>
        <Text style={styles.heading}>Stake this task</Text>
        <Text style={styles.subtitle}>
            {task ? `${task.title} · ${task.kind}` : 'Loading…'}
        </Text>

        <Text style={styles.sectionLabel}>Stake</Text>
        <View style={styles.chipRow}>
            {STAKES.map((v)=>(
                <AppButton
                    key={v}
                    title={`£${v}`}
                    stake
                    selected={stakePounds === String(v)}
                    onPress={()=>setStakePounds(String(v))}/>
            ))}
        </View>

        <Text style={styles.sectionLabel}>Tracked minutes needed</Text>
        <View style={styles.chipRow}>
            {MINUTES.map((m)=>(
                <AppButton
                    key={m}
                    title={`${m}m`}
                    stake
                    selected={requiredMinutes === String(m)}
                    onPress={()=>setRequiredMinutes(String(m))}/>
            ))}
        </View>

        <View style={styles.summary}>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deadline</Text>
                <DateTimePicker
                    value={deadlineDate}
                    mode='datetime'
                    display='compact'
                    themeVariant="dark"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) setDeadlineDate(selectedDate)
                    }}/>
            </View>
        </View>

        <Text style={styles.note}>
            The server referees this. Once confirmed, the deadline can&apos;t be moved from the app.
        </Text>

        <AppButton
            title={stakePounds ? `Put £${stakePounds} on it` : 'Pick a stake'}
            onPress={handleCreateCommitment} />
    </View>
    )
}

const styles = StyleSheet.create({
  sheet: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14.5,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
  },
  note: {
    color: colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
});
