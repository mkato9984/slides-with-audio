@echo off
REM filepath: c:\public_work\slides_project\copy_audio_to_renamed.bat

echo 高音質の音声ファイルをHTML参照先の場所にコピーします...

REM 出力先ディレクトリの確認と作成
set "targetDir=c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed"
if not exist "%targetDir%" mkdir "%targetDir%"

REM 元のファイルパス
set "sourceDir=c:\public_work\slides_project\salesforce_slides\salesforce_slides01\audio"

REM ファイルをコピー
for %%i in (0 1 2 3 4 5 6 7 8 9 10 11) do (
    echo ファイルをコピー中: salesforce_audio_%%i.wav
    copy "%sourceDir%\salesforce_audio_%%i.wav" "%targetDir%\salesforce_audio_%%i.wav" /Y
)

echo コピー処理が完了しました。
