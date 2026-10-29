import type { DoneRecord, Weekday } from "./types";

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
