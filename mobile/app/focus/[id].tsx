import { useFocusEffect, useLocalSearchParams, useRouter} from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import FocusButton from '@/components/Focus';
import { useAuthToken } from "@/hooks/use-auth-token";
import { useState, useEffect } from "react";
import { API_URL } from "@/constants/api";
import { Commitment } from "@/constants/types";
import { spacing, colors } from '@/constants/design';
import { SafeAreaView } from "react-native-safe-area-context";




export default function FocusSession() {
    const{id} = useLocalSearchParams();
    
    const {token, logout} = useAuthToken();
    const [commitment, setCommitment] = useState<Commitment| null>(null);
    const [running, setRunning] = useState(false);
    const [now, setNow] = useState(Date.now());
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [bank, setBank] = useState(0);

    const router = useRouter();





  const loadCommitment = async() => {
        const response = await fetch(`${API_URL}/commitments/`, {
          headers: {Authorization: 'Bearer ' + token}
        });
                if (response.status === 401) {
                logout();
                return;}
        const data = await response.json() ;
        const found = data.find((t: Commitment)=> t.id === Number(id))

        if (!response.ok) {
          console.log('commitments fetch failed', response.status, data)
          return;
        };
        setCommitment(found);

      };
    useEffect( () => {
        if (token) {
            loadCommitment();
        }}, [token]);
        //AFter a render if the token has changed, run it again

    // the ticking clock — same effect as Today used to run
    useEffect(() => {
        if (!running) return;
        const tick = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(tick);
    }, [running]);

    
      const handleCheckin = async(id: number) => {
        const response = await fetch(`${API_URL}/commitments/${id}/checkins/`, {
          method:  'POST',
          headers: {Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
    
          },
          body: JSON.stringify({focus_seconds:seconds}),
    
    
        });
                if (response.status === 401) {
                logout();
                return;}
        const data = await response.json()
        if (!response.ok) {console.log('checkin failed', response.status, data);
          return;
        };
        setRunning(false);
        setBank(0);
        setStartedAt(null);
        loadCommitment();
        router.back() 
    
      };


    const elapsedMs = bank + (running && startedAt? now - startedAt: 0 );
    const seconds = Math.floor(elapsedMs/1000);
    const mins = Math.floor(seconds/60);
    const secs = seconds %60;
    const clock = `${mins}:${String(secs).padStart(2, '0')}`;

    const requiredMins = commitment ? commitment.required_seconds / 60 : 0;
    const bar = commitment ? Math.min(seconds / commitment.required_seconds, 1) : 0;


    const handleStartPause = () => {
     if (running) {
      if (startedAt) setBank(bank +(Date.now() - startedAt));
     }
     else {
      setStartedAt(Date.now());
     }
     setRunning(!running)

    }

    





    return (
    <SafeAreaView style={styles.page} edges={['top']}>
        {commitment && (
            <View style={styles.content}>
                {/* top block: what you're working on */}
                <View style={styles.top}>
                    <Text style = {styles.eyebrow}>
                        FOCUS SESSION
                    </Text>
                    <Text style = {styles.title}>
                        {commitment.task.title}
                    </Text>
                    <Text style = {styles.meta}>
                        {commitment.module_title} · {requiredMins} min required
                    </Text>
                </View>

                {/* middle block: the live session */}
                <View style={styles.middle}>
                    <Text style={styles.clock}>{clock}</Text>
                    <Text style={styles.caption}>of {requiredMins}:00 tracked</Text>
                    <View style={styles.track}>
                        <View style={[styles.fill, { width: `${bar * 100}%` }]} />
                    </View>
                </View>

                {/* bottom block: controls */}
                <View style={styles.bottom}>
                    <FocusButton
                        title={running ? 'Pause session' : 'Start session'}
                        onPress={() => handleStartPause()}
                        selected={running}
                    />
                    <FocusButton
                        title={'Check in session'}
                        onPress={()=>{
                          handleCheckin(commitment.id)
                           
                         }}
                        />
                </View>
            </View>
        )}
    </SafeAreaView>
    )
}


const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,                          // fill the SafeAreaView so space-between has room to work
    padding: spacing.md,
    justifyContent: 'space-between',  // top block up, controls down, clock floats between
    alignItems: 'center',
  },
  top: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  middle: {
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',             // un-shrink: parent centers children, the bar needs full width
  },
  clock: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  bottom: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  // this screen's type runs bigger than the cards' — it's viewed mid-session,
  // often with the phone propped at arm's length
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    textAlign: 'center',              // top block centers the box; this centers wrapped lines inside it
  },
  meta: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 14,
  },

  // progress bar
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',               // clips the fill to the rounded corners
    alignSelf: 'stretch',             // full width even inside a centering parent
    marginTop: spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    // width is set inline as a percentage — it's data, not styling
  },
});
