param(
    [string]$InputFile = "c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav",
    [string]$OutputDir = "c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio"
)

# FFmpegがインストールされていることを確認
$ffmpegPath = "ffmpeg" # FFmpegのパス。環境変数にパスが通っていれば、これでOK。

# 入力ファイルと出力ディレクトリの設定
$sourceAudio = $InputFile
$scriptOutputDir = $OutputDir

# 音声ファイルの全長を最終タイムスタンプから推定
$audioDuration = [double]496.78 # 8:16分 (最後のタイムスタンプ + 余裕を持たせた値)

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $scriptOutputDir)) {
    New-Item -Path $scriptOutputDir -ItemType Directory | Out-Null
    Write-Host "出力ディレクトリを作成しました: $scriptOutputDir"
}

# Salesforce_audio02-1_transcript.txtからのタイムスタンプ情報
# スライド1～スライド11までのタイムスタンプを設定
$timestamps = @(
    @{start = [double]0.00; end = [double]41.28; number = 1; title = "slide1_title_and_intro"},
    @{start = [double]41.28; end = [double]66.90; number = 2; title = "slide2_why_salesforce_now"},
    @{start = [double]66.90; end = [double]128.86; number = 3; title = "slide3_three_major_issues"},
    @{start = [double]128.86; end = [double]159.08; number = 4; title = "slide4_three_solutions_by_salesforce"},
    @{start = [double]159.08; end = [double]196.70; number = 5; title = "slide5_mechanism1_centralized_visualization"},
    @{start = [double]196.70; end = [double]266.52; number = 6; title = "slide6_mechanism2_flexible_system_config"},
    @{start = [double]266.52; end = [double]287.58; number = 7; title = "slide7_mechanism3_user_centric_design"},
    @{start = [double]287.58; end = [double]353.82; number = 8; title = "slide8_mechanism4_data_quality_security"},
    @{start = [double]353.82; end = [double]399.78; number = 9; title = "slide9_access_management"},
    @{start = [double]399.78; end = [double]459.78; number = 10; title = "slide10_expected_effects"},
    @{start = [double]459.78; end = [double]$audioDuration; number = 11; title = "slide11_summary_next_steps"}
)

# 音声ファイルを分割
foreach ($segment in $timestamps) {
    $currentSegmentStart = [double]$segment.start
    $currentSegmentEnd = [double]$segment.end

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

    # 出力ファイル名をsalesforce_audio_X.wav形式に変更 (既存のパターンに合わせる)
    $outputFileNumber = $segment.number - 1 # スライド1 は audioファイル0 に対応するようにする
    $outputFile = Join-Path -Path $scriptOutputDir -ChildPath "salesforce_audio_$($outputFileNumber).wav"
    
    # FFmpeg に渡すために、カルチャ非依存の文字列形式に変換
    $startString = $currentSegmentStart.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $durationString = $segmentDuration.ToString([System.Globalization.CultureInfo]::InvariantCulture)

    Write-Host "FFmpegコマンド実行: $ffmpegPath -i `"$sourceAudio`" -ss $startString -t $durationString -c copy -y `"$outputFile`""
    
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
