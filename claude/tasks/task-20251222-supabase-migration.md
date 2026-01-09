# Supabase Migration & Data Persistence (2025-12-22)

## 概要
アプリのデータ保存先を LocalStorage から Supabase (Cloud SQL) へ移行し、ユーザー認証機能を実装しました。
これにより、デバイス間でのデータ同期と、恒久的なデータ保存が可能になりました。

## 実装内容

### 1. ユーザー認証 (Supabase Auth)
- メールアドレス/パスワードによるサインアップ・ログイン機能
- ログイン状態の管理（`AuthContext` 相当を `App.tsx` に実装）
- `profiles` テーブルによるユーザー公開情報の管理（Triggerによる自動作成）

### 2. データ構造 (PostgreSQL)
- **`exercises`**: 種目マスタ（全ユーザー共有）
- **`training_history`**: トレーニング実績（ユーザーごと、セット単位でフラットに保存）
- **`profiles`**: ユーザープロフィール

### 3. アプリケーション改修
- `storage.ts`: 全メソッドを非同期化し、Supabase SDKを使用するように書き換え
- `TrainingLogForm`: 非同期保存に対応
- `TrainingCalendar` / `TrainingHistory`: 非同期データ読み込みに対応

## 次のステップ
- [ ] 既存データ（LocalStorage）のインポート機能？（今回は未実装）
- [ ] オフライン対応（Service Worker / PWA）の再検討
- [ ] 種目マスタのユーザー追加UI（現状は保存時に自動追加されるが、一覧から選ぶ機能など）
