import { db } from './db';
import { addDays, dayKey, startOfWeek } from './util';

export interface Goal { id: number; scope: 'day' | 'week'; period: string; text: string; done: number; task_id: number }
export type Scope = Goal['scope'];

/** day → YYYY-MM-DD, week → key of the week's first day (same start day as stats) */
export const periodOf = (scope: Scope, ts: number) => dayKey(scope === 'week' ? startOfWeek(ts) : ts);
export const nextPeriod = (scope: Scope, ts: number) => periodOf(scope, addDays(scope === 'week' ? startOfWeek(ts) : ts, scope === 'week' ? 7 : 1));

export const listGoals = async (scope: Scope, period: string) =>
  (await db()).getAllAsync<Goal>('SELECT * FROM goals WHERE scope=? AND period=? ORDER BY done, id', scope, period);
export const addGoal = async (scope: Scope, period: string, text: string, taskId = 0) =>
  void (await (await db()).runAsync('INSERT INTO goals(scope,period,text,task_id) VALUES(?,?,?,?)', scope, period, text, taskId));
export const toggleGoal = async (id: number, done: boolean) => void (await (await db()).runAsync('UPDATE goals SET done=? WHERE id=?', done ? 1 : 0, id));
export const deleteGoal = async (id: number) => void (await (await db()).runAsync('DELETE FROM goals WHERE id=?', id));
/** Moves every unfinished goal of a period to the next one. Returns how many moved. */
export async function carryOver(scope: Scope, from: string, to: string) {
  const r = await (await db()).runAsync('UPDATE goals SET period=? WHERE scope=? AND period=? AND done=0', to, scope, from);
  return r.changes;
}
