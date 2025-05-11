import os
import re
import argparse
import wave
import numpy as np

def parse_slides_timestamps(file_path):
    """スライド構成案のタイムスタンプファイルから時間情報を抽出"""
    slides = []
    slide_pattern = re.compile(r'スライド(\d+): (.*?) \((\d+:\d+\.\d+) - (\d+:\d+\.\d+)\)')
    
    with open(file_path, 'r', encoding='utf-8') as file:
        for line in file:
            match = slide_pattern.search(line)
            if match:
                slide_num = match.group(1)
                title = match.group(2)
                start_time_str = match.group(3)
                end_time_str = match.group(4)
                
                # 時間を秒に変換（MM:SS.ms形式）
                start_min, start_sec = start_time_str.split(':')
                end_min, end_sec = end_time_str.split(':')
                
                start_time = float(start_min) * 60 + float(start_sec)
                end_time = float(end_min) * 60 + float(end_sec)
                
                # タイトルから安全なファイル名を作成（不正な文字を除去）
                safe_title = re.sub(r'[\\/*?:"<>|]', '', title)
                safe_title = re.sub(r'\s+', '_', safe_title)  # スペースをアンダースコアに変換
                
                slides.append({
                    'number': int(slide_num),
                    'title': title,
                    'safe_title': safe_title,
                    'start': start_time,
                    'end': end_time
                })
    
    return slides

def split_audio(audio_file, output_dir, slides, audio_duration=None):
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
        
        # 音声の総再生時間（秒）
        total_duration = n_frames / framerate
        if audio_duration:
            total_duration = min(total_duration, audio_duration)
        
        print(f"音声ファイルの長さ: {total_duration:.2f}秒")
        
        # すべてのフレームを読み込む
        frames = wav.readframes(n_frames)
        audio_data = np.frombuffer(frames, dtype=np.int16)
        
        if n_channels == 2:  # ステレオの場合は形状を変更
            audio_data = audio_data.reshape(-1, 2)
    
    print(f"合計 {len(slides)} 個のスライドを処理します")
    
    for slide in slides:
        # 音声ファイルの長さを超える部分はスキップ
        if slide['start'] >= total_duration:
            print(f"スキップ: スライド{slide['number']} - {slide['title']} (開始時間が音声ファイルの長さを超えています)")
            continue
        
        # 終了時間を音声ファイルの長さに制限
        end_time = min(slide['end'], total_duration)
        duration = end_time - slide['start']
        
        if duration <= 0:
            print(f"スキップ: スライド{slide['number']} - {slide['title']} (長さが0以下です)")
            continue
        
        # 秒をフレームに変換
        start_frame = int(slide['start'] * framerate)
        end_frame = int(end_time * framerate)
        
        output_file = f"{output_dir}/audio_slide{slide['number']}_{slide['safe_title']}.wav"
        
        print(f"処理中: スライド{slide['number']} - {slide['title']} ({slide['start']:.2f}秒 - {end_time:.2f}秒)")
        
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
    
    print("すべてのスライド音声の分割が完了しました！")

def main():
    parser = argparse.ArgumentParser(description="スライドのタイムスタンプに基づいて音声ファイルを分割します")
    parser.add_argument("--audio", default="c:\\public_work\\slides_project\\salesforce_slides\\salesforce_audio.wav", 
                        help="分割する音声ファイルパス")
    parser.add_argument("--timestamps", default="c:\\public_work\\slides_project\\Salesforce_スライド構成案_詳細版_タイムスタンプ.txt", 
                        help="スライドのタイムスタンプファイルパス")
    parser.add_argument("--output", default="c:\\public_work\\slides_project\\audio\\slides", 
                        help="出力ディレクトリ")
    parser.add_argument("--duration", type=float, default=None,
                        help="音声ファイルの最大長さ（秒）。指定した場合、それ以上の部分は無視されます")
    
    args = parser.parse_args()
    
    print("スライドのタイムスタンプを解析しています...")
    slides = parse_slides_timestamps(args.timestamps)
    print(f"{len(slides)} 個のスライドが見つかりました")
    
    split_audio(args.audio, args.output, slides, args.duration)

if __name__ == "__main__":
    main()
