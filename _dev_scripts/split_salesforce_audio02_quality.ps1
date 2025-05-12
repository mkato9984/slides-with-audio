# 音質を重視した音声分割スクリプト - 2025-05-12

# 入出力ファイルパスを絶対パスで指定
$sourceAudio = "c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav"
$outputDir = "c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio_high_quality"

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

Write-Host "Starting high-quality audio segmentation..." -ForegroundColor Cyan
Write-Host "Source file: $sourceAudio" -ForegroundColor Yellow
Write-Host "Target directory: $outputDir" -ForegroundColor Yellow
Write-Host "Total segments to process: $($segments.Count)" -ForegroundColor Yellow
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# シンプルな処理
foreach ($segment in $segments) {
    $outputFile = Join-Path -Path $outputDir -ChildPath "salesforce_audio_$($segment.index).wav"
    $duration = $segment.end - $segment.start
    
    Write-Host "Processing segment $($segment.index): $($segment.start)s to $($segment.end)s (duration: $duration s)"
    Write-Host "Output file: $outputFile"
    
    # FFmpegコマンド実行 - 高品質再エンコード
    & ffmpeg -i $sourceAudio -ss $segment.start -t $duration -acodec pcm_s16le -ar 44100 -ac 2 -y $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success: Created $outputFile" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to create $outputFile" -ForegroundColor Red
    }
    
    # 区切り線を表示
    Write-Host "--------------------------------------------------" -ForegroundColor DarkGray
}

Write-Host "High-quality processing complete!" -ForegroundColor Cyan
Write-Host "Output files are available in: $outputDir" -ForegroundColor Yellow

# 成功したファイルを検証
$createdFiles = Get-ChildItem -Path $outputDir -Filter "salesforce_audio_*.wav"
Write-Host "Successfully created $($createdFiles.Count) of $($segments.Count) expected files." -ForegroundColor Cyan

# 元の音声ファイルとのサイズ比較
$originalSize = (Get-Item $sourceAudio).Length / 1MB
$newTotalSize = ($createdFiles | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Original file size: $($originalSize.ToString("0.00")) MB" -ForegroundColor Yellow
Write-Host "Total size of split files: $($newTotalSize.ToString("0.00")) MB" -ForegroundColor Yellow
