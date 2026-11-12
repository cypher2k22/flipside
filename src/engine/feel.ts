import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';
import { useSettings } from '../store';

export type HapticTheme = 'classic' | 'gentle' | 'sharp' | 'pulse';
export type SoundTheme = 'beep' | 'chime' | 'bell' | 'drop';
export type Cue = 'start' | 'stop' | 'pause' | 'lift' | 'phase';

export const HAPTIC_THEMES: HapticTheme[] = ['classic', 'gentle', 'sharp', 'pulse'];
export const SOUND_THEMES: SoundTheme[] = ['beep', 'chime', 'bell', 'drop'];

/** Android vibration patterns: [wait, buzz, wait, buzz, ...] in ms. */
const PATTERNS: Record<HapticTheme, Record<Cue, number | number[]>> = {
  classic: { start: 60, stop: [0, 60, 90, 60], pause: 250, lift: 40, phase: [0, 80, 80, 80] },
  gentle: { start: 30, stop: [0, 30, 120, 30], pause: 120, lift: 20, phase: [0, 40, 150, 40] },
  sharp: { start: 20, stop: [0, 20, 40, 20, 40, 20], pause: [0, 20, 40, 60], lift: 15, phase: [0, 25, 60, 25, 60, 25] },
  pulse: { start: [0, 40, 60, 40, 60, 80], stop: [0, 80, 60, 40, 60, 40], pause: [0, 150, 100, 150], lift: [0, 30, 60, 30], phase: [0, 100, 100, 100, 100, 200] },
};
/** Feel of in-app taps per theme. */
const TAP: Record<HapticTheme, Haptics.ImpactFeedbackStyle> = {
  classic: Haptics.ImpactFeedbackStyle.Light, gentle: Haptics.ImpactFeedbackStyle.Soft,
  sharp: Haptics.ImpactFeedbackStyle.Rigid, pulse: Haptics.ImpactFeedbackStyle.Medium,
};

export const cue = (k: Cue, theme = useSettings.getState().hapticTheme) => { if (useSettings.getState().vibrate) Vibration.vibrate(PATTERNS[theme][k]); };
export const tapFeel = () => { const c = useSettings.getState(); if (c.haptics) Haptics.impactAsync(TAP[c.hapticTheme]).catch(() => {}); };
