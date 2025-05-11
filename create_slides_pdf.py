import os
import sys
import img2pdf
from natsort import natsorted

def create_pdf_from_images(image_folder, output_pdf_name):
    """
    指定されたフォルダ内のPNG画像を自然順ソートして1つのPDFファイルにまとめる。

    Args:
        image_folder (str): 画像ファイルが格納されているフォルダのパス。
        output_pdf_name (str): 出力するPDFファイル名。
    """
    try:
        print(f"指定されたフォルダをチェック中: {image_folder}")
        if not os.path.exists(image_folder):
            print(f"エラー: 指定されたフォルダが存在しません: {image_folder}")
            return None
            
        # フォルダ内のファイルを確認
        all_files = os.listdir(image_folder)
        print(f"フォルダ内のファイル数: {len(all_files)}")
        
        # フォルダ内のPNGファイルを取得
        image_files = [
            os.path.join(image_folder, f)
            for f in all_files
            if f.lower().startswith("slide") and f.lower().endswith(".png")
        ]

        if not image_files:
            print(f"エラー: フォルダ '{image_folder}' に 'slideXX.png' という形式のPNGファイルが見つかりません。")
            return

        # ファイル名を自然順ソート (例: slide1.png, slide2.png, ..., slide10.png, slide11.png)
        sorted_image_files = natsorted(image_files)

        print("PDFに変換する画像ファイル (順番):")
        for img_file in sorted_image_files:
            print(f"- {os.path.basename(img_file)}")

        # 画像をPDFに変換
        pdf_bytes = img2pdf.convert(sorted_image_files)        output_pdf_path = os.path.join(image_folder, output_pdf_name)
        with open(output_pdf_path, "wb") as f:
            f.write(pdf_bytes)
            
        print(f"\nPDFファイルが正常に作成されました: {output_pdf_path}")
        return output_pdf_path
    except ImportError:
        print("エラー: 必要なライブラリ (img2pdf または natsort) がインストールされていません。")
        print("コマンドプロンプトまたはターミナルで pip install img2pdf natsort を実行してください。")
        return None
    except Exception as e:
        print(f"PDF作成中にエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # 画像フォルダのパス (Windowsのパス区切り文字に注意)
    image_folder_path = r"c:\public_work\slides_project\salesforce_slides\salesforce_slides01"
    # 出力するPDFファイル名
    output_filename = "combined_slides.pdf"

    result = create_pdf_from_images(image_folder_path, output_filename)
    if result:
        print(f"PDFファイルへのパス: {result}")
