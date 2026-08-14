import { Transaction } from "@/constants/types";
import { StyleSheet } from "react-native";
import {Text, View} from "react-native"
import { spacing, colors, radius } from "@/constants/design";




type TransactionRowProp ={
    transaction : Transaction;
}


export function TransactionRow({transaction}: TransactionRowProp) {
    const reasonLabel = transaction.reason.includes('deadline') ?
    'Missed deadline' : transaction.reason

    const when = new Date(transaction.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short',
    });

    return(
        <View style= {styles.card}>
            <View style ={styles.middle}>
                <Text style = {styles.title} numberOfLines={1}>
                    {transaction.task_title}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                    {reasonLabel} · {when}
                </Text>
            </View>
            <View style = {styles.trailing}>
                <Text style = {styles.money}>
                    -£{(transaction.amount_pence / 100).toFixed(2)}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create(
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
            fontSize: 15,
            fontWeight: '700',
            color: colors.danger,
            fontVariant: ['tabular-nums'],   // digits share a width, so amounts line up down the list
        },
        middle: {
            flex: 1
        },
        trailing: {
            alignItems: 'flex-end'
        }
    }
)
