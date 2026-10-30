# Habits 設計書（02_design）

> HOW を定義する。実装時の判断が一意に決まることをゴールにする。
> WHAT / WHY は `01_input/workflow.md` を参照。

対象スコープ：**ストリーク（連続日数）機能の追加**と、それを含む**ダッシュボード**。

---

## 1. ストリーク（連続日数）のルール ※確定

- **達成日** … その日に表示されるべき全タスクに done 記録がある日。
- **連続日数** … 今日を含め、達成日が途切れずに続いている日数。
- 今日はまだ全部やっていなければ達成日ではない → その場合、昨日までの連続が切れていれば **0**。
- 今日を特別扱いしない。今日未達なら素直に 0 日と表示する（「まだ0か、頑張ろう」でいい）。

### 数え方（アルゴリズム）
今日から1日ずつ過去にさかのぼり、達成日が続く限りカウント、達成日でない日に当たったら停止する。

```
count = 0
d = 今日
loop:
  もし isAchievedDay(d) が true なら:
    count += 1
    d = d の前日
  そうでなければ:
    停止
return count
```

- 今日が未達 → 最初の判定で false → count=0 で即停止。
- 今日は達成済みだが昨日が未達 → count=1 で停止（「1日継続中」）。
- 遡りの終端：達成日でない日に当たれば自然に止まるので、無限ループにはならない。
  念のため安全上限（例：遡り最大 3650 日）を設けてガードする。

---

## 2. 「達成日」の判定ロジック ※確定

ある日が達成日かどうかは、**その日の曜日によって対象タスクが変わる**ため、
日付から「その日に出るはずだったタスク集合」を復元してから判定する。

### 対象タスクの復元
現在 `App.tsx` が「今日の曜日に該当するタスクだけ出す」フィルタを持っている。
このロジックを**任意の日付に適用できる純粋関数として切り出す**（モデル変更は不要）。

```
tasksForDate(date):
  weekday = その日付の曜日
  return TASKS.filter(t =>
    t.active && (
      t.schedule.type === "daily" ||
      (t.schedule.type === "weekly" && t.schedule.days.includes(weekday))
    )
  )
```

例：
- 日曜 → 読書・プログラミング・英語 + 筋トレ:脚 = 4タスク
- 水曜 → 読書・プログラミング・英語 = 3タスク（筋トレなし）

### 達成日判定
```
isAchievedDay(records, date):
  targets = tasksForDate(date)
  if targets.length === 0: return false   // 対象0件の日は達成日にしない
  return targets すべてが isDone(records, t.id, dateKey(date))
```

- 「全部 done」で初めて達成日。1つでも未 done なら false。

---

## 3. 表示文言 ※確定

| 連続日数 | 表示 |
|----------|------|
| 0 日 | 頑張ろう |
| 1 日以上 | 🔥 X日継続中！！ |

---

## 4. 追加する関数（storage.ts）

既存の `toDateKey` / `weekdayOf` / `isDone` / `loadRecords` / `saveRecords` / `toggleRecord` はそのまま使う。
新規に以下を追加する。

```ts
// その日付に出るべきタスク一覧（App.tsx の既存フィルタを日付対応で切り出し）
export function tasksForDate(date: Date): Task[]

// その日が達成日か（対象タスク全部 done。対象0件なら false）
export function isAchievedDay(records: DoneRecord[], date: Date): boolean

// 今日を含め、達成日が連続している日数
export function currentStreak(records: DoneRecord[], today: Date): number
```

- `tasksForDate` は `TASKS`（tasks.ts）を参照するため、storage.ts から import する。
- 日付の前日計算は `new Date(d); d.setDate(d.getDate() - 1)` 等で行い、`toDateKey` でキー化して突き合わせる。
- すべて副作用なしの純粋関数（localStorage に触れない）。テストしやすさのため。

### App.tsx 側の変更
- 既存の `todaysTasks` の算出を `tasksForDate(today)` に置き換える（ロジック重複を消す）。
- `currentStreak(records, today)` を呼び、ダッシュボード最上部に表示する。

---

## 5. ダッシュボード・レイアウト（上から）

```
┌─────────────────────────────┐
│  Habits        2026年10月30日(金) │  ← ヘッダー（既存）
├─────────────────────────────┤
│        🔥 7日継続中！！          │  ← ① ストリーク（新規・主役）
│        （0日なら「頑張ろう」）      │
├─────────────────────────────┤
│         ◖ ドーナツ ◗            │  ← ② 今日の達成度（既存）
├─────────────────────────────┤
│  □ 筋トレ：脚                   │  ← ③ 今日のタスク一覧（既存）
│  ☑ 読書10分                    │
│  □ プログラミング30分            │
│  □ 英語学習15分                 │
├─────────────────────────────┤
│         残り 3 件               │  ← フッター（既存）
└─────────────────────────────┘
```

- ① が新規。②③は既存コンポーネントをダッシュボード内に置き直すだけ。
- 色・フォント・アニメーションは実装しながら調整（アジャイル）。この設計では決めない。
- 将来、②③の下に「達成率の推移グラフ」を足す枠がある（指標2・今回スコープ外）。

---

## 6. 今回やらないこと（スコープ外）

- ログイン / 認証（起動＝ダッシュボード直行のまま）
- タスクの画面上での追加・編集
- 達成率の推移グラフ
- ストリークの緩和ルール（週1セーフ等）
- 過去日の遡り入力・修正 UI

---

## 7. 実装ステップ（この順で進める）

1. `storage.ts` に `tasksForDate` を追加
2. `storage.ts` に `isAchievedDay` を追加
3. `storage.ts` に `currentStreak` を追加
4. `App.tsx` の `todaysTasks` を `tasksForDate(today)` に置き換え
5. `App.tsx` にストリーク表示 UI（文言分岐）を追加
6. `npm run build` で型チェック + ビルドを通す
7. `npm run dev` で動作確認（0日 / 1日以上の見え方、チェックでの変化）
