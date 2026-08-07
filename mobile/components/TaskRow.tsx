
import { colors, radius, spacing } from "@/constants/design";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { AppButton } from "./app-button";
import { Commitment, Task } from "@/constants/types";
import { Pressable } from "react-native";
import {ViewStyle, TextStyle} from 'react-native'



type TaskRowProps = {
    task: Task;
    onPress?: () => void;
    commitments: Commitment[];
    onStake: ()=>void;

}



export function TaskRow( {task, onPress, commitments, onStake}: TaskRowProps) {
    const mine = commitments.filter(c => c.task.id === task.id)
    const stakedPence = mine.filter(c=> c.status === 'active').reduce((sum, c ) => c.stake_pence + sum, 0)
    const lostPence = mine.filter(c => c.status === 'failed').reduce((sum,c) => sum + c.stake_pence,0)
    const keptPence = mine.filter(c => c.status === 'completed').reduce((sum,c) => c.stake_pence + sum, 0)
    const stakeable = stakedPence === 0 && new Date(task.due_at).getTime() > Date.now() 
    
    let badgeLabel= 'NO STAKE';
    let badgeStyle: ViewStyle = style.none;
    let badgeTextStyle:TextStyle = style.noneTx;

    if (stakedPence > 0) {
        badgeLabel = `STAKED £${(stakedPence / 100).toFixed(2)}`;
        badgeStyle = style.staked;
        badgeTextStyle = style.stakedTx;
    } else if (lostPence > 0) {
        badgeLabel = `LOST £${(lostPence / 100 ).toFixed(2)}`;
        badgeStyle = style.lost;
        badgeTextStyle = style.lostTx
    } else if (keptPence > 0) {
        badgeLabel = `KEPT £${(keptPence / 100).toFixed(2)}`;
        badgeStyle = style.kept;
        badgeTextStyle = style.keptTx
    }

    const due = new Date(task.due_at).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
    });

    return (
        <Pressable style={({pressed}) => [style.card, {opacity: pressed ? 0.85 : 1}]} onPress={onPress}>
            <View style={style.row}>
                <View style={style.middle}>
                    <Text style={style.title}>{task.title}</Text>
                    <Text style={style.meta}>{task.kind} · due {due}</Text>
                </View>
                <View style={[style.pill, badgeStyle]}>
                    <Text style={[style.pillText, badgeTextStyle]}>{badgeLabel}</Text>
                </View>
            </View>

            {stakeable && (
                <AppButton ghost title="Put money on it" onPress={onStake}/>
            )}
        </Pressable>
    )

}

const style = StyleSheet.create(
    {
        card: {
            gap: spacing.sm,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borders,
            borderRadius: radius.card,
            padding: spacing.md,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
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
    fontSize: 13,
    marginTop: spacing.xs,
    },
    pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    staked:   { backgroundColor: 'rgba(92,108,255,0.15)' },
    stakedTx: { color: colors.accent },
    lost:     { backgroundColor: 'rgba(255,71,87,0.15)' },
    lostTx:   { color: colors.danger },
    kept:     { backgroundColor: 'rgba(46,213,115,0.15)' },
    keptTx:   { color: colors.success },
    none:     { borderWidth: 1, borderColor: colors.borders },
    noneTx:   { color: colors.textMuted },

    }
)
