# スライド音声分割の作業記録
作成日時: 2025年5月11日

## 実施した作業の概要
Salesforceのプレゼンテーション音声ファイル（salesforce_audio.wav）を、スライドごとのセグメントに分割する作業を実施しました。
スライドのタイムスタンプ情報に基づき、音声ファイルを各スライドに対応する個別のWAVファイルに分割しました。

## 問題点と解決手段
### 1. スライド間のタイムスタンプにギャップが存在
スライド構成案のタイムスタンプファイルにおいて、前のスライドの終了時間と次のスライドの開始時間の間にわずかな時間のギャップが存在していました。
これにより、音声が正確にスライドごとに区切られない問題がありました。

**解決策**: 
- `Salesforce_スライド構成案_詳細版_タイムスタンプ.txt` ファイルを編集し、各スライドの終了時間を次のスライドの開始時間と一致するように修正しました。
- 例えば、スライド1の終了時間を00:40.56から00:41.28（スライド2の開始時間）に修正しました。

### 2. スライドタイムスタンプに基づく音声分割スクリプトの作成
既存の `split_audio.py`（トランスクリプトに基づく音声分割用）を参考に、スライドのタイムスタンプに基づいて分割する専用のスクリプトを新たに作成しました。

**解決策**:
- 新しいPythonスクリプト `split_audio_by_slides.py` を作成し、スライドのタイムスタンプ情報を解析して音声ファイルを分割する機能を実装しました。
- スクリプトは正規表現を使用してタイムスタンプファイルからスライド情報と時間を抽出し、WAVファイルの対応する部分を切り出します。

## 実行結果
スクリプトの実行により、以下のファイルが生成されました：
- 合計11個のスライド用音声ファイル（`c:\public_work\slides_project\audio\slides\` ディレクトリに保存）
- 各ファイルは `スライドX_開始時間_終了時間_タイトル.wav` の形式で命名

## 使用スクリプトと実行方法
### スクリプト: split_audio_by_slides.py

```python
import os
import re
import argparse
import wave
import numpy as np

def parse_slide_timestamps(file_path):
    """スライドのタイムスタンプファイルから情報を抽出"""
    slides = []
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        
        # スライドごとに情報を抽出
        pattern = r'(スライド\d+|オプション \(\d+枚目\)): (.+?) \((\d+:\d+\.\d+) - (\d+:\d+\.\d+)\)'
        matches = re.findall(pattern, content)
        
        for match in matches:
            slide_num = match[0]  # スライド番号
            title = match[1]      # タイトル
            start_time_str = match[2]
            end_time_str = match[3]
            
            # 分と秒を分離し、秒に変換
            start_min, start_sec = start_time_str.split(':')
            end_min, end_sec = end_time_str.split(':')
            
            start_time = float(start_min) * 60 + float(start_sec)
            end_time = float(end_min) * 60 + float(end_sec)
            
            slides.append({
                'slide_num': slide_num,
                'title': title,
                'start': start_time,
                'end': end_time
            })
    return slides

def split_audio(audio_file, output_dir, slides):
    """音声ファイルをスライドごとに分割して保存"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print(f"音声ファイル {audio_file} を読み込んでいます...")
    with wave.open(audio_file, 'rb') as wav:
        # 音声ファイルのプロパティを取得
        n_channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        framerate = wav.getframerate()
        n_frames = wav.getnframes()
        
        # すべてのフレームを読み込む
        frames = wav.readframes(n_frames)
        audio_data = np.frombuffer(frames, dtype=np.int16)
        
        if n_channels == 2:  # ステレオの場合は形状を変更
            audio_data = audio_data.reshape(-1, 2)
    
    print(f"合計 {len(slides)} 個のスライドを処理します")
    for i, slide in enumerate(slides):
        # 秒をフレームに変換
        start_frame = int(slide['start'] * framerate)
        end_frame = int(slide['end'] * framerate)
          # スライド番号とタイトルでファイル名を作成（不正な文字を除去）
        slide_info = slide['slide_num']
        title_part = re.sub(r'[\\/*?:"<>|]', '', slide['title'])[:30]
        output_file = f"{output_dir}/{slide_info}_{slide['start']:.2f}_{slide['end']:.2f}_{title_part}.wav"
        
        print(f"スライド {i+1}/{len(slides)}: {start_frame} から {end_frame} フレームを抽出中...")
        
        # 指定区間のフレームを取得
        if n_channels == 1:  # モノラル
            segment_data = audio_data[start_frame:end_frame]
        else:  # ステレオ
            segment_data = audio_data[start_frame:end_frame, :].flatten()
        
        # 新しいWAVファイルとして保存
        with wave.open(output_file, 'wb') as out_wav:
            out_wav.setnchannels(n_channels)
            out_wav.setsampwidth(sample_width)
            out_wav.setframerate(framerate)
            out_wav.writeframes(segment_data.tobytes())
        
        print(f"  -> {output_file} を保存しました")

def main():
    parser = argparse.ArgumentParser(description="スライドタイムスタンプファイルを使って音声を分割します")
    parser.add_argument("--audio", required=True, help="分割する音声ファイルパス")
    parser.add_argument("--timestamps", required=True, help="スライドタイムスタンプファイルパス")
    parser.add_argument("--output", default="slides_audio", help="出力ディレクトリ")
    
    args = parser.parse_args()
    
    print("スライドタイムスタンプを解析しています...")
    slides = parse_slide_timestamps(args.timestamps)
    print(f"{len(slides)} 個のスライドが見つかりました")
    
    split_audio(args.audio, args.output, slides)
    print("音声分割が完了しました！")

if __name__ == "__main__":
    main()
```

### 実行コマンド
```powershell
cd c:\public_work\slides_project
python split_audio_by_slides.py --audio "c:\public_work\slides_project\salesforce_slides\salesforce_audio.wav" --timestamps "c:\public_work\slides_project\Salesforce_スライド構成案_詳細版_タイムスタンプ.txt" --output "c:\public_work\slides_project\audio\slides"
```

## 修正したタイムスタンプファイルの構造
元の `Salesforce_スライド構成案_詳細版_タイムスタンプ.txt` ファイルでは、スライド間にわずかな時間のギャップがありましたが、それを修正して各スライドの終了時間を次のスライドの開始時間と一致させました。

例：
- スライド1: 00:00.00 - 00:41.28 (元は00:40.56)
- スライド2: 00:41.28 - 01:06.90 (元は01:06.09)
- スライド3: 01:06.90 - 02:08.86 (元は02:07.54)

## 今後の課題
- 音声ファイルの品質チェック（不要なノイズや音量の均一化）
- スライド表示と音声の同期機能の実装
- 最終プレゼンテーションのパッケージング作業
