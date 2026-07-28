import { useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { useFocusEffect } from 'expo-router';
import {Text, View} from "react-native"
import { API_URL } from "@/constants/api";
import { spacing, colors, radius } from "@/constants/design";
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
        <View style = { styles.page }>
        <View style = {styles.section}>
                    <Text style = {styles.sectionLabel}>Ledger</Text>
                    {transactions.map((t) => (
                      <Text key = {t.id} style = {styles.ledgerEntries}>£{(t.amount_pence / 100).toFixed(2)} - {t.reason}</Text>
                    ))}
                  </View>
        </View> 
    )
}

const styles = StyleSheet.create({
    page: {
      flex: 1, 
      backgroundColor: colors.bg,
      padding: spacing.md 
    },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
},
  ledgerEntries:{
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.25,
  }
});