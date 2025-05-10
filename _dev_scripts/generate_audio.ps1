# Audio file generator script
Add-Type -AssemblyName System.Speech

# Check output directory
$outputDir = ".\audio"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# Create speech synthesizer
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer

# Speech settings
$synthesizer.Rate = 0
$synthesizer.Volume = 100

# Slide text content in English (to avoid encoding issues)
$slideText1 = "This is slide 1. Introduction to Salesforce implementation."
$slideText2 = "This is slide 2. Current challenges in customer management."
$slideText3 = "This is slide 3. Salesforce implementation concept."
$slideText4 = "This is slide 4. Duplicate check functionality."
$slideText5 = "This is slide 5. Reporting capabilities."
$slideText6 = "This is slide 6. Summary and future vision."

# Generate WAV file 1
$outputFile1 = "$outputDir\audio_1.wav"
Write-Host "Generating: $outputFile1"
$synthesizer.SetOutputToWaveFile($outputFile1)
$synthesizer.Speak($slideText1)
$synthesizer.SetOutputToNull()
Write-Host "Generated: $outputFile1"

# Generate WAV file 2
$outputFile2 = "$outputDir\audio_2.wav"
Write-Host "Generating: $outputFile2"
$synthesizer.SetOutputToWaveFile($outputFile2)
$synthesizer.Speak($slideText2)
$synthesizer.SetOutputToNull()
Write-Host "Generated: $outputFile2"

# Generate WAV file 3
$outputFile3 = "$outputDir\audio_3.wav"
Write-Host "Generating: $outputFile3"
$synthesizer.SetOutputToWaveFile($outputFile3)
$synthesizer.Speak($slideText3)
$synthesizer.SetOutputToNull()
Write-Host "Generated: $outputFile3"

# Generate WAV file 4
$outputFile4 = "$outputDir\audio_4.wav"
Write-Host "Generating: $outputFile4"
$synthesizer.SetOutputToWaveFile($outputFile4)
$synthesizer.Speak($slideText4)
$synthesizer.SetOutputToNull()
Write-Host "Generated: $outputFile4"

# Generate WAV file 5
$outputFile5 = "$outputDir\audio_5.wav"
Write-Host "Generating: $outputFile5"
$synthesizer.SetOutputToWaveFile($outputFile5)
$synthesizer.Speak($slideText5)
$synthesizer.SetOutputToNull()
Write-Host "Generated: $outputFile5"

# Generate WAV file 6
$outputFile6 = "$outputDir\audio_6.wav"
Write-Host "Generating: $outputFile6"
$synthesizer.SetOutputToWaveFile($outputFile6)
$synthesizer.Speak($slideText6)
$synthesizer.SetOutputToNull()
Write-Host "Generated: $outputFile6"

Write-Host "All audio files have been generated."