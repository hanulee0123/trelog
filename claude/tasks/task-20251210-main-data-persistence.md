# データ永続化（localStorage）機能の実装

- 担当: Claude Code
- 期限: 2025-12-10
- 状態: In Progress
- ブランチ: main
- 関連タスク: task-20251210-main-interval-timer.md

## 概要
トレーニング記録をブラウザのlocalStorageに保存し、アプリをリロードしても記録が残るようにします。
また、過去の記録を閲覧・削除できる履歴機能も実装します。

## TODO
- [x] 実装計画の策定
- [ ] localStorage用のユーティリティ関数を作成
- [ ] TrainingLogFormに保存機能を追加
- [ ] 記録履歴の表示コンポーネントを作成
- [ ] App.tsxに履歴表示を統合
- [ ] 動作確認
- [ ] コミット & プッシュ

## 技術的な詳細

### 実装する機能

1. **型定義の追加** (`src/types/training.ts`)
   - `TrainingLog`: 保存する記録の型（日時、種目、セット、メモなど）
   - IDを含む完全なログエントリ型

2. **localStorage ユーティリティ** (`src/lib/storage.ts`)
   - `saveTrainingLog(log)`: 記録を保存
   - `getTrainingLogs()`: 全記録を取得
   - `deleteTrainingLog(id)`: 記録を削除
   - `clearAllLogs()`: 全記録を削除
   - エラーハンドリング（quota超過など）

3. **TrainingLogForm の更新**
   - 「記録を保存」ボタンの実装
   - 保存成功時のフィードバック（トースト通知またはメッセージ）
   - フォームのリセット

4. **記録履歴コンポーネント** (`src/features/training/TrainingHistory.tsx`)
   - 日付順（新しい順）で記録を表示
   - 各記録の詳細（種目、セット数、重量、回数）
   - 削除ボタン
   - 空の状態の表示

5. **App.tsx への統合**
   - 新しいセクションとして「トレーニング履歴」を追加
   - 記録と履歴を見やすく配置

### データ構造

```typescript
interface TrainingLog {
  id: string; // UUID
  date: string; // ISO 8601
  exercise: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
  memo?: string;
}
```

### localStorage キー
- `trelog:training-logs`: トレーニング記録の配列

## 実装順序
1. 型定義の更新 (`src/types/training.ts`)
2. storageユーティリティの作成 (`src/lib/storage.ts`)
3. TrainingLogFormの更新（保存機能）
4. TrainingHistoryコンポーネントの作成
5. App.tsxに統合
6. スタイルの追加
7. 動作確認
8. コミット & プッシュ

## メモ
- UUIDはブラウザ標準の`crypto.randomUUID()`を使用
- localStorageの容量制限は約5MBなので、記録が多い場合は古いものから削除する機能も検討
- 将来的にはIndexedDBやバックエンドAPIへの移行を想定
- エクスポート/インポート機能は今回のスコープ外

## 振り返り
- 実装完了後に記入
