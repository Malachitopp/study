import { StyleSheet } from "react-native";
import { View } from "react-native";
import { AppButton } from "@/components/app-button";
import { spacing, colors, radius } from "@/constants/design";
import { useAuthToken } from "@/hooks/use-auth-token";


export default function Me() {
    const { logout } = useAuthToken()

    return ( 
        <View style = {styles.page}>
            <AppButton title = "log out" onPress={logout}/>
        </View>
        
    )
}

const styles = StyleSheet.create({
  page: {
    flex: 1, 
    backgroundColor: colors.bg,
    padding: spacing.md 
  },
});


