@echo off
REM filepath: c:\public_work\slides_project\rename_hq_audio.bat
setlocal enabledelayedexpansion

echo ???????????????????????...
cd c:\public_work\slides_project\salesforce_slides\salesforce_slides03\audio_renamed

if exist salesforce_audio_0_hq.wav (
  move /y salesforce_audio_0_hq.wav salesforce_audio_0.wav
  echo ?????0: ?????????
)

if exist salesforce_audio_1_hq.wav (
  move /y salesforce_audio_1_hq.wav salesforce_audio_1.wav
  echo ?????1: ?????????
)

if exist salesforce_audio_2_hq.wav (
  move /y salesforce_audio_2_hq.wav salesforce_audio_2.wav
  echo ?????2: ?????????
)

if exist salesforce_audio_3_hq.wav (
  move /y salesforce_audio_3_hq.wav salesforce_audio_3.wav
  echo ?????3: ?????????
)

if exist salesforce_audio_4_hq.wav (
  move /y salesforce_audio_4_hq.wav salesforce_audio_4.wav
  echo ?????4: ?????????
)

if exist salesforce_audio_test.wav (
  del salesforce_audio_test.wav
  echo ??????????????
)

echo ??????????
