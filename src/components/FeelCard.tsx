import { Segmented } from './controls';
import { Btn, Card, Txt } from './ui';
import { playBeep } from '../engine/beep';
import { cue, HAPTIC_THEMES, SOUND_THEMES, type HapticTheme, type SoundTheme } from '../engine/feel';
import { tr } from '../i18n';
import { useSettings } from '../store';
import { space } from '../theme';

const cap = (s: string) => tr(s[0].toUpperCase() + s.slice(1));

/** Haptic and sound theme pickers; picking one plays it. */
export function FeelCard({ i }: { i?: number }) {
  const { hapticTheme, soundTheme, set } = useSettings();
  return (
    <Card i={i} style={{ marginHorizontal: space(4), gap: space(3) }}>
      <Txt v="label">Haptic theme</Txt>
      <Segmented<HapticTheme> options={HAPTIC_THEMES.map((v) => ({ v, label: cap(v) }))} value={hapticTheme}
        onChange={(v) => { set('hapticTheme', v); cue('stop', v); }} />
      <Txt v="label">Sound theme</Txt>
      <Segmented<SoundTheme> options={SOUND_THEMES.map((v) => ({ v, label: cap(v) }))} value={soundTheme}
        onChange={(v) => { set('soundTheme', v); playBeep(v); }} />
      <Txt v="small">Haptics need Vibrate on. The sound plays when a Pomodoro focus or break ends.</Txt>
      <Btn kind="ghost" label="Test sound" onPress={() => playBeep()} />
    </Card>
  );
}
