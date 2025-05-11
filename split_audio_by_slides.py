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
