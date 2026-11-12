import { View } from 'react-native';
import { addTask, setPinned } from '../db';
import { useData } from '../data';
import type { Task } from '../db';
import { tr } from '../i18n';
import { categoryColors, space } from '../theme';
import { TaskChips } from './TaskChips';
import { Txt } from './ui';

/** Pinned first, then most recently used (a subject counts its topics' sessions), never-used last in original order. */
export function byRecent(list: Task[], all: Task[], sessions: { task_id: number; start_ts: number }[]) {
  const root = (id: number) => all.find((k) => k.id === id)?.parent_id ?? id, last = new Map<number, number>();
  for (const s of sessions) for (const id of new Set([s.task_id, root(s.task_id)])) last.set(id, Math.max(last.get(id) ?? 0, s.start_ts));
  return [...list].sort((a, b) => b.pinned - a.pinned || (last.get(b.id) ?? 0) - (last.get(a.id) ?? 0));
}

export const rootOf = (tasks: Task[], id: number) => tasks.find((k) => k.id === id)?.parent_id ?? id;

/** Subject row + topic row for the selected subject. `selected` is a subject or topic id (0 = none). */
export function TaskPicker({ tasks, selected, onSelect, disabled }: {
  tasks: Task[]; selected: number; onSelect: (id: number) => void; disabled?: boolean;
}) {
  const root = rootOf(tasks, selected);
  const subject = tasks.find((k) => k.id === root);
  const reload = useData((s) => s.reload), sessions = useData((s) => s.sessions);
  const pin = async (id: number) => { await setPinned(id, !tasks.find((k) => k.id === id)?.pinned); reload(); };
  const add = async (name: string, cat: string, color: string, parent: number | null = null) => {
    const id = await addTask(name, cat, parent ? subject?.color ?? color : color, parent);
    await reload();
    onSelect(id);
  };
  return (
    <View style={{ gap: space(2) }}>
      <TaskChips allowNone disabled={disabled} tasks={byRecent(tasks.filter((k) => !k.parent_id), tasks, sessions)} selected={root} onLong={pin}
        onSelect={onSelect} onAdd={(n, c, col) => add(n, c || '', col || categoryColors[0])} />
      {subject && (
        <View style={{ gap: 4 }}>
          <Txt v="label" raw style={{ paddingHorizontal: space(4) }}>{`${tr('Topics')} · ${subject.name}`}</Txt>
          <TaskChips simple disabled={disabled} onLong={pin} tasks={byRecent(tasks.filter((k) => k.parent_id === root), tasks, sessions)} selected={selected === root ? null : selected}
            onSelect={(id) => onSelect(id === selected ? root : id)} onAdd={(n) => add(n, '', subject.color, root)} />
        </View>
      )}
    </View>
  );
}
