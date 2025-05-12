
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
