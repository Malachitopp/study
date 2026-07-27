import { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { useFocusEffect } from 'expo-router';
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { API_URL } from "@/constants/api";
import { spacing } from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";




export default function Money() {
    const {token, logout}  = useAuthToken() 

    const [transactions, setTransactions] = useState<{id:number; 
        amount_pence: number; reason: string
        }[]>([]);

      const loadTransactions = async () => {
          const response = await fetch(`${API_URL}/transactions/`, {
            method: 'GET',
            headers: {Authorization: 'Bearer ' + token},
          });
                  if (response.status === 401) {
                    logout(); return;
                  }
          const data = await response.json();
          if (!response.ok) {console.log('transactions fetch failed', response.status,
            data); return; } 
          
          setTransactions(data);
        };


          useFocusEffect(
          useCallback(() => {
              if (token) {loadTransactions()};
          }, [token])
          );
    

    return (
        <ThemedView style = { styles.page }>
        <ThemedView style = {styles.section}>
                    <ThemedText type = "subtitle">Ledger</ThemedText>
                    {transactions.map((t) => (
                      <ThemedText key = {t.id}>£{(t.amount_pence / 100).toFixed(2)} - {t.reason}</ThemedText>
                    ))}
                  </ThemedView>
        </ThemedView> 
    )
}

const styles = StyleSheet.create({
  page: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
});