import { useState } from "react";
import { StyleSheet, FlatList} from "react-native";
import {Text, View} from "react-native"
import { spacing, colors, radius } from "@/constants/design";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCommitments } from "@/hooks/use-commitments";
import { useApiList } from "@/hooks/use-api-list";
import { Transaction } from "@/constants/types";
import { TransactionRow } from "@/components/transactionRow";
import { Tile } from "@/components/tile";


export default function Money() {
    const {commitments, loadCommitments} = useCommitments();
    // transactions has one consumer, so no named wrapper — the generic is enough
    const { items: transactions, load: loadTransactions } = useApiList<Transaction>('/transactions/');

    const [refreshing, setRefresh] = useState(false);
    const handleRefresh = async ()=> {
      setRefresh(true);
      await Promise.all([loadCommitments(), loadTransactions()]);
      setRefresh(false);
    }

    const active = commitments.filter(t=>t.status === 'active');
    const atRisk = active.reduce((sum,c) => sum + c.stake_pence, 0)

    const kept = commitments.filter(t=>t.status==='completed')
    const failed = commitments.filter(t=>t.status==='failed')

    const totalKept = kept.reduce((sum,c) => sum + c.stake_pence,0 )
    const totalFailed = failed.reduce((sum,c) => sum + c.stake_pence, 0 )

    const numberKept = kept.length
    const numberLost = failed.length

    // 0/0 is NaN, and NaN renders as "NaN%" — no history means no rate to show
    const settled = numberKept + numberLost;
    const percentage = settled === 0 ? 0 : (numberKept / settled) * 100;

    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <FlatList
          data={transactions}
          keyExtractor={(t) => String(t.id)}
          renderItem={({item}) => <TransactionRow transaction={item}/>}
          ItemSeparatorComponent={() => <View style={styles.rowGap} />}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headline}>Money</Text>

              <View style={styles.riskCard}>
                <Text style={styles.sectionLabel}>Currently at risk</Text>
                <Text style={styles.riskAmount}>£{(atRisk / 100).toFixed(2)}</Text>
                <View style={styles.segments}>
                  {active.map((c) => (
                    <View key={c.id} style={styles.segment} />
                  ))}
                </View>
                <Text style={styles.caption}>
                  across {active.length} live commitment{active.length === 1 ? '' : 's'}
                </Text>
              </View>

              <View style={styles.tileRow}>
                <Tile value={totalKept / 100} information="kept" tone="success"/>
                <Tile value={totalFailed / 100} information="lost" tone="danger"/>
                <Tile value={percentage} information="kept rate" percentage/>
              </View>

              <Text style={styles.sectionLabel}>Ledger</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nothing charged yet.</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </SafeAreaView>
    )

}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // padding lives here, not on the page, so the scroll bar hugs the screen edge
  content: {
    padding: spacing.md,
  },
  // the stack above the ledger: title, risk card, tiles, section label
  header: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headline: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  riskCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  riskAmount: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // FlatList has no gap prop — a separator view is how rows get breathing room
  rowGap: {
    height: spacing.sm,
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borders,
    borderRadius: radius.card,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13.5,
  },
});
