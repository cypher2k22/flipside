import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { migrate } from '../db';
import { toggleGoal } from '../goals';
import { renderWidget } from './render';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo, renderWidget: draw } = props;
  if (widgetAction === 'WIDGET_DELETED') return;
  if (widgetAction === 'WIDGET_CLICK' && props.clickAction === 'TOGGLE_GOAL') {
    const d = props.clickActionData as { id: number; done: boolean };
    await migrate();
    await toggleGoal(d.id, !d.done);
  }
  draw(await renderWidget(widgetInfo.widgetName, widgetInfo.width));
}
