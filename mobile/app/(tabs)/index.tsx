import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';

import { spacing, colors, radius } from '@/constants/design';
import {AppButton} from '@/components/app-button';
import { CommitmentRow } from '@/components/CommitmentRow';
import { useAuthToken } from '@/hooks/use-auth-token';
import { Commitment } from '@/constants/types';
import { Tile } from '@/components/tile';
import FocusButton from '@/components/Focus';
import { useRouter } from 'expo-router';
import HeroCard from '@/components/hero-card';
import {useCommitments} from '@/hooks/use-commitments';


const numbersToWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 
  'Seven',
  'Eight', 'Nine', 'Ten'
]












export default function HomeScreen() {

  const router = useRouter();
  const {commitments, loadCommitments} = useCommitments()




  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommitments();
    setRefreshing(false);
    
      
    }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    });
  
  const active = commitments.filter(t => t.status === 'active');
  const atRisk = active.reduce((sum,c) => sum + c.stake_pence, 0) / 100;
  
  const numOfActiveCommitments = active.length
  
  const completed = commitments.filter(t => t.status === 'completed');
  const saved = completed.reduce((sum, c) => sum + c.stake_pence, 0)/100;
  const numOfSavedCommitments = completed.length;
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0,0,0,0);
  const dueToday = active.filter(t=> new Date(t.deadline).getTime() < tomorrow.getTime() );
    


  const toWords = numbersToWords[dueToday.length] ?? dueToday.length;


  const next = [...active].sort((a,b) => new Date(a.deadline).getTime()
    - new Date(b.deadline).getTime())[0];
  


  return (

    <SafeAreaView style={styles.page} edges={['top']}>
    <FlatList
      data = {dueToday}
      renderItem={({item}) => <CommitmentRow commitment={item} onPress = { ()=> router.push(`/focus/${item.id}`)} />}
      keyExtractor={item => (item.id).toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.headingBlock}>
            <Text style={styles.sectionLabel}>{today}</Text>
            <Text style={styles.headline}>
              {toWords} {dueToday.length === 1 ? 'thing' : 'things'} due before midnight.
            </Text>
          </View>
          {next && (
            <HeroCard commitment = {next}/>
          )}
          <View style = {styles.tileRow}>
            <Tile value = {atRisk} information= {`at risk | ${numOfActiveCommitments} live`} tone = 'danger'/>
            <Tile value = {saved} information = {`saved | ${numOfSavedCommitments} completed`} tone = {'success'}/>
          </View>
        </View>}
      ListEmptyComponent={
        <View style = {styles.empty}>
          <Text style = {styles.emptyText}>Nothing Due Today</Text>
        </View>
      }
      refreshing = {refreshing}
      onRefresh={handleRefresh}
      style={styles.page}
      contentContainerStyle={styles.content}
      />
      {next && (
        <FocusButton title = {`Start Focus: £${(next.stake_pence/100).toFixed(2)} At Risk `}
      onPress ={() => router.push(`/focus/${next.id}`)}
      />
      )}
      
    </SafeAreaView>




      
          
          
       

  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  // the whole header block: date + headline, hero card, tiles.
  // one gap here is what stops the tiles butting into the card.
  header: {
    gap: spacing.md,
  },
  // date and headline are a pair, so they sit tighter than the gap above
  headingBlock: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headline: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 32,                   // above the font size, or two lines crush together
    letterSpacing: -0.5,              // big type needs tightening, small type doesn't
  },
  footer: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  timer: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '300',
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  module: {
    color: colors.textMuted,
    fontSize: 13.5,
  },
  countdown: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
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
