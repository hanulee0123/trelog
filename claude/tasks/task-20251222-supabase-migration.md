# Supabase Migration & Data Persistence (2025-12-22 ~ 2026-01-10)

## 概要
アプリのデータ保存先を LocalStorage から Supabase (Cloud SQL) へ移行し、ユーザー認証機能を実装しました。
さらに、Vercelへの本番デプロイを行い、常時アクセス可能な状態にしました。

## 実装内容

### 1. ユーザー認証 (Supabase Auth)
- メールアドレス/パスワードによるサインアップ・ログイン機能
- ログイン状態の管理（Authenticate, Session）
- **[NEW] Email Verificationの動作確認**: 開発環境および本番環境でメールリンク認証が正常動作することを確認。

### 2. データ構造 (PostgreSQL)
- **`exercises`**: 種目マスタ（全ユーザー共有）
- **`training_history`**: トレーニング実績（RLSによりユーザー自身のデータのみ参照・更新可能）
- **`profiles`**: ユーザープロフィール
  - Trigger `on_auth_user_created` により、Authユーザー作成時に自動でレコードが作成されます。

### 3. デプロイ・運用 (Vercel)
- GitHubリポジトリ (`main` branch) と連携し、Vercelへデプロイ。
- 環境変数 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) をVercel Dashboard上で設定済み。

## 次のステップ
- [ ] 既存データ（LocalStorage）のインポート機能（現在は新規データのみ）
- [ ] オフライン対応（Service Worker / PWA）の再検討
- [ ] 種目マスタのユーザー追加UI
