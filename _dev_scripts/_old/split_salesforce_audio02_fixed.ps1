# Salesforce Audio02 分割スクリプト
# 特殊文字を使わずにプレーンテキストで記述
# UTF-8 with BOM でエンコード

# 必要なモジュールがあれば読み込む
Add-Type -AssemblyName System.Windows.Forms

# 作業ディレクトリ設定
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$audioDir = Join-Path -Path $projectRoot -ChildPath "salesforce_slides\salesforce_slides02\audio"

# 出力ディレクトリが存在しない場合は作成
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Path $audioDir -Force | Out-Null
    Write-Host "出力ディレクトリを作成しました: $audioDir"
}

# 入力ファイルのパス（元の音声ファイル）
$sourceAudioFile = Join-Path -Path $projectRoot -ChildPath "salesforce_slides\Salesforce_audio02.wav"

# スライドのタイムスタンプ定義（トランスクリプトから抽出）
$slideSegments = @(
    @{
        slideNumber = 1;
        title = "slide1_title";
        start = 0;
        end = 40.56;
    },
    @{
        slideNumber = 2;
        title = "slide2_title";
        start = 40.56;
        end = 66.58;
    },
    @{
        slideNumber = 3;
        title = "slide3_title";
        start = 66.58;
        end = 128.86;
    },
    @{
        slideNumber = 4;
        title = "slide4_title";
        start = 128.86;
        end = 159.08;
    },
    @{
        slideNumber = 5;
        title = "slide5_title";
        start = 159.08;
        end = 196.70;
    },
    @{
        slideNumber = 6;
        title = "slide6_title";
        start = 196.70;
        end = 266.52;
    },
    @{
        slideNumber = 7;
        title = "slide7_title";
        start = 266.52;
        end = 287.58;
    },
    @{
        slideNumber = 8;
        title = "slide8_title";
        start = 287.58;
        end = 317.24;
    },
    @{
        slideNumber = 9;
        title = "slide9_title";
        start = 317.24;
        end = 353.82;
    },
    @{
        slideNumber = 10;
        title = "slide10_title";
        start = 353.82;
        end = 399.78;
    },
    @{
        slideNumber = 11;
        title = "slide11_title";
        start = 399.78;
        end = 452.40;
    },
    @{
        slideNumber = 12;
        title = "slide12_title";
        start = 452.40;
        end = 496.78;
    }
)

# FFmpegがインストールされているか確認
try {
    $ffmpegCheck = Invoke-Expression "ffmpeg -version" -ErrorAction SilentlyContinue
    if (-not $ffmpegCheck) {
        Write-Host "FFmpegが見つかりません。インストールして環境変数PATHに追加してください。"
        exit
    }
} catch {
    Write-Host "FFmpegが見つかりません。インストールして環境変数PATHに追加してください。"
    exit
}

Write-Host "音声分割を開始します..."

# 各スライドセグメントを処理
foreach ($segment in $slideSegments) {
    # 出力ファイル名（salesforce_audio_X.wavの形式）
    $audioNumber = $segment.slideNumber - 1
    $outputFile = Join-Path -Path $audioDir -ChildPath "salesforce_audio_$audioNumber.wav"
    
    # コマンド生成の前にパスがダブルクォートで囲まれていることを確認
    $sourceAudioFileQuoted = """$sourceAudioFile"""
    $outputFileQuoted = """$outputFile"""
    
    # FFmpegコマンド生成
    $startSeconds = $segment.start
    $duration = $segment.end - $segment.start
    
    # 小数点表記をカルチャに依存しない形式に
    $startString = $startSeconds.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    $durationString = $duration.ToString([System.Globalization.CultureInfo]::InvariantCulture)
    
    # FFmpegを実行して音声を分割
    $ffmpegCmd = "ffmpeg -y -i $sourceAudioFileQuoted -ss $startString -t $durationString -c copy $outputFileQuoted"
    Write-Host "処理中: スライド$($segment.slideNumber) - $($segment.title)"
    Write-Host $ffmpegCmd
    
    # FFmpegを呼び出す
    try {
        Invoke-Expression $ffmpegCmd | Out-Null
        if (Test-Path $outputFile) {
            Write-Host "作成完了: $outputFile" -ForegroundColor Green
        } else {
            Write-Host "エラー: $outputFile が作成できませんでした" -ForegroundColor Red
        }
    } catch {
        Write-Host "エラー: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "すべての音声ファイルの分割が完了しました！" -ForegroundColor Cyan
