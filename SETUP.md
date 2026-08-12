# 「完了の間」セットアップ手順

このアプリを実際に動かすには、無料の Supabase(データベース・ログイン機能)と Vercel(公開用ホスティング)のアカウントが必要です。どちらもクレジットカード不要で始められます。

## 1. Supabaseプロジェクトを作る

1. https://supabase.com にアクセスし、「Start your project」からアカウントを作成(GitHubアカウントでのログインが簡単です)
2. 「New Project」でプロジェクトを新規作成(名前は自由、リージョンは `Northeast Asia (Tokyo)` がおすすめ、パスワードは自動生成でOK)
3. プロジェクトの作成が終わるまで1〜2分待つ

## 2. データベースを作る

1. 左メニューの「SQL Editor」を開く
2. このプロジェクト内の `supabase/schema.sql` ファイルの中身を全部コピーして貼り付け、「Run」を押す
3. エラーが出なければ完了(`profiles` と `tasks` という2つのテーブルができます)

## 3. 接続情報を取得する

1. 左メニューの「Project Settings」→「Data API」を開く
2. 「Project URL」をコピー
3. 「Project API keys」の `anon` `public` キーをコピー

## 4. アプリに接続情報を設定する

`kanryo-no-ma` フォルダの中にある `.env.local` というファイルを開き、以下のように書き換えてください(値は手順3でコピーしたものに置き換える):

```
NEXT_PUBLIC_SUPABASE_URL=コピーしたProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=コピーしたanonキー
```

## 5. ログインメールのリンク先を設定する

1. Supabaseの左メニュー「Authentication」→「URL Configuration」を開く
2. 「Site URL」に、ローカルで試す場合は `http://localhost:3000`、公開後は本番のURL(手順7で決まります)を設定
3. 「Redirect URLs」に `http://localhost:3000/auth/callback` を追加(公開後は本番URLの `/auth/callback` も追加)

## 6. ローカルで動作確認する

ターミナルで以下を実行:

```bash
cd kanryo-no-ma
npm run dev
```

`http://localhost:3000` を開き、メールアドレスを入力して「ログインリンクを送る」→ 届いたメールのリンクをクリックしてログインできれば成功です。

## 7. 全員が使えるように公開する(Vercel)

1. https://vercel.com でアカウントを作成(GitHubアカウントでのログインが簡単)
2. このプロジェクトをGitHubリポジトリにpushする(GitHubアカウントがまだなければ https://github.com で作成)
3. Vercelで「Add New... → Project」からそのGitHubリポジトリを選んでインポート
4. 環境変数(Environment Variables)に、手順4と同じ `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
5. 「Deploy」を押すと数分で公開用URLが発行される
6. 発行されたURLを、手順5のSupabase「Site URL」と「Redirect URLs」(`https://発行されたURL/auth/callback`)に追加登録する

公開URLを20名の参加者に共有すれば、各自スマホのブラウザで開いて使えます(ホーム画面に追加すると、アプリのように起動できます)。

## 困ったときは

- ログインメールが届かない → 迷惑メールフォルダを確認、またはSupabaseの「Authentication → Users」で送信ログを確認
- 画面が真っ白/エラーが出る → `.env.local` の値が正しくコピーされているか確認
- それでも解決しない場合は、エラーメッセージのスクリーンショットを見せてください
