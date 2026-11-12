import { Alert, View } from 'react-native';
import { requestPinWidget } from 'react-native-android-widget';
import { tr } from '../i18n';
import { space } from '../theme';
import { Btn, Card, Txt } from './ui';

const LIST: [string, string, string][] = [
  ['Today', 'Today', 'Time studied today, ring and streak'], ['Goals', 'Goals', 'Today\'s goals, tap to tick off'],
  ['Metrics', 'Weekly metrics', 'Week total, daily average, streak, focus score, lifts'], ['Week', 'Week', 'Bars for the last 7 days'],
  ['QuickStart', 'Quick start', 'Start the timer on your last task'], ['Subjects', 'Subjects', 'Jump into a subject'],
  ['Exam', 'Next exam', 'Countdown to your next exam'], ['Cards', 'Cards due', 'Flashcards waiting for review'],
];

/** Pins a home-screen widget (Android asks for confirmation). */
export function WidgetsCard({ i }: { i?: number }) {
  const add = async (name: string) => {
    const ok = await requestPinWidget({ widgetName: name }).catch(() => false);
    if (!ok) Alert.alert(tr('Add from your home screen'), tr('Long-press an empty spot on the home screen, tap Widgets, then pick Flipside.'));
  };
  return (
    <Card i={i} style={{ marginHorizontal: space(4), gap: space(3) }}>
      <Txt v="label">Home-screen widgets</Txt>
      {LIST.map(([name, label, hint]) => (
        <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
          <View style={{ flex: 1 }}><Txt v="h3" raw>{label}</Txt><Txt v="small">{hint}</Txt></View>
          <Btn kind="ghost" label="Add" onPress={() => add(name)} style={{ minWidth: 72 }} />
        </View>
      ))}
    </Card>
  );
}
