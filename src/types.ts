// Habits - データモデル
// Task（マスター：何を・いつやるか）と Record（実績：ある日やったか）を分離する。
// 分離の意図：タスク定義を後から足し引きしても、過去の実績が壊れないようにするため。

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type TaskCategory = "筋トレ" | "読書" | "プログラミング" | "英語";

// いつそのタスクを出すか
export type Schedule =
  | { type: "daily" } // 毎日
  | { type: "weekly"; days: Weekday[] }; // 特定曜日のみ

// タスクのマスター定義
export type Task = {
  id: string;
  name: string; // 表示名（例: "読書10分", "筋トレ：胸"）
  category: TaskCategory;
  schedule: Schedule;
  active: boolean; // 一時停止できるように（MVPでは常にtrue）
};

// 日々の記録。1タスク × 1日 = 1レコード。
// done=true のレコードのみ保存する（やってない日はレコードを持たない）。
export type DoneRecord = {
  taskId: string;
  date: string; // "YYYY-MM-DD"
  done: boolean;
};
