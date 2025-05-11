# Microsoft Azure Cognitive Services - Speech to Textを使って
# 音声ファイルからトークスクリプトを生成するPowerShellスクリプト

# パラメータ - 必要に応じて変更してください
param(
    [string]$audioDir = ".\salesforce_slides\salesforce_slides01\audio", # 音声ファイルのディレクトリ
    [string]$outputFile = ".\salesforce_slides\salesforce_slides01\transcript_azure.txt", # 出力するトランスクリプトファイル
    [string]$subscriptionKey = "", # Azure Speech Service キー
    [string]$region = "japaneast", # リージョン（例: japaneast）
    [string]$language = "ja-JP" # 言語コード（日本語）
)

# サブスクリプションキーが指定されていない場合は入力を求める
if ([string]::IsNullOrEmpty($subscriptionKey)) {
    $subscriptionKey = Read-Host -Prompt "Azure Speech ServiceのAPIキーを入力してください"
}

# 出力ファイルの初期化
"# Salesforceプレゼンテーション - トークスクリプト (Microsoft Speech to Text使用)" | Out-File -FilePath $outputFile -Encoding utf8
"# 生成日時: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $outputFile -Append -Encoding utf8
"" | Out-File -FilePath $outputFile -Append -Encoding utf8

# オーディオファイルの取得と並べ替え
$audioFiles = Get-ChildItem -Path $audioDir -Filter "*.wav" | Sort-Object Name

Write-Host "音声ファイルからトークスクリプトを生成しています..."
Write-Host "Azure Speech Serviceを使用して高精度な音声認識を行います"

# Authorization Tokenの取得
$tokenEndpoint = "https://$region.api.cognitive.microsoft.com/sts/v1.0/issuetoken"
$headers = @{
    "Ocp-Apim-Subscription-Key" = $subscriptionKey
}

try {
    $accessToken = Invoke-RestMethod -Uri $tokenEndpoint -Method Post -Headers $headers
    Write-Host "認証トークンを取得しました"
}
catch {
    Write-Host "エラー: 認証トークンの取得に失敗しました: $_"
    Write-Host "APIキーとリージョンが正しいか確認してください"
    exit
}

# 各音声ファイルに対して処理
foreach ($audioFile in $audioFiles) {
    $fullPath = $audioFile.FullName
    # ファイル名から数字だけを抽出してスライド番号とする
    $slideNumber = [int]($audioFile.BaseName -replace "[^0-9]", "")
    
    Write-Host "処理中: $($audioFile.Name) (スライド $slideNumber)"
    
    # Speech to Text APIのエンドポイント
    $speechToTextUrl = "https://$region.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=$language&format=detailed"
    
    # 認証ヘッダーの設定
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Content-Type" = "audio/wav; codecs=audio/pcm; samplerate=16000"
        "Accept" = "application/json"
    }
    
    try {
        # 音声ファイルをバイナリとして読み込む
        $audioBytes = [System.IO.File]::ReadAllBytes($fullPath)
        
        # APIにリクエストを送信
        $response = Invoke-RestMethod -Uri $speechToTextUrl -Method Post -Headers $headers -Body $audioBytes
        
        # 結果を書き込み
        "## スライド $slideNumber" | Out-File -FilePath $outputFile -Append -Encoding utf8
        
        if ($response.RecognitionStatus -eq "Success" -and $response.NBest.Count -gt 0) {
            # 最も信頼度の高い結果を取得
            $recognizedText = $response.NBest[0].Display
            $recognizedText | Out-File -FilePath $outputFile -Append -Encoding utf8
        }
        else {
            "※ 音声認識に失敗しました。ステータス: $($response.RecognitionStatus)" | Out-File -FilePath $outputFile -Append -Encoding utf8
        }
        
        "" | Out-File -FilePath $outputFile -Append -Encoding utf8
    }
    catch {
        Write-Host "エラー: $($audioFile.Name) の処理中にエラーが発生しました: $_"
        "## スライド $slideNumber" | Out-File -FilePath $outputFile -Append -Encoding utf8
        "※ エラー: 処理できませんでした" | Out-File -FilePath $outputFile -Append -Encoding utf8
        "" | Out-File -FilePath $outputFile -Append -Encoding utf8
    }
    
    # 少し待機してAPI制限に引っかからないようにする
    Start-Sleep -Seconds 1
}

Write-Host "処理完了！トークスクリプトが生成されました: $outputFile"
Write-Host "Microsoftの高精度音声認識エンジンを使用してトランスクリプトを生成しました"
