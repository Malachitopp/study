import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { AppButton } from "@/components/app-button";
import { API_URL } from "@/constants/api";
import { spacing, colors, radius } from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";
import { SafeAreaView } from "react-native-safe-area-context";
import { Account } from "@/constants/types";

export default function Me() {
    const { token, logout } = useAuthToken();
    const [account, setAccount] = useState<Account | null>(null);

    const loadAccount = async () => {
        try {
            const response = await fetch(`${API_URL}/users/me`, {
                headers: { Authorization: 'Bearer ' + token },
            });
            if (response.status === 401) {
                logout(); return;
            }
            if (!response.ok) { console.log('account fetch failed', response.status); return; }
            const data = await response.json();   // parse only on ok — error bodies aren't guaranteed JSON
            setAccount(data);
        } catch (e) {
            console.log('account fetch failed', e);   // server down / network gone: retried on next focus
        }
    };

    useFocusEffect(useCallback(() => { if (token) loadAccount(); }, [token]));

    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <View style={styles.content}>
            <Text style={styles.headline}>Me</Text>

            <Text style={styles.sectionLabel}>Account</Text>
            <View style={styles.card}>
                <View style={styles.cardRow}>
                    <Text style={styles.rowLabel}>Email</Text>
                    <Text style={styles.rowValue} numberOfLines={1}>
                        {account ? account.email : '—'}
                    </Text>
                </View>
            </View>

            {/* logout ends the session; cancel variant keeps it quieter than a CTA */}
            <AppButton title="Log out" cancel onPress={logout}/>
        </View>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
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
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 14.5,
    fontWeight: '600',
  },
  rowValue: {
    color: colors.textMuted,
    fontSize: 14.5,
    flexShrink: 1,
  },
});
