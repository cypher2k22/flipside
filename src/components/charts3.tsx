import { View } from 'react-native';
import Svg, { Circle, Polyline, Rect } from 'react-native-svg';
import { weekdayLetter } from '../i18n';
import { useTheme } from '../theme';
import { Txt } from './ui';

/** Weekday × hour matrix; darker = more focus. Rows follow the week start. */
export function HourWeekHeat({ grid, order }: { grid: number[][]; order: number[] }) {
  const t = useTheme(), max = Math.max(1, ...grid.flat());
  return (
    <View style={{ gap: 2 }} accessibilityLabel="Focus by weekday and hour">
      {order.map((d) => (
        <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Txt v="small" raw style={{ width: 14 }}>{weekdayLetter(d)}</Txt>
          {grid[d].map((ms, h) => (
            <View key={h} style={{ flex: 1, aspectRatio: 1, borderRadius: 2, backgroundColor: ms > 0 ? t.accentA : t.dotOff, opacity: ms > 0 ? 0.25 + 0.75 * (ms / max) : 1 }} />
          ))}
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 16 }}>
        {[0, 6, 12, 18, 23].map((h) => <Txt key={h} v="small" raw>{String(h)}</Txt>)}
      </View>
    </View>
  );
}

/** 0-100 score per week as a line with dots; gaps (null) are skipped. */
export function ScoreLine({ values, height = 90 }: { values: (number | null)[]; height?: number }) {
  const t = useTheme(), w = 300, step = w / Math.max(1, values.length - 1), y = (v: number) => height - 6 - (v / 100) * (height - 12);
  const pts = values.flatMap((v, i) => (v == null ? [] : [[i * step, y(v)] as const]));
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" accessibilityLabel="Focus score by week">
      <Polyline points={pts.map(([x, yy]) => `${x},${yy}`).join(' ')} fill="none" stroke={t.accentA} strokeWidth={2.5} />
      {pts.map(([x, yy], i) => <Circle key={i} cx={x} cy={yy} r={3.5} fill={t.accentA} />)}
    </Svg>
  );
}

/** Daily bars with a moving-average line on top. */
export function TrendChart({ values, avg, height = 110 }: { values: number[]; avg: number[]; height?: number }) {
  const t = useTheme(), w = 300, n = values.length, max = Math.max(1, ...values, ...avg), bw = w / n;
  const y = (v: number) => height - (v / max) * (height - 4);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      {values.map((v, i) => <Rect key={i} x={i * bw + 1} y={y(v)} width={Math.max(1, bw - 2)} height={height - y(v)} fill={t.surface2} />)}
      <Polyline points={avg.map((v, i) => `${i * bw + bw / 2},${y(v)}`).join(' ')} fill="none" stroke={t.accentA} strokeWidth={2.5} />
    </Svg>
  );
}
