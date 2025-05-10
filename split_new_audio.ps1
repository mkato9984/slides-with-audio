# filepath: c:\public_work\slides_project\split_new_audio.ps1
# 必要なFFmpegライブラリが入っていることを前提とします
# FFmpegがなければインストールしてください
# (例: choco install ffmpeg または https://www.ffmpeg.org/download.html からダウンロード)

$sourceAudio = ".\salesforce_slides\salesforce_audio\salesforce_audio.wav"
$outputDir = ".\salesforce_slides\salesforce_audio_split\"

# 出力ディレクトリを作成
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# タイムスタンプ定義（秒単位）
$timestamps = @(
    @{start = 0.00; end = 42.68; number = 2},
    @{start = 42.68; end = 94.36; number = 3},
    @{start = 94.36; end = 105.36; number = 4},
    @{start = 105.36; end = 121.36; number = 5},
    @{start = 121.36; end = 171.36; number = 6},
    @{start = 171.36; end = 231.36; number = 7},
    @{start = 231.36; end = 268.36; number = 8},
    @{start = 268.36; end = 306.36; number = 9},
    @{start = 306.36; end = 340.36; number = 10}
)

# 各セグメントを分割して保存
foreach ($ts in $timestamps) {
    $duration = $ts.end - $ts.start
    $outputFile = "$($outputDir)audio_$($ts.number).wav"
    Write-Host "分割中: スライド $($ts.number) ($($ts.start) - $($ts.end)秒)"
    
    $ffmpegCmd = "ffmpeg -i `"$sourceAudio`" -ss $($ts.start) -t $duration -c copy `"$outputFile`" -y"
    Write-Host $ffmpegCmd
    Invoke-Expression $ffmpegCmd
}

Write-Host "音声分割が完了しました。$outputDir に保存されています。"