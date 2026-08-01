import {View, Text, StyleSheet} from 'react-native';
import {Commitment} from '@/constants/types';
import {colors, spacing} from '@/constants/design';
import {useState, useEffect} from 'react';



type HeroCardProps = {
    commitment: Commitment;
}






export default function HeroCard({commitment}: HeroCardProps) {
      const [ now, setNow] = useState(Date.now());
          useEffect(() => {
          const id = setInterval( () => setNow(Date.now()),1000);
          return () => clearInterval(id);
        }, []);
      
      const msLeft = new Date(commitment.deadline).getTime() - now;
      const totalMinutes = Math.floor(msLeft/60000);
      const hours = Math.floor(totalMinutes/60) ;
      const minutes = totalMinutes%60 ;

    return (
              <View style = {styles.card}>
              <View style = {styles.topRow}>
                <Text style = {styles.eyebrow}>
                  Next Deadline 
                </Text>
                <Text style = {styles.kind}>
                   {commitment.task.kind}
                </Text>
              </View>
              <View>
                <Text style = {styles.title}>
                  {commitment.task.title}
                </Text>
                <Text style = {styles.module}>
                  {commitment.module_title}
                </Text>
              </View>
              <View style = {styles.figures}>
                <View>
                  <Text style = {styles.countdown}>
                     {hours}<Text style ={styles.unit}>h</Text> { minutes }<Text style= {styles.unit}>m</Text>
                  </Text>
                </View> 
                <View style = {styles.right}>
                  <Text style = {styles.stake}>£{(commitment.stake_pence / 100).toFixed(2)}</Text>
                  <Text style = {styles.caption}>at stake</Text>
                </View> 
              </View>
            </View>
    )

}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.accentBorder,   // rgba(92,108,255,.35) — tinted, so it glows
        borderRadius: 18,
        padding: spacing.md,
        gap: spacing.sm,
      },
    
      // top row: "NEXT DEADLINE" ......... "Problem sheet"
      topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      eyebrow: {
        color: colors.accent,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
      },
      kind: {
        color: colors.textMuted,
        fontSize: 11.5,
        fontWeight: '500',
      },
    
      title: {
        color: colors.text,
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 22,
      },
      module: {
        color: colors.textMuted,
        fontSize: 13.5,
      },
    
      // bottom row: countdown on the left, stake on the right
      figures: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      },
      countdown: {
        color: colors.text,
        fontSize: 40,
        fontWeight: '700',
        letterSpacing: -1.5,
        fontVariant: ['tabular-nums'],
      },
      unit: {
        fontSize: 22,
        color: colors.textMuted,          // the "h" and "m" sit quieter than the numbers
      },
      stake: {
        color: colors.danger,
        fontSize: 22,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
      },
      caption: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: spacing.xs,
      },
      right: { alignItems: 'flex-end' },
      tileRow: {
        flexDirection: 'row',
        gap: spacing.sm,
      }
})


