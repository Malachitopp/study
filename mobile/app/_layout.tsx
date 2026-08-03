import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import {Gesture, GestureHandlerRootView} from 'react-native-gesture-handler'
import { colors } from '@/constants/design';

export const unstable_settings = {
  anchor: '(tabs)',
};

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    border: colors.borders,
    primary: colors.accent,
    text: colors.text,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style = {{flex:1}}>

      <ThemeProvider value={navTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="new-module" options={{ presentation: 'modal', title: 'New Module' }} />
          <Stack.Screen name="focus/[id]" options={{headerShown:false}}/>
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider> 
      
    </GestureHandlerRootView>
  );
}
