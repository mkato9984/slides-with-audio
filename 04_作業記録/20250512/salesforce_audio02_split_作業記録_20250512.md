# Salesforce Audio02 音声分割作業記録
## 作成日時: 2025年5月12日

## 実施した作業の概要
Salesforce Audio02の音声ファイル（Salesforce_audio02.wav）をスライド単位で分割し、各スライドに対応する音声ファイルを生成しました。
特殊文字を使用せず、プレーンテキストのスクリプトを使用して処理を行いました。

## 作業手順の詳細

### 1. ファイル分割用のシンプルなスクリプト作成
`split_simple.ps1`を作成し、次のタイムスタンプでファイルを分割するように設定しました：

```powershell
$segments = @(
    @{ start = 0; end = 40; index = 0 },
    @{ start = 40; end = 67; index = 1 },
    @{ start = 67; end = 129; index = 2 },
    @{ start = 129; end = 159; index = 3 },
    @{ start = 159; end = 197; index = 4 },
    @{ start = 197; end = 267; index = 5 },
    @{ start = 267; end = 288; index = 6 },
    @{ start = 288; end = 317; index = 7 },
    @{ start = 317; end = 354; index = 8 },
    @{ start = 354; end = 400; index = 9 },
    @{ start = 400; end = 452; index = 10 },
    @{ start = 452; end = 497; index = 11 }
)
```

### 2. スクリプト実行と結果
スクリプトを実行し、以下の音声ファイルを生成しました：

| ファイル名 | サイズ (バイト) | 対応スライド |
|------------|----------------|-------------|
| salesforce_audio_0.wav | 1,921,102 | タイトル_はじめに |
| salesforce_audio_1.wav | 1,298,510 | なぜ今Salesforceなのか |
| salesforce_audio_2.wav | 2,973,774 | 3つの大きな課題 |
| salesforce_audio_3.wav | 1,441,870 | 3つの解決アプローチ |
| salesforce_audio_4.wav | 1,822,798 | 具体的な仕組み1_情報の一元管理と見える化 |
| salesforce_audio_5.wav | 3,358,798 | 具体的な仕組み2_柔軟なシステム構成 |
| salesforce_audio_6.wav | 1,007,694 | 具体的な仕組み3_ユーザー目線の工夫 |
| salesforce_audio_7.wav | 1,392,718 | 具体的な仕組み4_データ品質とセキュリティ |
| salesforce_audio_8.wav | 1,777,742 | アクセス権管理 |
| salesforce_audio_9.wav | 2,207,822 | 期待される導入効果 |
| salesforce_audio_10.wav | 2,494,542 | まとめと次のステップ |
| salesforce_audio_11.wav | 2,150,492 | 将来展望 |

出力ディレクトリ: `c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio`

### 3. 使用したツール
- PowerShell 5.1
- FFmpeg 7.1.1

## 対応した問題点

### 1. スクリプト実行時の出力表示の問題
当初、スクリプト実行時に出力が表示されない問題がありました。`$VerbosePreference = "Continue"; $DebugPreference = "Continue";`を設定し、出力をリダイレクトすることで解決しました。

### 2. 文字化けの問題
日本語を含むPowerShellスクリプトで文字化けが発生していました。これを解決するために、英語のみを使用したシンプルなスクリプト`split_simple.ps1`を作成して使用しました。

## まとめ
特殊文字を使用せず、プレーンテキストのスクリプトを使用して、12個のスライド音声ファイルの分割に成功しました。
生成されたファイルは`salesforce_slides01\audio`ディレクトリに保存され、すべてのファイル名は`salesforce_audio_X.wav`の形式に統一されています。
これらの音声ファイルはスライドプレゼンテーション（`salesforce_minimal_slides01.html`および`salesforce_presenter_view01.html`）で使用できる状態になっています。
