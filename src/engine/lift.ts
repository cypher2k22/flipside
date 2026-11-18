import { addLift, setLiftDur } from '../lifts';
import { useSettings } from '../store';

/** A lift opens a grace window (Settings, default 15 s). Flip back inside it and the session carries on; otherwise `expire` pauses/ends at the moment of the lift. */
let grace = false, openAt = 0, openId: number | null = null, timer: ReturnType<typeof setTimeout> | null = null;

export const inGrace = () => grace;
/** Lift moment while in grace (clock freezes here), else null. */
export const graceFrom = () => (grace ? openAt : null);
export function liftStart(sessionId: number | null, expire: (at: number) => void) {
  grace = true; openAt = Date.now(); openId = null;
  addLift(sessionId ?? 0, openAt).then((id) => { openId = id; });
  timer = setTimeout(() => { grace = false; expire(openAt); }, useSettings.getState().liftGraceSec * 1000);
}
/** Stores how long the phone was up (flip-back in grace, or resume after a pause). */
export function liftClose() {
  if (timer) clearTimeout(timer);
  timer = null; grace = false;
  if (openId != null) setLiftDur(openId, Date.now() - openAt).catch(() => {});
  openId = null;
}
/** Session ended or timer cancelled: forget the open lift without a duration. */
export function liftReset() { if (timer) clearTimeout(timer); timer = null; grace = false; openId = null; }
