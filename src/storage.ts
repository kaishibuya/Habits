import type { DoneRecord, Task, Weekday } from "./types";
import { TASKS } from "./tasks";

const STORAGE_KEY = "habits.records.v1";

// --- 日付ユーティリティ ---

// ローカルタイムで "YYYY-MM-DD" を返す（UTCずれを避けるため自前整形）
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAY_MAP: Weekday[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export function weekdayOf(d: Date): Weekday {
  return WEEKDAY_MAP[d.getDay()];
}

// --- localStorage 読み書き ---

export function loadRecords(): DoneRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DoneRecord[];
  } catch {
    // 壊れたデータは無視して空から始める
    return [];
  }
}

export function saveRecords(records: DoneRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 指定日・タスクの done 状態を切り替えた新しい配列を返す
export function toggleRecord(
  records: DoneRecord[],
  taskId: string,
  date: string
): DoneRecord[] {
  const idx = records.findIndex(
    (r) => r.taskId === taskId && r.date === date
  );
  if (idx === -1) {
    return [...records, { taskId, date, done: true }];
  }
  const next = [...records];
  next[idx] = { ...next[idx], done: !next[idx].done };
  return next;
}

export function isDone(
  records: DoneRecord[],
  taskId: string,
  date: string
): boolean {
  return records.some(
    (r) => r.taskId === taskId && r.date === date && r.done
  );
}

// --- ストリーク（連続日数） ---

// その日付に出るべきタスク一覧を返す。
// App.tsx の表示フィルタと同じロジックを、任意の日付に適用できるよう切り出したもの。
export function tasksForDate(date: Date): Task[] {
  const weekday = weekdayOf(date);
  return TASKS.filter((t) => {
    if (!t.active) return false;
    if (t.schedule.type === "daily") return true;
    return t.schedule.days.includes(weekday);
  });
}

// その日が「達成日」か。
// 達成日 = その日の対象タスクが全部 done。対象が0件の日は達成日にしない。
export function isAchievedDay(records: DoneRecord[], date: Date): boolean {
  const targets = tasksForDate(date);
  if (targets.length === 0) return false;
  const key = toDateKey(date);
  return targets.every((t) => isDone(records, t.id, key));
}

// 今日を含め、達成日が途切れずに続いている日数を返す。
// 今日がまだ未達なら、最初の判定で false になり 0 を返す（今日を特別扱いしない）。
export function currentStreak(records: DoneRecord[], today: Date): number {
  const SAFETY_LIMIT = 3650; // 無限ループ防止（約10年ぶん）
  let count = 0;
  const d = new Date(today);
  for (let i = 0; i < SAFETY_LIMIT; i++) {
    if (!isAchievedDay(records, d)) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
