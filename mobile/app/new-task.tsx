
import { useLocalSearchParams} from "expo-router";
import { TextInput, StyleSheet, View, Text} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppButton } from "@/components/app-button";
import { colors, radius, spacing } from '@/constants/design';
import { useCreateTasks } from "@/hooks/use-create-tasks";
import { useRouter } from "expo-router";




export default function newTask() {
    
    const {moduleId} = useLocalSearchParams() 
    const router = useRouter() 

    const {taskTitle, setTaskTitle, selectedKind, setSelectedKind, taskDueDate,
        setTaskDueDate, handleCreateTask} = useCreateTasks(String(moduleId), ()=>router.back());


    const TASK_KINDS = ['problem_sheet', 'revision', 'reading', 'coursework'];
   

    return (
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
    )
}


const styles = StyleSheet.create({
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
});