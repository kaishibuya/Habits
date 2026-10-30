import { useEffect, useMemo, useState } from "react";
import type { DoneRecord } from "./types";
import {
  currentStreak,
  isDone,
  loadRecords,
  saveRecords,
  tasksForDate,
  toDateKey,
  toggleRecord,
} from "./storage";
import { DonutChart } from "./DonutChart";

export default function App() {
  const today = useMemo(() => new Date(), []);
  const dateKey = toDateKey(today);

  const [records, setRecords] = useState<DoneRecord[]>(() => loadRecords());

  // records が変わるたび localStorage に保存（リロードしても残る）
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  // 今日の曜日に該当するタスクだけを出す
  const todaysTasks = useMemo(() => tasksForDate(today), [today]);

  const doneCount = todaysTasks.filter((t) =>
    isDone(records, t.id, dateKey)
  ).length;

  // 今日まで続いている連続達成日数
  const streak = useMemo(
    () => currentStreak(records, today),
    [records, today]
  );

  const handleToggle = (taskId: string) => {
    setRecords((prev) => toggleRecord(prev, taskId, dateKey));
  };

  const dateLabel = `${today.getFullYear()}年${
    today.getMonth() + 1
  }月${today.getDate()}日（${["日", "月", "火", "水", "木", "金", "土"][today.getDay()]}）`;

  return (
    <div className="app">
      <header className="header">
        <h1>Habits</h1>
        <p className="date">{dateLabel}</p>
      </header>

      {/* 上段：統計（ストリーク + 今日の達成度） */}
      <section className="stats">
        <div className="stat-card streak-card">
          <p className="stat-title">連続日数（今日まで）</p>
          {streak > 0 ? (
            <>
              <p className="streak-num">🔥 {streak}</p>
              <p className="streak-text">{streak}日継続中！！</p>
            </>
          ) : (
            <>
              <p className="streak-num streak-num-zero">0</p>
              <p className="streak-text streak-text-zero">頑張ろう</p>
            </>
          )}
        </div>

        <div className="stat-card donut-card">
          <p className="stat-title">今日の達成度</p>
          <DonutChart done={doneCount} total={todaysTasks.length} />
        </div>
      </section>

      {/* 下段：今日のタスク */}
      <section className="tasks">
        {todaysTasks.map((task) => {
          const checked = isDone(records, task.id, dateKey);
          return (
            <label
              key={task.id}
              className={`task ${checked ? "task-done" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(task.id)}
              />
              <span className="checkmark" aria-hidden="true" />
              <span className="task-name">{task.name}</span>
            </label>
          );
        })}
      </section>

      <footer className="footer">
        {doneCount === todaysTasks.length && todaysTasks.length > 0 ? (
          <p className="all-done">今日のタスク完了。かっこいい。</p>
        ) : (
          <p className="remaining-note">
            残り {todaysTasks.length - doneCount} 件
          </p>
        )}
      </footer>
    </div>
  );
}
