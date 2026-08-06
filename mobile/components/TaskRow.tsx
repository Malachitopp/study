
import { colors, radius, spacing } from "@/constants/design";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { AppButton } from "./app-button";
import { Commitment, Task } from "@/constants/types";
import { Pressable } from "react-native";



type TaskRowProps = {
    task: Task;
    onPress?: () => void;
    nextcommitment?: Commitment
    status: ['completed', 'incomplete']
}



export function TypeRow( {task, onPress, nextcommitment, status}: TaskRowProps) {
    return (
   
    <View style = {style.card}>
        <View style = {style.middle}>
            <Text style = {style.title}>
                {task.title}
            </Text>
            <Text style={style.meta}>
                {task.kind} | due {task.due_at}
            </Text>
        </View>
        <Pressable onPress={onPress}>
            <Text style = {style.title}> Put Money on it</Text>
        </Pressable>
    </View>
       
    )

}

const style = StyleSheet.create(
    {
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borders,
            borderRadius: radius.card,
            padding: spacing.md,
        },
        middle: {
            flex: 1 
        },
        title: {
            color: colors.text,
            fontSize: 14.5,
            fontWeight: '600',
        },
          meta: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.xs,
  },
    }
)