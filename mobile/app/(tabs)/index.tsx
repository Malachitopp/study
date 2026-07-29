import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router'
import { API_URL } from '@/constants/api';
import { spacing, colors } from '@/constants/design';
import {AppButton} from '@/components/app-button';
import { CommitmentRow } from '@/components/CommitmentRow';
import { useAuthToken } from '@/hooks/use-auth-token';
import { Commitment } from '@/constants/types';
import { Tile } from '@/components/tile';








export default function HomeScreen() {
  const {token, logout} = useAuthToken() 

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





  const handleCheckin = async(id: number) => {
    const response = await fetch(`${API_URL}/commitments/${id}/checkins/`, {
      method:  'POST',
      headers: {Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',

      },
      body: JSON.stringify({focus_seconds:seconds}),


    });
            if (response.status === 401) {
            logout();
            return;}
    const data = await response.json()
    if (!response.ok) {console.log('checkin failed', response.status, data);
      return;
    };
    setRunning(false);
    setSeconds(0);
    loadCommitments();

  };

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




  const next = [...active].sort((a,b) => new Date(a.deadline).getTime()
    - new Date(b.deadline).getTime())[0];
  
  const [ now, setNow] = useState(Date.now());
  
  const msLeft = next ? new Date(next.deadline).getTime() - now:0;
  const totalMinutes = Math.floor(msLeft/60000)
  const hours = Math.floor(totalMinutes/60) 
  const minutes = totalMinutes%60 





  return (

    <FlatList
      data = {commitments}
      renderItem = { ({item}) => (
        <CommitmentRow commitment={item} onCheckin={handleCheckin}/>
      )}
      keyExtractor={item => (item.id).toString()}
      ListHeaderComponent={
        <View>
          <Text style ={styles.sectionLabel}>{today}</Text>
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
                  <Text style = {styles.stake}> £{Math.round(next.stake_pence/100).toFixed(2)}</Text>
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
            <AppButton title={running ? 'Pause' : 'Start'} onPress={() => setRunning(!running)} />



            <Text style={styles.timer}>{seconds}s</Text>
        </View>}
      refreshing = {refreshing}
      onRefresh={handleRefresh}
      style={styles.page}
      contentContainerStyle={styles.content}
      />




      
          
          
       

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
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
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

  // progress bar
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',               // clips the fill to the rounded corners
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    // width is set inline as a percentage — it's data, not styling
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  }
});
