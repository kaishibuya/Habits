import type { Task } from "./types";

// タスクマスター定義（MVP: 計7タスク）
// 筋トレは部位を記録に残すため4タスクに分割し、曜日を割り当てる。
//   月:胸 / 火:背中 / 木:肩+腕 / 日:脚
// 読書・プログラミング・英語は毎日。
export const TASKS: Task[] = [
  {
    id: "workout-chest",
    name: "筋トレ：胸",
    category: "筋トレ",
    schedule: { type: "weekly", days: ["Mon"] },
    active: true,
  },
  {
    id: "workout-back",
    name: "筋トレ：背中",
    category: "筋トレ",
    schedule: { type: "weekly", days: ["Tue"] },
    active: true,
  },
  {
    id: "workout-shoulder-arm",
    name: "筋トレ：肩+腕",
    category: "筋トレ",
    schedule: { type: "weekly", days: ["Thu"] },
    active: true,
  },
  {
    id: "workout-legs",
    name: "筋トレ：脚",
    category: "筋トレ",
    schedule: { type: "weekly", days: ["Sun"] },
    active: true,
  },
  {
    id: "reading",
    name: "読書10分",
    category: "読書",
    schedule: { type: "daily" },
    active: true,
  },
  {
    id: "programming",
    name: "プログラミング30分",
    category: "プログラミング",
    schedule: { type: "daily" },
    active: true,
  },
  {
    id: "english",
    name: "英語学習15分",
    category: "英語",
    schedule: { type: "daily" },
    active: true,
  },
];
