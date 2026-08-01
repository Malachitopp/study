
import { colors, radius, spacing } from "@/constants/design";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { AppButton } from "./app-button";
import { Commitment } from "@/constants/types";
import { Pressable } from "react-native";

type CommitmentRowProps = {
    commitment: Commitment;
    onPress?: () => void;
    Today?: boolean;
};



export function CommitmentRow({commitment, onPress, Today}: CommitmentRowProps) {
    
    return (
       
        <Pressable onPress = {onPress}> 
        
            <View style = {styles.card}>
                <View style = 
                {
                    [
                        styles.rail, commitment.status === 'completed' ? styles.completed : 
                        commitment.status === 'active' ? styles.active  : styles.failed
                    ]
                }
                />
                <View style={styles.middle}>
                    <Text
                    style = {styles.title}>
                        {commitment.task.title}
                        
                    </Text>
                    <Text 
                    style = {styles.meta}>
                        {commitment.status} | due {new Date(commitment.deadline).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) }
                    </Text>
                    
                </View>
                <View style= {styles.trailing}>
                    <Text style = {styles.money}>
                        £{(commitment.stake_pence/100).toFixed(2)}
                    </Text>
                    <Text style = {styles.meta}>{commitment.required_seconds/60 }m Required</Text>
                </View>


                
            </View>
        </Pressable>


            )
}

const styles = StyleSheet.create(
    {
        rail: {
            width: 3,
            height: 40,
            alignSelf: 'stretch'
        },
        completed: {
            backgroundColor: colors.success
        },
        active: {
            backgroundColor: colors.accent
        },
        failed: {
            backgroundColor: colors.danger 
        },
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
        title: {
            color: colors.text,
            fontSize: 14.5,
            fontWeight: '600',
        },
        meta: {
            color: colors.textMuted,
            fontSize: 12,
            marginTop: 6,
        },
        money: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text
        },
        middle: {
            flex: 1 
        },
        trailing: {
            alignItems: 'flex-end'
        }
    }
)

