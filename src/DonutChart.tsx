import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Props = {
  done: number;
  total: number;
};

// その日限りの達成度を表すドーナツ円グラフ。中央に「達成/全体」を表示する。
export function DonutChart({ done, total }: Props) {
  const remaining = Math.max(total - done, 0);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const data = [
    { name: "done", value: done },
    { name: "remaining", value: remaining },
  ];

  const DONE_COLOR = "#22c55e"; // green-500
  const REMAIN_COLOR = "#2a2a35";

  return (
    <div className="donut">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={total === 0 ? [{ name: "empty", value: 1 }] : data}
            dataKey="value"
            innerRadius={70}
            outerRadius={100}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={true}
          >
            {total === 0 ? (
              <Cell fill={REMAIN_COLOR} />
            ) : (
              <>
                <Cell fill={DONE_COLOR} />
                <Cell fill={REMAIN_COLOR} />
              </>
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <div className="donut-pct">{pct}%</div>
        <div className="donut-sub">
          {done} / {total}
        </div>
      </div>
    </div>
  );
}
