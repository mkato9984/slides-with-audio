param(
    [string]$InputFile = "c:\\public_work\\slides_project\\salesforce_slides\\salesforce_audio.wav",
    [string]$OutputDir = "c:\\public_work\\slides_project\\audio"
)

# FFmpegがインストールされていることを確認
$ffmpegPath = "ffmpeg" # FFmpegのパス。環境変数にパスが通っていれば、これでOK。

# 入力ファイルと出力ディレクトリの設定
$sourceAudio = $InputFile
$scriptOutputDir = $OutputDir

# 音声ファイルの実際の長さ (秒) - 事前に確認した値
$audioDuration = [double]340.29

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $scriptOutputDir)) {
    New-Item -Path $scriptOutputDir -ItemType Directory | Out-Null
    Write-Host "出力ディレクトリを作成しました: $scriptOutputDir"
}

# タイムスタンプの定義（スライドごとの開始時間と終了時間）
# Salesforce_スライド構成案_詳細版_タイムスタンプ.txt の内容と音声ファイルの長さに基づいて更新
$timestamps = @(
    @{start = [double]0.00; end = [double]41.28; number = 1; title = "slide1_title_and_intro"},
    @{start = [double]41.28; end = [double]66.90; number = 2; title = "slide2_why_salesforce_now"},
    @{start = [double]66.90; end = [double]128.86; number = 3; title = "slide3_three_major_issues"},
    @{start = [double]128.86; end = [double]159.08; number = 4; title = "slide4_three_solutions_by_salesforce"},
    @{start = [double]159.08; end = [double]196.70; number = 5; title = "slide5_mechanism1_centralized_visualization"},
    @{start = [double]196.70; end = [double]266.52; number = 6; title = "slide6_mechanism2_flexible_system_config"},
    @{start = [double]266.52; end = [double]287.58; number = 7; title = "slide7_mechanism3_user_centric_design"},
    @{start = [double]287.58; end = [double]$audioDuration; number = 8; title = "slide8_mechanism4_data_quality_security"} # 実際の音声の長さに合わせて終了時刻を調整
)

# 音声ファイルを分割
foreach ($segment in $timestamps) {
    $currentSegmentStart = [double]$segment.start
    $currentSegmentEnd = [double]$segment.end # この値は $audioDuration で既にキャップされている可能性がある

    Write-Host "--------------------------------------------------"
    Write-Host "処理対象セグメント: $($segment.title) (No.$($segment.number))"
    Write-Host "定義された開始時刻: $($currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒, 終了時刻: $($currentSegmentEnd.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒"

    # 開始時刻が音声ファイルの長さを超えている場合はスキップ
    if ($currentSegmentStart -ge $audioDuration) {
        Write-Host "警告: セグメント開始時刻 ($($currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒) が音声ファイルの長さ ($($audioDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒) を超えているため、このセグメントをスキップします。"
        continue
    }

    # 実際のセグメント終了時刻を音声ファイルの長さでクランプ
    $clampedSegmentEnd = [System.Math]::Min($currentSegmentEnd, $audioDuration)

    # セグメントの長さを計算
    $segmentDuration = $clampedSegmentEnd - $currentSegmentStart

    Write-Host "計算された開始時刻: $($currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒, クランプされた終了時刻: $($clampedSegmentEnd.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒"
    Write-Host "計算されたセグメント長: $($segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒"

    # セグメント長が0以下の場合はスキップ
    if ($segmentDuration -le 0) {
        Write-Host "警告: 計算されたセグメント長が0秒以下 ($($segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture))秒) のため、このセグメントをスキップします。"
        continue
    }

    # 出力ファイル名を スライド番号_タイトル.wav 形式に変更 (タイトルはファイル名として使えるように簡易化)
    $safeTitle = $segment.title -replace '[^a-zA-Z0-9_.-]', '_' -replace '_+', '_' -replace '^_+|_$', ''
    $outputFile = Join-Path -Path $scriptOutputDir -ChildPath "audio_slide$($segment.number)_$($safeTitle).wav"
    
    # FFmpeg に渡すために、カルチャ非依存の文字列形式に変換
    $startString = $currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $durationString = $segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture)

    Write-Host "FFmpegコマンド実行: $ffmpegPath -i \`"$sourceAudio\`" -ss $startString -t $durationString -c copy -y \`"$outputFile\`""
    
    # FFmpegを使用して音声を分割
    & $ffmpegPath -i $sourceAudio -ss $startString -t $durationString -c copy -y $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "成功: $outputFile が作成されました"
    } else {
        Write-Host "エラー: $outputFile の作成に失敗しました (FFmpeg exit code: $LASTEXITCODE)"
    }
}

Write-Host "--------------------------------------------------"
Write-Host "すべての音声ファイルの分割処理が完了しました"