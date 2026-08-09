import { StyleSheet } from "react-native";
import {colors, spacing, radius} from "@/constants/design";
import {View, Text} from "react-native";






type TileProps = { 
    value: number;
    information: string;
    tone?: 'danger' | 'success' | 'neutral';
    percentage?: boolean
}


export function Tile ( 
    {value, information, tone, percentage }: TileProps
) { 


    return (
        <View style = {styles.tile}>
            <Text style ={
                [
                    styles.value, tone === 'danger' ? {color:colors.danger}: 
                    tone === 'success'? {color: colors.success}: 
                    {color: colors.text} 
                ]
                
            }>
               {percentage ? `${value}%` : `£${value.toFixed(2)}`}

            </Text>
            <Text style = {
                styles.label
            }>
                {information}
            </Text>


        </View>
    );
}



const styles = StyleSheet.create({
  tile: {
    flex: 1,                          // share the row's width equally with sibling tiles
    backgroundColor: colors.card,     // the standard surface, same as CommitmentRow
    borderWidth: 1,
    borderColor: colors.borders,      // hairline edge — cards are "edged", not shadowed
    borderRadius: radius.card,
    padding: spacing.md,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',                // the number is the point — make it loud
    color: colors.text,               // overridden when a tone is passed
    fontVariant: ['tabular-nums'],    // digits get equal width, so numbers don't jitter
  },
  label: {
    fontSize: 11.5,
    color: colors.textMuted,          // quiet: it's the caption, not the content
    marginTop: spacing.xs,
  },
});
