import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '@/constants/design';

type AppButtonProps = {
    title:string;
    onPress: () => void;
    selected?: boolean 
    cancel?: boolean
    ghost?: boolean 
};

export function AppButton({title, onPress, selected, cancel, ghost }: AppButtonProps) {
    

    
    return (
        <Pressable style={({pressed}) => [
            styles.button,
            {opacity: pressed ? 0.8 : 1},
            selected && styles.selected,
            cancel && styles.cancelled,
            ghost && styles.ghost 
            
        ]} onPress={(onPress)}>
            <Text style={[styles.text, ghost && styles.ghostText]}>{title}</Text>
        </Pressable>
        
        );
    }


const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical:spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.button,
        elevation: 3,
        backgroundColor: colors.accent,
        

        
    },
    text: {
        fontSize: 14,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: colors.text
    },
    selected: {
    backgroundColor: colors.success,
    },
    cancelled: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.danger,
    elevation: 0,
    },
    ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borders,
    borderStyle: 'dashed',
    elevation: 0,
},
    ghostText: {
        color: colors.textMuted,
        fontWeight: '600',
      
    }


});