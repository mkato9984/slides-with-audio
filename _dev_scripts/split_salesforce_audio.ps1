# FFmpegがインストールされていることを確認
$ffmpegPath = "ffmpeg"
try {
    $null = & $ffmpegPath -version
    Write-Host "FFmpegが見つかりました。処理を続行します。"
} catch {
    Write-Host "FFmpegが見つかりません。インストールしてパスを設定してください。"
    exit 1
}

# 入力ファイルと出力ディレクトリの設定
$sourceAudio = ".\salesforce_slides\salesforce_audio\salesforce_audio.wav"
$outputDir = ".\salesforce_slides\salesforce_audio_split"

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $outputDir)) {
    New-Item -Path $outputDir -ItemType Directory | Out-Null
    Write-Host "出力ディレクトリを作成しました: $outputDir"
}

# タイムスタンプの定義（スライドごとの開始時間と終了時間）
$timestamps = @(
    @{start = 0; end = 42.68; number = 2; title = "はじめに"},
    @{start = 42.68; end = 94.36; number = 3; title = "課題"},
    @{start = 94.36; end = 105.36; number = 4; title = "アプローチ"},
    @{start = 105.36; end = 121.36; number = 5; title = "取り組み1"},
    @{start = 121.36; end = 171.36; number = 6; title = "取り組み2"},
    @{start = 171.36; end = 231.36; number = 7; title = "デモ"},
    @{start = 231.36; end = 268.36; number = 8; title = "効果"},
    @{start = 268.36; end = 306.36; number = 9; title = "まとめ"},
    @{start = 306.36; end = 340.36; number = 10; title = "未来"}
)

# 音声ファイルを分割
foreach ($segment in $timestamps) {
    $duration = $segment.end - $segment.start
    $outputFile = "$outputDir\audio_$($segment.number).wav"
    
    Write-Host "処理中: $($segment.title) ($($segment.start)秒 - $($segment.end)秒)"
    
    # FFmpegを使用して音声を分割
    & $ffmpegPath -i $sourceAudio -ss $segment.start -t $duration -c copy $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功: $outputFile が作成されました"
    } else {
        Write-Host "エラー: $outputFile の作成に失敗しました"
    }
}

Write-Host "すべての音声ファイルの分割が完了しました"