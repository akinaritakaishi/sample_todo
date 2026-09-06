#!/usr/bin/env bash
# ステージ済みの変更に、クレデンシアルらしき文字列が含まれていないかを機械的にチェックする。
# あくまで一次スクリーニング用の簡易チェックであり、これが通っても目視確認は省略しないこと。
set -euo pipefail

diff_content="$(git diff --cached)"
staged_files="$(git diff --cached --name-only)"
found=0

warn() {
  echo "⚠️  $1"
  found=1
}

# .env系ファイルの追加・変更
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    *.env|*.env.*|*/.env|*/.env.*)
      warn "環境変数ファイルがステージされています: $f"
      ;;
  esac
done <<< "$staged_files"

# それらしいシークレットパターン（key = "..." 系、既知のトークン形式）
patterns=(
  '(api[_-]?key|secret|token|password|passwd|access[_-]?key)[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9/+_=\-]{8,}["'"'"']'
  'AKIA[0-9A-Z]{16}'                    # AWS Access Key ID
  'ghp_[A-Za-z0-9]{36}'                 # GitHub Personal Access Token
  '-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----'
  'sk-[A-Za-z0-9]{20,}'                 # 汎用APIキー形式
)

for p in "${patterns[@]}"; do
  matches="$(echo "$diff_content" | grep -inE -- "$p" || true)"
  if [ -n "$matches" ]; then
    warn "クレデンシアルらしき文字列を検出しました（パターン: $p）"
    echo "$matches" | sed 's/^/    /'
  fi
done

if [ "$found" -eq 1 ]; then
  echo ""
  echo "コミットを中断してください。誤検知の場合もあるため、該当箇所を目視で確認したうえで判断すること。"
  exit 1
fi

echo "クレデンシアルらしき文字列は検出されませんでした（簡易チェックのみ。目視確認も行うこと）。"
exit 0
