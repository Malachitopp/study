import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router'
import { API_URL } from '@/constants/api';
import { spacing, colors, radius } from '@/constants/design';
import {AppButton} from '@/components/app-button';
import { CommitmentRow } from '@/components/CommitmentRow';
import { useAuthToken } from '@/hooks/use-auth-token';
import { Commitment } from '@/constants/types';
import { Tile } from '@/components/tile';
import FocusButton from '@/components/Focus';
import { useRouter } from 'expo-router';


const numbersToWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 
  'Seven',
  'Eight', 'Nine', 'Ten'
]












export default function HomeScreen() {
  const {token, logout} = useAuthToken() 
  const router = useRouter();

  const[commitments, setCommitments] = useState<Commitment[]>([]);

  const loadCommitments = async() => {
        const response = await fetch(`${API_URL}/commitments/`, {
          headers: {Authorization: 'Bearer ' + token}
        });
                if (response.status === 401) {
                logout();
                return;}
        const data = await response.json() ;
        if (!response.ok) {
          console.log('commitments fetch failed', response.status, data)
          return;
        };
        setCommitments(data);

      };


  const [seconds, setSeconds] = useState(0);
  const[running, setRunning] = useState(false);

  useEffect(()=>{
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => s + 1);

    }, 1000);
    return () => clearInterval(id);
  }, [running]);


    useEffect(() => {
    const id = setInterval( () => setNow(Date.now()),1000);
    return () => clearInterval(id);
  }, []);


    useFocusEffect(
    useCallback(() => {
        if (token) {loadCommitments()};
    }, [token])
    );

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
  
  const [ now, setNow] = useState(Date.now());
  
  const msLeft = next ? new Date(next.deadline).getTime() - now:0;
  const totalMinutes = Math.floor(msLeft/60000);
  const hours = Math.floor(totalMinutes/60) ;
  const minutes = totalMinutes%60 ;



  




  return (

    <SafeAreaView style={styles.page} edges={['top']}>
    <FlatList
      data = {dueToday}
      renderItem={({item}) => <CommitmentRow commitment={item}/>}
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
            <View style = {styles.card}>
              <View style = {styles.topRow}>
                <Text style = {styles.eyebrow}>
                  Next Deadline 
                </Text>
                <Text style = {styles.kind}>
                   {next.task.kind}
                </Text>
              </View>
              <View>
                <Text style = {styles.title}>
                  {next.task.title}
                </Text>
                <Text style = {styles.module}>
                  {next.module_title}
                </Text>
              </View>
              <View style = {styles.figures}>
                <View>
                  <Text style = {styles.countdown}>
                     {hours}<Text style ={styles.unit}>h</Text> { minutes }<Text style= {styles.unit}>m</Text>
                  </Text>
                </View> 
                <View style = {styles.right}>
                  <Text style = {styles.stake}>£{(next.stake_pence / 100).toFixed(2)}</Text>
                  <Text style = {styles.caption}>at stake</Text>
                </View> 
              </View>
            </View>
           


          )}
          <View style = {styles.tileRow}>
            <Tile value = {atRisk} information= {`at risk | ${numOfActiveCommitments} live`} tone = 'danger'/>
            <Tile value = {saved} information = {`saved | ${numOfSavedCommitments} completed`} tone = {'success'}/>
          </View>
        </View>}
      ListFooterComponent={
        <View style={styles.footer}>
            <Text style={styles.timer}>{seconds}s</Text>
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

      <FocusButton title = {`Start Focus: £${atRisk} At Risk `}
      onPress ={() => router.push(`/focus/${next.id}`)}
      />
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
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accentBorder,   // rgba(92,108,255,.35) — tinted, so it glows
    borderRadius: 18,
    padding: spacing.md,
    gap: spacing.sm,
  },

  // top row: "NEXT DEADLINE" ......... "Problem sheet"
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  kind: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: '500',
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

  // bottom row: countdown on the left, stake on the right
  figures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  countdown: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 22,
    color: colors.textMuted,          // the "h" and "m" sit quieter than the numbers
  },
  stake: {
    color: colors.danger,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  right: { alignItems: 'flex-end' },
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
