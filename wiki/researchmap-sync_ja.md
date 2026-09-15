# researchmap の情報でホームページを自動更新する

researchmap に論文などを登録すると、このホームページにも定期的に反映できます。
**プログラムを書く必要や、API キーを用意する必要はありません。**
取得するのは誰でも閲覧できる公開情報だけです。

この機能は最初は **無効** です。使わなければ、これまでどおり CSV ファイルで更新できます。

## はじめる前に

- このテンプレートから作った、**自分の GitHub リポジトリ**を開いてください。
  リポジトリとは、ホームページのファイルをまとめて保存している場所です。
  `sigma-users/personal-website-template` 自体を編集するのではありません。
- まだホームページがない場合は、先に [ホームページを作る手順](procedure_for_user_ja.md) を進めてください。
- 自分の researchmap の公開ページを、ログインしていない状態でも閲覧できることを確認してください。

## 1. researchmap ID を確認する

researchmap の自分のページのアドレスを見ます。
例えば `https://researchmap.jp/example_researcher` なら、ID は **`example_researcher`** です。
`R000...` の研究者番号や、アドレス全体ではなく、最後の部分だけを使います。

## 2. 設定ファイルを編集する

1. 自分の GitHub リポジトリの **Code** を開きます。
2. ファイル一覧から **researchmap.config.json** をクリックします。
3. 鉛筆マーク（**Edit this file**）をクリックします。
4. `"enabled": false` を **`"enabled": true`** に変更します。
5. `"permalink": ""` の引用符の間に、自分の researchmap ID を入力します。

例えば次のようになります（`example_researcher` は必ず自分の ID に置き換えてください）。

```json
{
  "enabled": true,
  "permalink": "example_researcher",
  "sync": {
    "papers": true,
    "presentations": true,
    "misc": true,
    "awards": true,
    "researchProjects": true,
    "profile": false,
    "career": false
  }
}
```

- `true` は「自動更新する」、`false` は「自動更新しない」です。
- `papers` は論文、`presentations` は学会発表、`misc` は MISC です。
- `awards` は受賞、`researchProjects` は共同研究・競争的資金等の研究課題です。
- `profile` は氏名・所属・役職・学位・研究キーワードです。
- `career` は経歴・学歴です。

**初めてなら `profile` と `career` は `false` のままがおすすめです。**
これらを `true` にすると、その項目の手動入力内容が researchmap の情報に置き換わります。
自己紹介文・写真・連絡先・SNS のリンクはこの機能では変更しません。

引用符 `"`、カンマ `,`、かっこ `{ }` は消さないでください。
`true` / `false` を引用符で囲まないでください。

6. **Commit changes…** を押します。これは「変更を保存する」という意味です。
7. 説明欄には「researchmap 自動更新を有効化」と入力し、`main` に保存します。
   main は公開用の元ファイルを置く標準のブランチです。
   main が保護されている場合は、GitHub の案内に従って変更の提案（Pull Request）を作り、管理者に取り込みを依頼します。

## 3. 初回の更新を確認する

1. リポジトリの **Actions** を開きます。
2. 初回に有効化を求められたら **I understand my workflows, go ahead and enable them** を押します。
3. **Deploy to GitHub Pages** を選択します。
4. 自動で実行されていなければ、**Run workflow** → ブランチ **main** → **Run workflow** を押します。
5. 数分待ち、実行結果の緑のチェックを確認します。
6. **Settings → Pages** の公開アドレスを開きます。
   `pages-build-deployment` も完了するまで、さらに少し待つことがあります。

Pages の公開元は **Deploy from a branch → gh-pages → /(root)** に設定してください。
これは元のテンプレートと同じ設定です。

## その後はどうなる？

- **毎月1日、日本時間9:17ごろ**に自動で更新します。GitHub の混雑で遅れることがあります。
- PC や Codex を起動しておく必要はありません。
- すぐ反映したいときは、Actions の **Run workflow** を押します。
- main に変更を保存したときも更新します。
- 各回の取得日時と結果は GitHub に保存され、変更履歴から確認できます。
- researchmap で削除・非公開にした業績は、次の正常な同期でホームページからも消えます。
- 日英の片方しかない文章は、もう一方の言語でも同じ文章を表示します。自動翻訳はしません。
- 経歴の終了日「9999」は「現在」と表示します。researchmap にない学位・所在地は推測しません。
- メディア報道など、上記の一覧にない分類は対象外です。

## 更新に失敗したら

**失敗しても、現在公開されているホームページはそのまま残ります。**

Actions で赤い印の実行を開き、赤くなったステップをクリックして理由を確認してください。

- **ID の設定エラー**：アドレス全体ではなく最後の ID だけになっているか確認します。
- **設定ファイルのエラー**：引用符・カンマ・かっこが上の例と同じ形か確認します。
- **researchmap のエラー・タイムアウト**：メンテナンスの可能性があります。時間を置いて Run workflow を押してください。
- **push / permission denied**：Settings → Actions → General → Workflow permissions で、
  自分のリポジトリのワークフローに **Read and write permissions** が許可されているか確認します。
  組織の管理者が制限している場合は管理者へ相談してください。
- **保護された main への保存が拒否された**：この機能は同期結果を main に保存します。
  ブランチ保護を使っている場合は管理者と運用を相談してください。
- **予定日に動かない**：Actions が有効か確認します。Fork 直後や長期間活動のない公開リポジトリでは、
  GitHub が定期実行を無効化することがあります。Actions 画面から再有効化してください。

## 自動更新を止める・元に戻す

1. `researchmap.config.json` の `enabled` を `false` にして保存します。
2. 以後、業績一覧は `data/` に保存してある従来の CSV から生成されます。
3. 自動同期していたプロフィールと経歴は、最後の内容が残ります。必要なら手動で編集してください。
   元の内容は、そのファイルの **History**（変更履歴）で確認できます。

一部だけ手動更新にしたい場合は、その `sync` 項目だけ `false` にします。
業績の項目を無効にすると、その項目は CSV の内容に戻ります。

## 開発者向け補足

- 設定：`researchmap.config.json`
- 正常取得した表示用データ：`data/researchmap.json`（API の生データ全体は保存しません）
- 自動生成：`public/api/`、有効化した場合のみ `public/locales/` と `public/content/career/`
- 実行：`npm ci` → `npm test` → `npm run sync-researchmap` → `npm run build`
- 通常の build / dev は保存済みデータを使い、researchmap にアクセスしません。
- ページ分割・件数・ID 重複を検証し、不完全な取得は公開しません。
- 別の researchmap ID に変えた場合は再取得が必要です。異なる ID の保存データは使えません。
- 月次設定は `.github/workflows/deploy.yml` の schedule にあります（UTC）。
- 自動コミットは標準の `GITHUB_TOKEN` を利用します。新しい push 実行は誘発せず、同じジョブで公開します。
