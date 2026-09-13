---
paths:
  - "front/app/**/*"
  - "front/server/**/*"
---

# フロントエンドのコーディング規約

- UI上の文言は日本語、識別子・コードは英語（`app/`・`server/` の既存スタイルに合わせる）。
- スタイリングは `app/assets/css/main.css` のカスタムプロパティ（`:root` を参照）によるプレーンCSSで行い、CSS-in-JSやユーティリティフレームワークは使わない。新しいスタイリング手法を持ち込むのではなく、既存の変数を拡張すること。
- Vueコンポーネントは`<script setup>`によるComposition APIで書き、Options APIやクラスコンポーネント、TypeScript、外部の状態管理ライブラリ（Pinia等）は使わない。ページ間で共有する状態が必要になった場合は、まずNuxt標準の`useState`で足りないか検討する。
- `app/composables/`・`app/utils/`配下のファイルはNuxtの自動importの対象であり、他ファイルからの明示的な`import`は不要（既存ファイルのスタイルに合わせる）。
