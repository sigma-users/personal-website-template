# Academic Website Template

## researchmap からの自動更新（任意）

CSV を手動編集せず、公開情報から月1回ホームページを更新できます。初期状態では無効です。[GitHub が初めての方向けの設定手順](wiki/researchmap-sync_ja.md) をご覧ください。


React、TypeScript、Tailwind CSSを使用したレスポンシブな学術用ウェブサイトテンプレート。

## 特徴

- 多言語対応（英語、日本語）
- レスポンシブデザイン
- 動的な出版物フィルタリング
- Markdownサポート
- カスタマイズ可能なテーマ
- GitHub Pagesでのデプロイ

## はじめに

詳細は[wiki/procedure_for_user_ja.md](wiki/procedure_for_user_ja.md)を参照してください。

### 前提条件

- Node.js (v16+)
- npmまたはyarn

### インストール

1. クローン:
   ```bash
   git clone https://github.com/yourusername/academic-website.git
   cd academic-website
   ```

2. インストール:
   ```bash
   npm install
   # または
   yarn
   ```

3. サーバーを起動:
   ```bash
   npm run dev
   # または
   yarn dev
   ```

4. `http://localhost:3000`を開く。

## プロジェクト構造

- `/data` - CSVファイル
- `/public` - 静的コンテンツ
- `/scripts` - スクリプト
- `/src` - ソースコード

## カスタマイズ

### コンテンツ

1. `/public/locales/en/translations.json`と`/public/locales/ja/translations.json`を更新
2. `/public/content/bio/`のバイオを置き換え
3. `/public/images/profile.jpg`にプロフィール写真を追加
4. `/data/rm_published_papers.csv`と`/data/rm_presentations.csv`で出版物を更新
5. `/public/content/awards/`にデータを追加
6. `/public/content/career/`でキャリアを更新

### スタイリング

1. `tailwind.config.js`でカスタマイズ
2. `src/index.css`を修正

## デプロイ

GitHub Actionsを使用してGitHub Pagesにデプロイ。

1. リポジトリの「Actions」に移動。
2. 「Deploy to GitHub Pages」を選択。
3. 「Settings」→「Pages」でURLを確認。

## ライセンス

MITライセンス。

## 謝辞

- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [i18next](https://www.i18next.com/)
