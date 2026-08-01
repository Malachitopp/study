import {Commitment, Task, Module} from "@/constants/types";
import { Pressable } from "react-native";
import {StyleSheet, View, Text} from "react-native";
import {spacing, colors, radius} from "@/constants/design";



type ModuleCardProps = {
    commitment:Commitment[];
    tasks: Task[];
    onPress: () => void;
    module: Module;
}


export  function ModuleCard({commitment, tasks, onPress, module}: ModuleCardProps) {

    const commitmentsForModule = commitment.filter(c=>c.task.module_id === module.id &&
        c.status === 'active');
    const numofCommitments = commitmentsForModule.length;
    const numofTasks = tasks.filter(t=>t.module_id === module.id).length;
    const stake = commitmentsForModule.reduce ((sum,c) => c.stake_pence + sum, 0) / 100;



    return (
        <Pressable onPress = {onPress} style={({pressed}) => [
            style.card,
            {opacity: pressed ? 0.85 : 1},
        ]}>
            {/* name on the left, money at risk on the right — same anatomy as CommitmentRow */}
            <View style = {style.topRow}>
                <Text style ={style.title}>
                    {module.name}
                </Text>
                {numofCommitments > 0 && (
                    <Text style={style.money}>£{stake.toFixed(2)} live</Text>
                )}
            </View>
            {/* one quiet meta line, mockup-style: "4 tasks · 2 staked" */}
            <Text style={style.meta}>
                {numofTasks} tasks · {numofCommitments} staked
            </Text>
        </Pressable>
    )
}


const style = StyleSheet.create({
    // the card IS the pressable now — one less nested View
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borders,
        borderRadius: radius.card,
        padding: spacing.md,
        gap: spacing.xs,                  // title row and meta sit close; they're one unit
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    money: {
        color: colors.danger,             // live stake = money at risk, so it reads red
        fontSize: 13,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    meta: {
        color: colors.textMuted,
        fontSize: 12.5,
    },
})
