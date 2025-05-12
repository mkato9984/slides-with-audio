# 音声分割スクリプトの整理メモ

## 正常に動作するスクリプト
- `split_simple.ps1` - 2025年5月12日に作成し、正常に動作した最新のシンプルなスクリプト
- `split_salesforce_audio02.ps1` - 元の音声分割スクリプト（日本語文字コードの問題あり）

## 不要または問題のあるスクリプト
- `split_salesforce_audio02_fixed.ps1` - 修正を試みたが文字化けの問題が解決せず
- `split_salesforce_audio02_log.ps1` - ログ出力を試みたが正常に動作しなかったもの
- `split_salesforce_audio02_new.ps1` - 代替として作成したが、不要になったもの
- `split_salesforce_audio02_plain.ps1` - 特殊文字を使わないバージョンだが、`split_simple.ps1`に置き換えられた
- `split_salesforce_audio02_updated.ps1` - 更新を試みたが問題があったもの

## 整理計画
1. `split_simple.ps1`を`split_salesforce_audio02_working.ps1`としてリネーム
2. 正常動作するスクリプト以外は`_old`サブフォルダに移動
3. 作業記録を更新して、使用すべきスクリプトを明確に示す
