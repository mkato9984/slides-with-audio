@echo off
setlocal enabledelayedexpansion

REM フォルダが存在しない場合は作成
if not exist "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed" (
    mkdir "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed"
)

REM スライド1のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド1_0.00_41.28_タイトル ＆ はじめに.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_0.wav"

REM スライド2のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド2_41.28_66.90_なぜ今Salesforceなのか？.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_1.wav"

REM スライド3のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド3_66.90_128.86_私たちが抱えていた「3つの大きな課題」.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_2.wav"

REM スライド4のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド4_128.86_159.08_Salesforceによる「3つの解決アプローチ」.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_3.wav"

REM スライド5のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド5_159.08_196.70_具体的な仕組み①：情報の一元管理と見える化.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_4.wav"

REM スライド6のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド6_196.70_266.52_具体的な仕組み②：柔軟なシステム構成.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_5.wav"

REM スライド7のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド7_266.52_287.58_具体的な仕組み③：ユーザー目線の工夫.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_6.wav"

REM スライド8のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド8_287.58_353.82_具体的な仕組み④：データ品質とセキュリティ.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_7.wav"

REM スライド9のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド9_353.82_399.78_期待される導入効果.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_8.wav"

REM スライド10のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\スライド10_399.78_452.40_まとめと次のステップ.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_9.wav"

REM スライド11（オプション）のファイルをコピー
copy "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio\オプション (11枚目)_452.40_490.88_将来展望.wav" "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed\salesforce_audio_10.wav"

REM 完了メッセージ
echo コピー完了
dir "c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed"
