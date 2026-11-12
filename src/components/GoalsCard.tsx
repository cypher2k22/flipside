import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useData } from '../data';
import { addGoal, carryOver, deleteGoal, listGoals, nextPeriod, periodOf, toggleGoal, type Goal, type Scope } from '../goals';
import { restoreRow } from '../db';
import { refreshWidgets } from '../widgets/refresh';
import { tr } from '../i18n';
import { totalMs } from '../stats';
import { font, radius, space, useTheme } from '../theme';
import { useUndo } from '../undo';
import { addDays, fmtDur, keyToTs, startOfWeek } from '../util';
import { Segmented } from './controls';
import { Btn, Card, Txt, tap } from './ui';

/** Checklist for the selected day or its week. `taskId` (if any) is linked to new goals so ▶ can start the timer. */
export function GoalsCard({ date, taskId }: { date: string; taskId: number }) {
  const t = useTheme(), sessions = useData((s) => s.sessions), tasks = useData((s) => s.tasks);
  const [scope, setScope] = useState<Scope>('day'), [goals, setGoals] = useState<Goal[]>([]), [text, setText] = useState('');
  const ts = keyToTs(date), period = periodOf(scope, ts);
  const load = useCallback(() => { refreshWidgets(); return listGoals(scope, period).then(setGoals); }, [scope, period]);
  useEffect(() => { load(); }, [load]);

  const add = async () => { if (!text.trim()) return; await addGoal(scope, period, text.trim(), taskId); setText(''); load(); };
  const del = async (g: Goal) => { await deleteGoal(g.id); load(); useUndo.getState().show('Goal deleted', async () => { await restoreRow('goals', g); load(); }); };
  const carry = async () => { const n = await carryOver(scope, period, nextPeriod(scope, ts)); tap(); load(); if (n) useUndo.getState().show(tr('{n} goals moved', { n }), async () => { await carryOver(scope, nextPeriod(scope, ts), period); load(); }); };

  const done = goals.filter((g) => g.done).length, open = goals.length - done;
  const wk = startOfWeek(ts), target = tasks.filter((k) => !k.parent_id).reduce((n, k) => n + k.weekly_goal_min, 0);
  const wkMs = totalMs(sessions, wk, addDays(wk, 7));
  return (
    <Card style={{ marginHorizontal: space(4), gap: space(3) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt v="label">Goals</Txt><Txt v="small" raw>{goals.length ? `${done}/${goals.length}` : ''}</Txt>
      </View>
      <Segmented options={[{ v: 'day', label: tr('Today') }, { v: 'week', label: tr('This week') }]} value={scope} onChange={setScope} />
      {scope === 'week' && target > 0 && <Txt v="small" raw>{`${tr('Weekly target')}: ${fmtDur(wkMs)} / ${fmtDur(target * 60000)}`}</Txt>}
      {goals.map((g) => (
        <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: space(3) }}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !!g.done }} onPress={() => { tap(); toggleGoal(g.id, !g.done).then(load); }}
            style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: g.done ? t.accentA : t.border, backgroundColor: g.done ? t.accentA : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {!!g.done && <Txt v="small" raw c="#1A1206">✓</Txt>}
          </Pressable>
          <Txt raw style={{ flex: 1, opacity: g.done ? 0.5 : 1, textDecorationLine: g.done ? 'line-through' : 'none' }}>{g.text}</Txt>
          {g.task_id > 0 && !g.done && (
            <Pressable accessibilityLabel={tr('Start timer')} onPress={() => { tap(); router.push(`/timer?task=${g.task_id}`); }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Txt v="h3" raw c={t.accentText}>▶</Txt>
            </Pressable>
          )}
          <Pressable accessibilityLabel={tr('Delete')} onPress={() => del(g)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Txt raw c={t.muted}>✕</Txt>
          </Pressable>
        </View>
      ))}
      <TextInput value={text} onChangeText={setText} onSubmitEditing={add} returnKeyType="done" placeholder={tr(scope === 'day' ? 'Add a goal for today' : 'Add a goal for this week')} placeholderTextColor={t.muted}
        style={{ minHeight: 48, borderRadius: radius.sm, backgroundColor: t.surface2, color: t.text, paddingHorizontal: space(3), fontFamily: font.body, fontSize: 15 }} />
      {open > 0 && <Btn kind="ghost" label={scope === 'day' ? 'Move unfinished to tomorrow' : 'Move unfinished to next week'} onPress={carry} />}
    </Card>
  );
}
