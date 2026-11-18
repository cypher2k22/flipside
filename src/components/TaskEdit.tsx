import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { updateTask, type Task } from '../db';
import { useData } from '../data';
import { categoryColors, font, radius, space, useTheme } from '../theme';
import { tr } from '../i18n';
import { Txt, tap } from './ui';

/** Edit name + colour; saves on blur/tap, reload propagates to every screen + widgets. */
export function TaskEdit({ task, topic }: { task: Task; topic?: boolean }) {
  const t = useTheme(), [name, setName] = useState(task.name), [hex, setHex] = useState(task.color);
  const save = async (n: string, c: string) => { if (!n.trim()) return setName(task.name); await updateTask(task.id, n.trim(), c); await useData.getState().reload(); };
  return (
    <View style={{ gap: space(2) }}>
      <Txt v="label">Name</Txt>
      <TextInput value={name} onChangeText={setName} onEndEditing={() => name.trim() !== task.name && save(name, task.color)} placeholder={tr('Name')} placeholderTextColor={t.muted}
        style={{ minHeight: 48, borderRadius: radius.sm, backgroundColor: t.surface2, color: t.text, paddingHorizontal: space(4), fontFamily: font.body, fontSize: 15 }} />
      {!topic && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(3) }}>
        {categoryColors.map((c) => (
          <Pressable key={c} onPress={() => { tap(); save(name, c); }} accessibilityRole="button" accessibilityLabel={c}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c, borderWidth: 3, borderColor: c === task.color ? t.text : 'transparent' }} />
        ))}
      </View>}
      {!topic && <TextInput value={hex} onChangeText={setHex} autoCapitalize="characters" maxLength={7} placeholder="#RRGGBB" placeholderTextColor={t.muted}
        onEndEditing={() => /^#[0-9a-f]{6}$/i.test(hex) && hex.toUpperCase() !== task.color && save(name, hex.toUpperCase())}
        style={{ minHeight: 48, borderRadius: radius.sm, backgroundColor: t.surface2, color: /^#[0-9a-f]{6}$/i.test(hex) ? hex : t.text, paddingHorizontal: space(4), fontFamily: font.body, fontSize: 15 }} />}
    </View>
  );
}
