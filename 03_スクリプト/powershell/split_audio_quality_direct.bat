@echo off
setlocal enabledelayedexpansion

REM 入力ファイルと出力ディレクトリの設定
set "sourceAudio=c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav"
set "outputDir=c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed"

REM 出力ディレクトリが存在しない場合は作成
if not exist "%outputDir%" mkdir "%outputDir%"

REM 高音質設定でのFFmpegオプション - 音質問題解決のためパラメータ調整
set "ffmpeg_quality_options=-c:a pcm_s16le -ar 48000 -af loudnorm=I=-16:LRA=11:TP=-1.5 -q:a 0"

echo 高音質エンコードで音声分割を開始します...
echo 入力ファイル: %sourceAudio%
echo 出力ディレクトリ: %outputDir%
echo.

REM セグメント処理 (1つ目のセグメントのみ処理してテスト)
ffmpeg -i "%sourceAudio%" -ss 0 -t 40 %ffmpeg_quality_options% -y "%outputDir%\salesforce_audio_0.wav"
if %ERRORLEVEL% EQU 0 (
    echo [成功] テストセグメント作成完了
) else (
    echo [エラー] FFmpeg実行に失敗しました
    pause
    exit /b 1
)

REM テスト成功したら残りを処理
call :process_segment 40 67 1
call :process_segment 67 129 2
call :process_segment 129 159 3
call :process_segment 159 197 4
call :process_segment 197 267 5
call :process_segment 267 288 6
call :process_segment 288 317 7
call :process_segment 317 354 8
call :process_segment 354 400 9
call :process_segment 400 452 10
call :process_segment 452 497 11

echo.
echo 分割処理が完了しました。全てのファイルを作成しました。
echo 完了には長時間かかる可能性があります。
pause
goto :eof

:process_segment
set /a start=%1
set /a end=%2
set /a index=%3
set /a duration=%end%-%start%

set "outputFile=%outputDir%\salesforce_audio_%index%.wav"

echo セグメント %index%: %start%秒 から %end%秒 (長さ: %duration%秒)
echo 出力ファイル: %outputFile%

REM FFmpegコマンド実行 (高音質設定)
ffmpeg -i "%sourceAudio%" -ss %start% -t %duration% %ffmpeg_quality_options% -y "%outputFile%"

if %ERRORLEVEL% EQU 0 (
    echo [成功] ファイル作成完了: %outputFile%
) else (
    echo [エラー] ファイル作成失敗: %outputFile%
)
echo.

goto :eof
