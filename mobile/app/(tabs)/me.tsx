import { StyleSheet } from "react-native";
import { View , Text} from "react-native";
import { AppButton } from "@/components/app-button";
import { spacing, colors, radius } from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Me() {
    const { logout } = useAuthToken()

    return ( 
      <SafeAreaView style={styles.page} edges={['top']}>
        <View style = {styles.page}>
          <Text style = {styles.title}>Log Out </Text>
            <AppButton title = "log out" onPress={logout}/>
        </View>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  page: {
    flex: 1, 
    backgroundColor: colors.bg,
    padding: spacing.md 
  },
    title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
});


