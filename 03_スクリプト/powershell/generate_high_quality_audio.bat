@echo off
REM filepath: c:\public_work\slides_project\generate_high_quality_audio.bat
setlocal enabledelayedexpansion

echo ===================================================
echo 高音質音声変換ユーティリティ - 2025/05/12
echo ===================================================
echo.

REM 入力ファイルと出力ディレクトリの設定
set "sourceAudio=c:\public_work\slides_project\salesforce_slides\Salesforce_audio02.wav"
set "outputDir=c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed"
set "outputDir2=c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio"

REM 出力ディレクトリが存在しない場合は作成
if not exist "%outputDir%" mkdir "%outputDir%"
if not exist "%outputDir2%" mkdir "%outputDir2%"

REM 高音質設定でのFFmpegオプション - さらに音質向上
set "ffmpeg_quality_options=-c:a pcm_s16le -ar 48000 -af loudnorm=I=-16:LRA=11:TP=-1.5 -q:a 0"

echo 音声分割と高音質変換を開始します...
echo 入力ファイル: %sourceAudio%
echo 出力ディレクトリ1: %outputDir% (minimal_slides.html用)
echo 出力ディレクトリ2: %outputDir2% (salesforce_minimal_slides01.html用)
echo.
echo FFmpegエンコードオプション: %ffmpeg_quality_options%
echo.

REM セグメント情報の配列
echo セグメント情報を設定しています...
set segment_data[0]=0 40 "タイトル_はじめに"
set segment_data[1]=40 67 "なぜ今Salesforceなのか"
set segment_data[2]=67 129 "3つの大きな課題"
set segment_data[3]=129 159 "3つの解決アプローチ"
set segment_data[4]=159 197 "具体的な仕組み1_情報の一元管理と見える化"
set segment_data[5]=197 267 "具体的な仕組み2_柔軟なシステム構成"
set segment_data[6]=267 288 "具体的な仕組み3_ユーザー目線の工夫"
set segment_data[7]=288 317 "具体的な仕組み4_データ品質とセキュリティ"
set segment_data[8]=317 354 "アクセス権管理"
set segment_data[9]=354 400 "期待される導入効果"
set segment_data[10]=400 452 "まとめと次のステップ"
set segment_data[11]=452 497 "将来展望"

REM セグメント数
set "total_segments=12"
set "success_count=0"

REM すべてのセグメントを処理
for /L %%i in (0,1,11) do (
    call :process_segment %%i
)

echo.
echo ===================================================
echo 処理結果: 成功 %success_count%/%total_segments% セグメント
echo ===================================================

pause
exit /b 0

:process_segment
set segment_index=%1
call set segment_info=%%segment_data[%segment_index%]%%

for /f "tokens=1,2,*" %%a in ("%segment_info%") do (
    set start=%%a
    set end=%%b
    set description=%%c
)

set /a duration=%end%-%start%
set outputFile1=%outputDir%\salesforce_audio_%segment_index%.wav
set outputFile2=%outputDir2%\salesforce_audio_%segment_index%.wav

echo.
echo ===================================================
echo セグメント %segment_index% の処理: [%start%秒 - %end%秒] 長さ: %duration%秒
echo 内容: %description%
echo 出力ファイル1: %outputFile1%
echo ===================================================

echo FFmpegでセグメント %segment_index% を処理しています...
ffmpeg -i "%sourceAudio%" -ss %start% -t %duration% %ffmpeg_quality_options% -y "%outputFile1%" 

if %ERRORLEVEL% EQU 0 (
    echo [成功] ファイル作成完了: %outputFile1%
    
    echo ファイルを2番目の出力先にコピーしています...
    copy "%outputFile1%" "%outputFile2%" /Y > NUL
    
    if %ERRORLEVEL% EQU 0 (
        echo [成功] コピー完了: %outputFile2%
        set /a success_count+=1
    ) else (
        echo [エラー] コピー失敗: %outputFile2%
    )
) else (
    echo [エラー] ファイル作成失敗: %outputFile1%
)

exit /b
