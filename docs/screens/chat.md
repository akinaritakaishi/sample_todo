# チャット画面（Chat）

- ルート: `/chat`
- 実装: `front/app/pages/chat.vue`

## 画面

![Chat画面](./chat.png)

## 目的

Slack風の簡易チャットツール。チャンネル（部屋）ごとにメッセージの一覧表示と投稿ができる。Webブラウザからだけでなく、`mcp-server/`のMCPサーバー経由でも同じメッセージを読み書きできる（詳細は`docs/Architecture.md`の「データフロー（チャット・MCP連携）」を参照）。

## UI要素

| 要素 | 説明 |
|---|---|
| チャンネル一覧（サイドバー） | アイコン付きのチャンネル名を並べたリスト。クリックで表示するチャンネルを切り替える |
| チャンネルヘッダー | 選択中のチャンネルのアイコンと名前を表示する |
| メッセージ一覧 | 選択中のチャンネルのメッセージを投稿順（古い順）に、投稿者のアバター（頭文字の丸アイコン）・投稿者名・投稿時刻・本文とともに表示する |
| 空状態メッセージ | 選択中のチャンネルにメッセージが0件のとき「まだメッセージはありません。」を表示する |
| 名前入力欄 | 投稿者として表示する名前。初期値は「あなた」 |
| メッセージ入力欄 | 本文の入力。空欄（前後の空白のみを含む場合も）は送信しない |
| 送信ボタン | フォーム送信で選択中のチャンネルにメッセージを投稿する |

## 操作とAPI呼び出し

| 操作 | 呼び出すAPI |
|---|---|
| 画面表示 | `GET /api/chat/rooms`（チャンネル一覧）、`GET /api/chat/messages?room=<チャンネルID>` |
| チャンネル切り替え | `GET /api/chat/messages?room=<チャンネルID>` |
| メッセージ送信 | `POST /api/chat/messages`（`room`に選択中のチャンネルIDを指定） |

送信後は`refresh()`でメッセージ一覧を再取得して画面に反映する（詳細は`docs/api/openapi.json`を参照）。

## データの型

```
ChatRoom = { id: string, name: string, icon: string (絵文字アイコン) }
ChatMessage = { id: string, room: string, author: string, text: string, createdAt: string (ISO 8601日時) }
```

チャンネル一覧は固定（`server/data/chat-rooms.json`）で、ユーザーによる作成・編集はできない。

## 初期表示

サーバー側に保存済みのメッセージが無い場合、デモ向けのシードデータ（`server/data/seed-chat-messages.json`）から各チャンネルの会話が生成される。
