import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import type { Session } from '../db';
import { tr, weekdayShort } from '../i18n';
import { liftsBetween, REASONS, setLiftReason, type Lift } from '../lifts';
import { radius, space, useTheme } from '../theme';
import { addDays, DAY, fmtDur, startOfDay } from '../util';
import { Card, Txt, tap } from './ui';

const len = (ms: number | null) => (ms == null ? '–' : ms < 60000 ? `${Math.max(1, Math.round(ms / 1000))}s` : fmtDur(ms));

/** Every phone lift is logged automatically; tag a reason here whenever you like. */
export function Distractions({ ss }: { ss: Session[] }) {
  const t = useTheme(), [rows, setRows] = useState<Lift[]>([]), [pick, setPick] = useState<Lift | null>(null);
  const load = useCallback(() => liftsBetween(addDays(startOfDay(Date.now()), -29), Date.now() + DAY).then(setRows).catch(() => {}), []);
  useEffect(() => { load(); }, [load, ss]);

  const day = startOfDay(Date.now()), week = addDays(day, -6);
  const why = new Map<string, number>();
  for (const l of rows) if (l.reason) why.set(l.reason, (why.get(l.reason) ?? 0) + 1);
  const top = [...why].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([r, n]) => `${tr(r)} ×${n}`).join(' · ');
  const choose = async (reason: string) => { if (pick) await setLiftReason(pick.id, reason); setPick(null); tap(); load(); };

  return (
    <Card style={{ marginHorizontal: space(4), gap: space(2) }}>
      <Txt v="label">Phone lifts</Txt>
      {rows.length === 0 ? <Txt v="small">No lifts yet. Each time you lift the phone mid-session it is logged here.</Txt> : (
        <>
          <Txt v="h3" raw>{`${tr('Today')} ${rows.filter((l) => l.ts >= day).length} · ${tr('7 days')} ${rows.filter((l) => l.ts >= week).length} · ${tr('30 days')} ${rows.length}`}</Txt>
          {!!top && <Txt v="small" raw>{top}</Txt>}
          {rows.slice(0, 8).map((l) => (
            <Pressable key={l.id} accessibilityLabel={tr('Add reason')} onPress={() => { tap(); setPick(l); }} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
              <Txt v="small" raw style={{ width: 96 }}>{`${weekdayShort(new Date(l.ts).getDay())} ${new Date(l.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Txt>
              <Txt v="small" raw style={{ width: 44 }}>{len(l.dur_ms)}</Txt>
              <Txt v="h3" raw={!!l.reason} c={l.reason ? t.text : t.accentText} style={{ flex: 1 }}>{l.reason ? tr(l.reason) : 'Add reason'}</Txt>
            </Pressable>
          ))}
        </>
      )}
      <Modal transparent animationType="fade" visible={!!pick} onRequestClose={() => setPick(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: space(5) }} onPress={() => setPick(null)}>
          <Pressable style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: space(5), gap: space(2) }}>
            <Txt v="h2">Why did you lift it?</Txt>
            {[...REASONS, ''].map((r) => (
              <Pressable key={r || 'none'} onPress={() => choose(r)} style={{ minHeight: 48, borderRadius: radius.sm, justifyContent: 'center', paddingHorizontal: space(4), backgroundColor: pick?.reason === r ? t.accentA : t.surface2 }}>
                <Txt v="h3" raw c={pick?.reason === r ? '#1A1206' : r ? t.text : t.muted}>{r ? tr(r) : tr('No reason')}</Txt>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </Card>
  );
}
