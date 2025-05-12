# Salesforce音声分割 詳細作業手順書

**作成日:** 2025年5月12日  
**作成者:** GitHub Copilot  
**対象ファイル:** Salesforce_audio02.wav  

## 1. 概要

この手順書は、Salesforceプレゼンテーション用の音声ファイル（Salesforce_audio02.wav）をスライドごとに分割する作業の詳細を記載しています。

## 2. 前提条件

- FFmpeg がインストールされていること
- PowerShell 5.1以上が実行可能であること
- 入力ファイル: `c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav`
- 出力先ディレクトリ: `c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio`

## 3. 分割処理の手順

### 3.1 使用するスクリプトファイル

正常に動作することが確認されているスクリプトファイル:
- **`split_salesforce_audio02_working.ps1`**

### 3.2 実行コマンド

```powershell
# PowerShellスクリプト実行ポリシーをバイパスして実行
powershell -ExecutionPolicy Bypass -File "c:\public_work\slides_project\_dev_scripts\split_salesforce_audio02_working.ps1"
```

### 3.3 スクリプトの内容説明

このスクリプトは以下の処理を行います:
1. 入力音声ファイル（Salesforce_audio02.wav）を読み込み
2. 事前に定義されたタイムスタンプ情報に基づいて12のセグメントに分割
3. 各セグメントを`salesforce_audio_X.wav`という命名規則で保存（Xは0から始まる通番）

### 3.4 タイムスタンプ設定

スクリプト内のタイムスタンプ設定（秒単位）:

| 番号 | 開始時間(秒) | 終了時間(秒) | ファイル名 | スライド内容 |
|------|------------|------------|-------------|-----------|
| 0 | 0 | 40 | salesforce_audio_0.wav | タイトル_はじめに |
| 1 | 40 | 67 | salesforce_audio_1.wav | なぜ今Salesforceなのか |
| 2 | 67 | 129 | salesforce_audio_2.wav | 3つの大きな課題 |
| 3 | 129 | 159 | salesforce_audio_3.wav | 3つの解決アプローチ |
| 4 | 159 | 197 | salesforce_audio_4.wav | 具体的な仕組み1_情報の一元管理と見える化 |
| 5 | 197 | 267 | salesforce_audio_5.wav | 具体的な仕組み2_柔軟なシステム構成 |
| 6 | 267 | 288 | salesforce_audio_6.wav | 具体的な仕組み3_ユーザー目線の工夫 |
| 7 | 288 | 317 | salesforce_audio_7.wav | 具体的な仕組み4_データ品質とセキュリティ |
| 8 | 317 | 354 | salesforce_audio_8.wav | アクセス権管理 |
| 9 | 354 | 400 | salesforce_audio_9.wav | 期待される導入効果 |
| 10 | 400 | 452 | salesforce_audio_10.wav | まとめと次のステップ |
| 11 | 452 | 497 | salesforce_audio_11.wav | 将来展望 |

## 4. 注意事項

1. スクリプト実行前に、出力先ディレクトリの既存ファイルをバックアップまたは削除することを推奨します。
   ```powershell
   Remove-Item -Path "c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio\salesforce_audio_*.wav" -Force
   ```

2. FFmpegがインストールされていない場合は、公式サイトからダウンロードしてパスを通してください。

3. 日本語文字化けの問題を回避するため、スクリプト内では英語の文字列のみを使用しています。

## 5. スクリプトの完全ソースコード

```powershell
# filepath: c:\public_work\slides_project\_dev_scripts\split_salesforce_audio02_working.ps1

# 入出力ファイルパスを絶対パスで指定
$sourceAudio = "c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav"
$outputDir = "c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio"

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $outputDir)) {
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
    Write-Host "Output directory created: $outputDir"
} else {
    Write-Host "Output directory exists: $outputDir"
}

# 単純なタイムスタンプリスト
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

# シンプルな処理
foreach ($segment in $segments) {
    $outputFile = Join-Path -Path $outputDir -ChildPath "salesforce_audio_$($segment.index).wav"
    $duration = $segment.end - $segment.start
    
    Write-Host "Processing segment $($segment.index): $($segment.start)s to $($segment.end)s (duration: $duration s)"
    Write-Host "Output file: $outputFile"
    
    # FFmpegコマンド実行
    & ffmpeg -i $sourceAudio -ss $segment.start -t $duration -c copy -y $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success: Created $outputFile" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to create $outputFile" -ForegroundColor Red
    }
}

Write-Host "Processing complete!"
```

## 6. トラブルシューティング

1. **エラー: 文字化けが発生する**  
   原因: PowerShellの文字エンコーディングの問題  
   解決策: スクリプト内では英語のみを使用するバージョンを実行する

2. **エラー: FFmpegが見つからない**  
   原因: FFmpegがインストールされていないか、パスが通っていない  
   解決策: FFmpegをインストールし、環境変数にパスを追加する

3. **エラー: 出力が表示されない**  
   原因: 出力がリダイレクトされている可能性がある  
   解決策: 以下のコマンドで詳細な出力を有効にする
   ```powershell
   $VerbosePreference = "Continue"; $DebugPreference = "Continue"; powershell -ExecutionPolicy Bypass -File "スクリプトのパス"
   ```

## 7. 結果確認方法

分割処理が完了したら、以下のコマンドで出力ファイルを確認してください:

```powershell
Get-ChildItem -Path "c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio" | Select-Object Name, Length, LastWriteTime | Sort-Object Name
```

全12個のファイルが正しく生成されていることを確認してください。
