# Salesforce Audio 02 分割スクリプト（更新版）
# トランスクリプトファイル: Salesforce_audio02-1_transcript.txt に基づく
# 作成日: 2025年5月12日

# 入力ファイルと出力ディレクトリ（絶対パス）
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$inputFile = Join-Path -Path $projectRoot -ChildPath "salesforce_slides\Salesforce_audio02.wav"
$outputDir = Join-Path -Path $projectRoot -ChildPath "salesforce_slides\salesforce_slides01\audio"

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "出力ディレクトリを作成しました: $outputDir"
}

# FFmpegがインストールされているか確認
$ffmpegPath = "ffmpeg"
try {
    $null = & $ffmpegPath -version
    Write-Host "FFmpegが見つかりました。処理を続行します。"
}
catch {
    Write-Host "FFmpegが見つかりません。インストールまたはパスに追加してください。" -ForegroundColor Red
    exit 1
}

# スライドとタイムスタンプ情報（トランスクリプトから抽出）
# スライド番号、開始時間、タイトル
$segments = @(
    @{number = 1; start = 0.00; title = "タイトル_はじめに"},
    @{number = 2; start = 41.28; title = "なぜ今Salesforceなのか"},
    @{number = 3; start = 106.58; title = "私たちが抱えていた3つの大きな課題"},
    @{number = 4; start = 208.86; title = "Salesforceによる3つの解決アプローチ"},
    @{number = 5; start = 239.08; title = "具体的な仕組み1_情報の一元管理と見える化"},
    @{number = 6; start = 316.70; title = "具体的な仕組み2_柔軟なシステム構成"},
    @{number = 7; start = 426.52; title = "具体的な仕組み3_ユーザー目線の工夫"},
    @{number = 8; start = 447.58; title = "具体的な仕組み4_データ品質とセキュリティ"},
    @{number = 9; start = 517.24; title = "アクセス権管理"},
    @{number = 10; start = 553.82; title = "期待される導入効果"},
    @{number = 11; start = 639.78; title = "まとめと次のステップ"}, 
    @{number = 12; start = 732.40; title = "将来展望_オプション"}
)

# スライド数を確認
$slideCount = $segments.Count
Write-Host "スライド数: $slideCount"

# 各セグメントを処理
for ($i = 0; $i -lt $segments.Count; $i++) {
    $segment = $segments[$i]
    
    # 次のセグメントがある場合はその開始時間までを抽出、ない場合はファイル終端まで
    $duration = $null
    if ($i -lt $segments.Count - 1) {
        $nextSegment = $segments[$i + 1]
        $duration = $nextSegment.start - $segment.start
        $durationParam = "-t $duration"
    } else {
        $durationParam = ""  # 最後のセグメントは終端まで
    }
    
    # 出力ファイル名を設定（salesforce_audio_0.wav, salesforce_audio_1.wav, ...）
    $outputFile = Join-Path -Path $outputDir -ChildPath "salesforce_audio_$($i).wav"
    
    # コマンドを構築して実行
    $startTime = $segment.start
    $command = "$ffmpegPath -i `"$inputFile`" -ss $startTime $durationParam -c copy `"$outputFile`" -y"
    
    Write-Host "スライド $($segment.number) ($($segment.title)) を抽出: $startTime 秒から $(if ($duration) { "$duration 秒間" } else { "終端まで" })" -ForegroundColor Cyan
    Write-Host $command
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "スライド $($segment.number) の音声を保存しました: $outputFile" -ForegroundColor Green
    } else {
        Write-Host "スライド $($segment.number) の音声抽出に失敗しました。" -ForegroundColor Red
    }
}

Write-Host "音声分割処理が完了しました。合計 $slideCount 個のファイルを作成しました。" -ForegroundColor Green
