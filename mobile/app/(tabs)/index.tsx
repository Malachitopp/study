import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router'
import { API_URL } from '@/constants/api';
import { spacing } from '@/constants/design';
import {AppButton} from '@/components/app-button';
import { CommitmentRow } from '@/components/CommitmentRow';
import { useAuthToken } from '@/hooks/use-auth-token';
import { FlatList } from 'react-native';










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
      ListHeaderComponent={<ThemedText type = "subtitle"> Your Commitments</ThemedText>}
      ListFooterComponent={
        <ThemedView>
            <AppButton title={running ? 'Pause' : 'Start'} onPress={() => setRunning(!running)} />
            <ThemedText>{seconds}s</ThemedText>
        </ThemedView>}
      refreshing = {refreshing}
      onRefresh={handleRefresh}
      />




      
          
          
       

  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
