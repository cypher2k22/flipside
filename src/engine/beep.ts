import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSettings } from '../store';
import type { SoundTheme } from './feel';

const SOUNDS: Record<SoundTheme, number> = {
  beep: require('../../assets/sounds/beep.ogg'), chime: require('../../assets/sounds/chime.wav'),
  bell: require('../../assets/sounds/bell.wav'), drop: require('../../assets/sounds/drop.wav'),
};

/** Sound for the end of a Pomodoro focus or break, in the chosen theme. Mixes with music and focus sounds. */
export async function playBeep(theme?: SoundTheme) {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers' });
    const p = createAudioPlayer(SOUNDS[typeof theme === 'string' ? theme : useSettings.getState().soundTheme]);
    p.volume = 1;
    p.play();
    setTimeout(() => { try { p.remove(); } catch { /* already released */ } }, 2500);
  } catch { /* audio unavailable: the notification still rings */ }
}
