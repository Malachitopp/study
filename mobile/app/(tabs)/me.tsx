import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { AppButton } from "@/components/app-button";
import { spacing } from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";


export default function Me() {
    const { logout } = useAuthToken()

    return ( 
        <ThemedView style = {styles.page}>
            <AppButton title = "log out" onPress={logout}/>
        </ThemedView>
        
    )
}

const styles = StyleSheet.create({
  page: {
    padding: spacing.md,
    gap: spacing.md,
  },
});


