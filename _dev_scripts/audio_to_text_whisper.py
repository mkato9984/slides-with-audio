#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
OpenAI Whisperを使用して音声ファイルからトークスクリプトを生成するPythonスクリプト
高精度な音声文字起こしが可能です
"""

import os
import sys
import argparse
import glob
import re
import datetime
import whisper
from tqdm import tqdm

def extract_number(filename):
    """ファイル名から数字を抽出する"""
    match = re.search(r'(\d+)', os.path.basename(filename))
    if match:
        return int(match.group(1))
    return 0

def main():
    # コマンドライン引数の処理
    parser = argparse.ArgumentParser(description='Whisperを使用して音声ファイルからテキストを生成')
    parser.add_argument('--audio-dir', default='./salesforce_slides/salesforce_slides01/audio',
                        help='音声ファイルのディレクトリ (デフォルト: ./salesforce_slides/salesforce_slides01/audio)')
    parser.add_argument('--output', default='./salesforce_slides/salesforce_slides01/transcript_whisper.txt',
                        help='出力ファイル (デフォルト: ./salesforce_slides/salesforce_slides01/transcript_whisper.txt)')
    parser.add_argument('--model', default='medium', choices=['tiny', 'base', 'small', 'medium', 'large'],
                        help='Whisperモデルサイズ (デフォルト: medium)')
    parser.add_argument('--language', default='ja', help='言語コード (デフォルト: ja)')
    parser.add_argument('--timestamp', action='store_true',
                        help='タイムスタンプを含める')
    
    args = parser.parse_args()
    
    # Whisperモデルの読み込み
    print(f"Whisperモデル '{args.model}' を読み込んでいます...")
    model = whisper.load_model(args.model)
    print("モデルの読み込みが完了しました")
    
    # 音声ファイルのリストを取得
    audio_files = glob.glob(os.path.join(args.audio_dir, "*.wav"))
    audio_files.sort(key=extract_number)
    
    if not audio_files:
        print(f"エラー: {args.audio_dir} に音声ファイルが見つかりませんでした")
        sys.exit(1)
    
    # 出力ファイルの初期化
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(f"# Salesforceプレゼンテーション - トークスクリプト (OpenAI Whisper使用)\n")
        f.write(f"# 生成日時: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"# モデル: {args.model}\n\n")
    
    print(f"音声ファイルからトークスクリプトを生成しています... ({len(audio_files)}ファイル)")
    
    # 各音声ファイルを処理
    for audio_file in tqdm(audio_files, desc="音声認識処理中"):
        try:
            # ファイル名から数字を抽出してスライド番号とする
            slide_number = extract_number(audio_file)
              # Whisperで音声認識
            result = model.transcribe(
                audio_file,
                language=args.language,
                fp16=False,  # GPUを使用しない場合はFalse
                word_timestamps=args.timestamp  # タイムスタンプが要求された場合
            )
              # 結果を出力ファイルに書き込む
            with open(args.output, 'a', encoding='utf-8') as f:
                f.write(f"## スライド {slide_number}\n")
                
                if args.timestamp and 'segments' in result:
                    # タイムスタンプ付きで出力
                    for segment in result['segments']:
                        start_time = segment['start']
                        end_time = segment['end']
                        start_formatted = f"{int(start_time//60):02d}:{int(start_time%60):02d}.{int(start_time*100%100):02d}"
                        end_formatted = f"{int(end_time//60):02d}:{int(end_time%60):02d}.{int(end_time*100%100):02d}"
                        f.write(f"[{start_formatted} → {end_formatted}] {segment['text'].strip()}\n")
                    f.write("\n")
                else:
                    # タイムスタンプなしで出力
                    f.write(f"{result['text'].strip()}\n\n")
            
        except Exception as e:
            print(f"エラー: {os.path.basename(audio_file)} の処理中に問題が発生しました: {e}")
            # エラーがあっても出力ファイルに記録
            with open(args.output, 'a', encoding='utf-8') as f:
                f.write(f"## スライド {slide_number}\n")
                f.write(f"※ エラー: 処理できませんでした\n\n")
    
    print(f"\n処理完了！トークスクリプトが生成されました: {args.output}")
    print("OpenAI Whisperの高精度音声認識エンジンを使用してトランスクリプトを生成しました")

if __name__ == "__main__":
    main()
