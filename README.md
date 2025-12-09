# trelog

モバイルファーストで筋トレ記録を管理する PWA を目指す React + TypeScript プロジェクトです。

## セットアップ

```bash
npm install
npm run dev
```

## スクリプト
- `npm run dev`: Vite 開発サーバーを起動（ポートは 5173）
- `npm run build`: TypeScript ビルド + Vite 本番ビルド
- `npm run preview`: ビルド成果物のプレビュー
- `npm run lint`: Vite 内蔵の lint を実行

## 収録機能（モック）
- 種目ごとのセット入力・テンプレート適用・インターバル秒数指定
- 種目に応じたストレッチの自動提案
- カレンダー・通知・フォームチェックなどの将来機能の配置プレースホルダー

## Claude 作業メモ
- `claude/templates/task-template.md` をコピーして、タスクごとに `claude/tasks/` 配下へ Markdown を追加してください。
- ファイル名は `task-YYYYMMDD-<slug>.md` のように日付と内容が分かる形式を推奨します。

## デプロイ (Vercel)
- GitHub へのプッシュをトリガーに Vercel が自動ビルド・デプロイします。
- プッシュ後は Vercel ダッシュボードでビルドステータスを確認し、必要に応じて環境変数やビルドログを見直してください。
