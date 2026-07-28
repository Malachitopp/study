import { useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store'
import { TextInput, StyleSheet, View, Text } from "react-native";
import { API_URL } from "@/constants/api";
import { AppButton } from "@/components/app-button";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/constants/design";

export default function Login() {

    const router = useRouter()

    const[email, setEmail] = useState('') ;
    const[password, setPassword] = useState('');
    

      const handleLogin = async ()=>{
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded' },
          body: `username=${email}&password=${password}`,
        });
        const data = await response.json();
        if (!response.ok) { 
            console.log('Incorrect password or Username', response.status, data); return; }
        if (!data.access_token) {
            console.log("Access denied"); return;
        }
        await SecureStore.setItemAsync('token', data.access_token)
        router.replace('/')
      }
    

    return (
      <SafeAreaView style={styles.page} edges={['top']}>
        <View style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Study Stakes</Text>
                <Text style={styles.tagline}>
                    The plan is the point. The money is what makes you keep it.
                </Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='Email'
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize='none'
                    keyboardType='email-address'
                />

                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder='Password'
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                />

                <AppButton title={'Log in'} onPress={handleLogin} />
            </View>
        </View>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borders,
    borderRadius: radius.button,
    padding: spacing.md,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 15,
  },
});