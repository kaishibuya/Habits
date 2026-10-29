import { useEffect, useMemo, useState } from "react";
import { TASKS } from "./tasks";
import type { DoneRecord } from "./types";
import {
  isDone,
  loadRecords,
  saveRecords,
  toDateKey,
  toggleRecord,
  weekdayOf,
} from "./storage";
import { DonutChart } from "./DonutChart";

export default function App() {
  const today = useMemo(() => new Date(), []);
  const dateKey = toDateKey(today);
  const weekday = weekdayOf(today);

  const [records, setRecords] = useState<DoneRecord[]>(() => loadRecords());

  // records が変わるたび localStorage に保存（リロードしても残る）
  useEffect(() => {
    saveRecords(records);
  }, [records]);

  // 今日の曜日に該当するタスクだけを出す
  const todaysTasks = useMemo(() => {
    return TASKS.filter((t) => {
      if (!t.active) return false;
      if (t.schedule.type === "daily") return true;
      return t.schedule.days.includes(weekday);
    });
  }, [weekday]);

  const doneCount = todaysTasks.filter((t) =>
    isDone(records, t.id, dateKey)
  ).length;

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

      <section className="chart-section">
        <DonutChart done={doneCount} total={todaysTasks.length} />
      </section>

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
