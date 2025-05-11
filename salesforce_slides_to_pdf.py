import os
import argparse
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Image, PageBreak
from reportlab.lib.units import mm
from PIL import Image as PILImage
import re

def images_to_pdf(image_paths, output_pdf):
    """
    複数の画像をPDFにまとめる関数
    """
    # A4横サイズのページ寸法を取得
    page_width, page_height = landscape(A4)
    
    # 余白サイズを設定 (最小限に)
    margin = 5 * mm
    
    # カスタムドキュメントテンプレートの作成
    doc = SimpleDocTemplate(
        output_pdf, 
        pagesize=landscape(A4),
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin
    )
    
    # 画像をPDFに追加するためのリスト
    elements = []
    
    # 各画像を追加
    for i, image_path in enumerate(image_paths):
        # 画像サイズを取得して適切に調整
        img = PILImage.open(image_path)
        width, height = img.size
        
        # 利用可能なスペースを計算
        available_width = page_width - 2 * margin
        available_height = page_height - 2 * margin
        
        # 画像のアスペクト比を保持したままサイズを適切に調整
        ratio = min(available_width / width, available_height / height)
        new_width = width * ratio
        new_height = height * ratio
        
        # ReportLabのImage要素として追加
        img = Image(image_path, width=new_width, height=new_height)
        elements.append(img)
        
        # 最後の画像でなければページ区切りを追加
        if i < len(image_paths) - 1:
            elements.append(PageBreak())
    
    # PDFを作成
    doc.build(elements)
    
    return output_pdf

def main():
    parser = argparse.ArgumentParser(description="Salesforceのスライド画像をPDFにまとめるスクリプト")
    parser.add_argument("--image_dir", 
                        default=r"c:\public_work\slides_project\salesforce_slides\salesforce_slides01",
                        help="画像が入ったディレクトリ")
    parser.add_argument("--output", 
                        default=r"c:\public_work\slides_project\salesforce_slides\salesforce_slides.pdf", 
                        help="出力PDFファイル名")
    
    args = parser.parse_args()
    
    # 実際の画像パスを格納するリスト
    image_paths = []
    
    # 既存の画像ファイルを探す
    if os.path.exists(args.image_dir):
        # スライド番号と画像ファイルのマッピングを格納する辞書
        slide_files = {}
        
        # すべての画像ファイルをリスト化
        for file in os.listdir(args.image_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                # パターン: slideXX.png
                pattern_match = re.search(r'slide(\d+)\.png', file.lower())
                
                slide_num = None
                if pattern_match:
                    slide_num = int(pattern_match.group(1))
                
                if slide_num is not None:
                    slide_files[slide_num] = os.path.join(args.image_dir, file)
        
        # スライドの枚数を決定
        max_slide = max(slide_files.keys()) if slide_files else 0
        
        # スライド番号順にファイルパスを追加
        for i in range(1, max_slide + 1):
            if i in slide_files:
                image_paths.append(slide_files[i])
            else:
                print(f"警告: スライド {i} の画像が見つかりませんでした")
    else:
        print(f"エラー: 画像ディレクトリ '{args.image_dir}' が存在しません。")
        return
    
    if image_paths:
        print(f"以下の {len(image_paths)} 枚の画像をPDFにまとめます:")
        for path in image_paths:
            print(f" - {os.path.basename(path)}")
        
        # PDFを作成
        pdf_path = images_to_pdf(image_paths, args.output)
        print(f"PDFを作成しました: {pdf_path}")
    else:
        print("画像が見つかりませんでした。処理を終了します。")

if __name__ == "__main__":
    main()
