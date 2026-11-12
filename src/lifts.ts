import { db } from './db';

export interface Lift { id: number; session_id: number; ts: number; dur_ms: number | null; reason: string }
/** Preset reasons for a lift; the English text is also what gets stored. */
export const REASONS = ['Phone', 'Noise', 'Hungry or thirsty', 'Tired', 'Bathroom', 'Someone talked to me', 'Other'] as const;

export const addLift = async (sessionId: number, ts: number) => Number((await (await db()).runAsync('INSERT INTO lifts(session_id,ts) VALUES(?,?)', sessionId, ts)).lastInsertRowId);
export const setLiftDur = async (id: number, ms: number) => void (await (await db()).runAsync('UPDATE lifts SET dur_ms=? WHERE id=?', ms, id));
export const setLiftReason = async (id: number, reason: string) => void (await (await db()).runAsync('UPDATE lifts SET reason=? WHERE id=?', reason, id));
export const liftsBetween = async (from: number, to: number) => (await db()).getAllAsync<Lift>('SELECT * FROM lifts WHERE ts>=? AND ts<? ORDER BY ts DESC', from, to);
