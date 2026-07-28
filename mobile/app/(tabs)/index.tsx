import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router'
import { API_URL } from '@/constants/api';
import { spacing, colors } from '@/constants/design';
import {AppButton} from '@/components/app-button';
import { CommitmentRow } from '@/components/CommitmentRow';
import { useAuthToken } from '@/hooks/use-auth-token';










export default function HomeScreen() {
  const {token, logout} = useAuthToken() 

  const[commitments, setCommitments] = useState<{id:number; stake_pence: number;
    deadline: string; status: string; task_title: string;
  }[]>([]);

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
  

  
  return (
    <FlatList
      data = {commitments}
      renderItem = { ({item}) => (
        <CommitmentRow commitment={item} onCheckin={handleCheckin}/>
      )}
      keyExtractor={item => (item.id).toString()}
      ListHeaderComponent={<Text style={styles.sectionLabel}>Your Commitments</Text>}
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
});
