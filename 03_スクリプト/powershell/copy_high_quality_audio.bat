@echo off
REM filepath: c:\public_work\slides_project\copy_high_quality_audio.bat

echo 高音質の音声ファイルを別の参照先にもコピーします...

REM 出力先ディレクトリの確認と作成
set "sourceDir=c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed"
set "targetDir=c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio"

REM ファイルをコピー
for %%i in (0 1 2 3 4 5 6 7 8 9 10 11) do (
    if exist "%sourceDir%\salesforce_audio_%%i.wav" (
        echo ファイルをコピー中: salesforce_audio_%%i.wav
        copy "%sourceDir%\salesforce_audio_%%i.wav" "%targetDir%\salesforce_audio_%%i.wav" /Y
    ) else (
        echo ファイルが見つかりません: salesforce_audio_%%i.wav
    )
)

echo コピー処理が完了しました。
pause
