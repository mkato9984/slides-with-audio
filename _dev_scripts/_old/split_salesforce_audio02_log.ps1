param(
    [string]$InputFile = "c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav",
    [string]$OutputDir = "c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio",
    [string]$LogFile = "c:\public_work\slides_project\_dev_scripts\audio_split_log.txt"
)

# トランスクリプト開始（ログをファイルに保存）
Start-Transcript -Path $LogFile -Force

# FFmpegがインストールされていることを確認
$ffmpegPath = "ffmpeg" # FFmpegのパス
Write-Host "Using FFmpeg path: $ffmpegPath"

# 入力ファイルが存在するかの確認
if (Test-Path $InputFile) {
    $fileInfo = Get-Item $InputFile
    Write-Host "Input file exists: $($fileInfo.FullName), Size: $($fileInfo.Length) bytes"
} else {
    Write-Error "Input file does not exist: $InputFile"
    Stop-Transcript
    exit 1
}

# 入力ファイルと出力ディレクトリの設定
$sourceAudio = $InputFile
$scriptOutputDir = $OutputDir

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $scriptOutputDir)) {
    New-Item -Path $scriptOutputDir -ItemType Directory -Force | Out-Null
    Write-Host "Created output directory: $scriptOutputDir"
} else {
    Write-Host "Output directory already exists: $scriptOutputDir"
}

# 音声ファイルの全長を最終タイムスタンプから推定
$audioDuration = [double]496.78 # 8:16分 (最後のタイムスタンプ + 余裕を持たせた値)
Write-Host "Estimated audio duration: $audioDuration seconds"

# トランスクリプトから抽出したタイムスタンプ情報
# スライド1～スライド12までのタイムスタンプを設定
$timestamps = @(
    @{start = 0.00; end = 40.56; number = 1; title = "Title_Introduction"},
    @{start = 40.56; end = 66.58; number = 2; title = "Why_Salesforce_Now"},
    @{start = 66.58; end = 128.86; number = 3; title = "Three_Major_Issues"},
    @{start = 128.86; end = 159.08; number = 4; title = "Three_Solution_Approaches"},
    @{start = 159.08; end = 196.70; number = 5; title = "Mechanism1_Info_Management"},
    @{start = 196.70; end = 266.52; number = 6; title = "Mechanism2_Flexible_System"},
    @{start = 266.52; end = 287.58; number = 7; title = "Mechanism3_User_Perspective"},
    @{start = 287.58; end = 317.24; number = 8; title = "Mechanism4_Data_Quality"},
    @{start = 317.24; end = 353.82; number = 9; title = "Access_Management"},
    @{start = 353.82; end = 399.78; number = 10; title = "Expected_Benefits"},
    @{start = 399.78; end = 452.40; number = 11; title = "Summary_Next_Steps"},
    @{start = 452.40; end = 496.78; number = 12; title = "Future_Outlook"}
)

Write-Host "Total segments to process: $($timestamps.Count)"

# 音声ファイルを分割
foreach ($segment in $timestamps) {
    $currentSegmentStart = [double]$segment.start
    $currentSegmentEnd = [double]$segment.end

    Write-Host "--------------------------------------------------"
    Write-Host "Processing segment: $($segment.title) (No.$($segment.number))"
    Write-Host "Defined start time: $($currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec, end time: $($currentSegmentEnd.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec"

    # 開始時刻が音声ファイルの長さを超えている場合はスキップ
    if ($currentSegmentStart -ge $audioDuration) {
        Write-Host "Warning: Segment start time ($($currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec) exceeds audio length ($($audioDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec). Skipping this segment."
        continue
    }

    # 実際のセグメント終了時刻を音声ファイルの長さでクランプ
    $clampedSegmentEnd = [System.Math]::Min($currentSegmentEnd, $audioDuration)

    # セグメントの長さを計算
    $segmentDuration = $clampedSegmentEnd - $currentSegmentStart

    Write-Host "Calculated start time: $($currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec, clamped end time: $($clampedSegmentEnd.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec"
    Write-Host "Calculated segment length: $($segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec"

    # セグメント長が0以下の場合はスキップ
    if ($segmentDuration -le 0) {
        Write-Host "Warning: Calculated segment length is 0 or less ($($segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture)) sec). Skipping this segment."
        continue
    }

    # 出力ファイル名をsalesforce_audio_X.wav形式に変更 (既存のパターンに合わせる)
    $outputFileNumber = $segment.number - 1 # スライド1 は audioファイル0 に対応するようにする
    $outputFile = Join-Path -Path $scriptOutputDir -ChildPath "salesforce_audio_$($outputFileNumber).wav"
    
    # FFmpeg に渡すために、カルチャ非依存の文字列形式に変換
    $startString = $currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $durationString = $segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture)

    # エスケープが必要な場合はパスをダブルクォートで囲む
    $sourceAudioQuoted = "`"$sourceAudio`""
    $outputFileQuoted = "`"$outputFile`""

    Write-Host "Running FFmpeg command: $ffmpegPath -i $sourceAudioQuoted -ss $startString -t $durationString -c copy -y $outputFileQuoted"
    
    try {
        # FFmpegを使用して音声を分割
        $process = Start-Process -FilePath $ffmpegPath -ArgumentList "-i", $sourceAudio, "-ss", $startString, "-t", $durationString, "-c", "copy", "-y", $outputFile -NoNewWindow -PassThru -Wait
        $exitCode = $process.ExitCode
        
        if ($exitCode -eq 0) {
            if (Test-Path $outputFile) {
                $outputSize = (Get-Item $outputFile).Length
                Write-Host "Success: $outputFile has been created (Size: $outputSize bytes)" -ForegroundColor Green
            } else {
                Write-Host "Warning: $outputFile was not found after FFmpeg reported success" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Error: Failed to create $outputFile (FFmpeg exit code: $exitCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Exception occurred: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "--------------------------------------------------"
Write-Host "All audio file splitting has been completed" -ForegroundColor Green

# トランスクリプト終了
Stop-Transcript
