# 音声ファイルからテキストスクリプトを生成するPowerShellスクリプト（ローカル処理版）
# Windows 10以降のSpeech Recognition APIを使用

Add-Type -AssemblyName System.Speech

# 入力ディレクトリの設定 - 変更してください
$audioDir = ".\salesforce_slides\salesforce_slides01\audio"
$outputFile = ".\salesforce_slides\salesforce_slides01\transcript.txt"

# 出力ファイルの初期化
"# Salesforceプレゼンテーション - トークスクリプト" | Out-File -FilePath $outputFile -Encoding utf8
"# 生成日時: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $outputFile -Append -Encoding utf8
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# Speech RecognizerとGrammarの初期化
$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$grammar = New-Object System.Speech.Recognition.DictationGrammar
$recognizer.LoadGrammar($grammar)

# オーディオファイルの処理
$audioFiles = Get-ChildItem -Path $audioDir -Filter "*.wav" | Sort-Object Name

Write-Host "音声ファイルからテキストを生成しています..."
Write-Host "注意: ローカル処理では精度に制限があります"

foreach ($audioFile in $audioFiles) {
    $fullPath = $audioFile.FullName
    $slideNumber = [int]($audioFile.BaseName -replace "[^0-9]", "")
    
    Write-Host "処理中: $($audioFile.Name) (スライド $slideNumber)"
    
    # ファイルを読み込む
    try {
        $recognizer.SetInputToWaveFile($fullPath)
        
        # テキスト認識の実行
        $result = $recognizer.Recognize()
        
        if ($result -ne $null) {
            # 認識結果をファイルに書き込む
            "## スライド $slideNumber" | Out-File -FilePath $outputFile -Append -Encoding utf8
            $result.Text | Out-File -FilePath $outputFile -Append -Encoding utf8
            "" | Out-File -FilePath $outputFile -Append -Encoding utf8
        } else {
            "## スライド $slideNumber" | Out-File -FilePath $outputFile -Append -Encoding utf8
            "※ 音声認識に失敗しました" | Out-File -FilePath $outputFile -Append -Encoding utf8
            "" | Out-File -FilePath $outputFile -Append -Encoding utf8
        }
    }
    catch {
        Write-Host "エラー: $($audioFile.Name) の処理中にエラーが発生しました: $_"
        "## スライド $slideNumber" | Out-File -FilePath $outputFile -Append -Encoding utf8
        "※ エラー: 処理できませんでした" | Out-File -FilePath $outputFile -Append -Encoding utf8
        "" | Out-File -FilePath $outputFile -Append -Encoding utf8
    }
    finally {
        # 入力をリセット
        $recognizer.SetInputToNull()
    }
}

Write-Host "処理完了！トークスクリプトが生成されました: $outputFile"
Write-Host "注意: 日本語の認識精度はWindowsの音声認識エンジンの制限によりかなり低い可能性があります"
Write-Host "より高精度な結果が必要な場合は、Microsoft Speech to Text APIを使用するバージョンをお試しください"
