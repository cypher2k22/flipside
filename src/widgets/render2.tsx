import { FlexWidget, TextWidget, type ColorProp } from 'react-native-android-widget';
import { getSettings, migrate, sessionsBetween } from '../db';
import { listGoals, periodOf } from '../goals';
import { liftsBetween } from '../lifts';
import { dailyTotals, focusScore, sessionsIn, streaks, totalMs } from '../stats';
import { addDays, DAY, fmtDur, setWeekStart, startOfDay, startOfWeek } from '../util';

const C: Record<string, ColorProp> = { bg: '#14141C', surface2: '#1C1C27', text: '#F4F4F8', muted: '#8B8BA0', a: '#FFB547', b: '#FF6B6B' };
const wrap = (children: any, uri = 'flipside://') => (
  <FlexWidget clickAction="OPEN_URI" clickActionData={{ uri }} style={{ height: 'match_parent', width: 'match_parent', backgroundColor: C.bg, borderRadius: 24, padding: 12 }}>{children}</FlexWidget>
);

/** Goals (tap a row to tick it off) and weekly Metrics widgets. */
export async function renderMore(name: 'Goals' | 'Metrics', _width: number) {
  await migrate();
  const now = Date.now(), st = await getSettings();
  if (st.weekStart) setWeekStart(JSON.parse(st.weekStart) === 'sun' ? 0 : 1);
  if (name === 'Goals') {
    const day = await listGoals('day', periodOf('day', now)), week = await listGoals('week', periodOf('week', now));
    const wkDone = week.filter((g) => g.done).length;
    return wrap(
      <>
        <TextWidget text={`Goals · ${day.filter((g) => g.done).length}/${day.length}${week.length ? `   Week ${wkDone}/${week.length}` : ''}`} style={{ fontSize: 13, fontWeight: '700', color: C.text }} maxLines={1} />
        {day.length === 0 && <TextWidget text="Add goals in the Plan tab" style={{ fontSize: 12, color: C.muted, marginTop: 6 }} />}
        {day.slice(0, 4).map((g) => (
          <FlexWidget key={g.id} clickAction="TOGGLE_GOAL" clickActionData={{ id: g.id, done: !!g.done }} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <FlexWidget style={{ width: 16, height: 16, borderRadius: 5, marginRight: 8, borderWidth: 2, borderColor: g.done ? C.a : C.muted, backgroundColor: g.done ? C.a : C.bg }} />
            <TextWidget text={g.text} style={{ fontSize: 13, color: g.done ? C.muted : C.text }} maxLines={1} />
          </FlexWidget>
        ))}
        {day.length > 4 && <TextWidget text={`+${day.length - 4} more`} style={{ fontSize: 11, color: C.muted, marginTop: 4 }} />}
      </>, 'flipside://plan');
  }
  const ss = await sessionsBetween(addDays(startOfDay(now), -60), now + DAY), wk = startOfWeek(now), to = now + DAY;
  const total = totalMs(ss, wk, to), days = Math.max(1, Math.ceil((now - wk) / DAY));
  const score = focusScore(sessionsIn(ss, wk, to)), lifts = (await liftsBetween(wk, to)).length;
  const tile = (k: string, v: string) => (
    <FlexWidget style={{ flex: 1, backgroundColor: C.surface2, borderRadius: 14, padding: 8, marginHorizontal: 3 }}>
      <TextWidget text={k} style={{ fontSize: 10, color: C.muted }} maxLines={1} />
      <TextWidget text={v} style={{ fontSize: 17, fontWeight: '700', color: C.text }} maxLines={1} />
    </FlexWidget>
  );
  return wrap(
    <>
      <TextWidget text="This week" style={{ fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 6 }} />
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent' }}>{tile('Total', fmtDur(total))}{tile('Per day', fmtDur(total / days))}{tile('Streak', `${streaks(dailyTotals(ss, now, 60), st.restDay ? JSON.parse(st.restDay) : true).current}d`)}</FlexWidget>
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', marginTop: 6 }}>{tile('Focus score', score == null ? '–' : String(score))}{tile('Lifts', String(lifts))}</FlexWidget>
    </>, 'flipside://stats');
}
