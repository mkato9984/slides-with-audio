/**
 * プレゼンター画面のスライド表示スタイルを修正するCSS（強化版）
 * スライドが確実に表示されるよう、スタイルを上書きします
 */

(function() {
    // スタイル要素を作成
    const style = document.createElement('style');
    style.innerHTML = `
        /* スライド画像が確実に表示されるようにする */
        .current-slide-preview, .next-slide-preview {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: #2c3e50 !important;
            min-height: 200px !important;
            padding: 10px !important;
            position: relative !important;
            overflow: hidden !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2) !important;
            margin: 5px !important;
        }
        
        /* スライド画像のスタイル */
        .slide-image {
            max-width: 100% !important;
            max-height: 100% !important;
            object-fit: contain !important;
            display: block !important;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3) !important;
            background-color: white !important;
            border-radius: 2px !important;
        }
        
        .current-slide-img {
            border: 2px solid rgba(52, 152, 219, 0.8) !important;
        }
        
        .next-slide-img {
            border: 2px solid rgba(46, 204, 113, 0.8) !important;
        }
        
        /* 次へボタンのスタイル */
        .next-label {
            position: absolute !important;
            top: 10px !important;
            right: 10px !important;
            background-color: rgba(52, 152, 219, 0.7) !important;
            color: white !important;
            padding: 3px 8px !important;
            border-radius: 3px !important;
            font-size: 12px !important;
            z-index: 10 !important;
        }
        
        /* エラー表示時のスタイル */
        img[alt*="読み込めません"], img[alt*="読み込みができませんでした"] {
            position: relative !important;
            min-height: 100px !important;
            min-width: 200px !important;
            background-color: #34495e !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: white !important;
            border: 2px dashed #e74c3c !important;
        }
        
        /* プレースホルダスタイル（読み込み失敗時） */
        .slide-placeholder {
            position: absolute !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: rgba(41, 128, 185, 0.9) !important;
            color: white !important;
            font-weight: bold !important;
            width: 85% !important;
            height: 85% !important;
            z-index: 5 !important;
            padding: 20px !important;
            border-radius: 10px !important;
            text-align: center !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.5) !important;
        }
        
        .slide-placeholder p {
            margin: 5px 0 !important;
            font-size: 16px !important;
        }
        
        /* スライド画像のロード中のスタイル */
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.9; }
            100% { opacity: 0.6; }
        }
        
        .slide-image:not([src]), .slide-image[src=""] {
            background-color: #34495e !important;
            animation: pulse 1.5s infinite !important;
            min-height: 200px !important;
            min-width: 300px !important;
        }
        
        /* 修正スタイル：プレゼンタービュー全体を強制表示 */
        .presenter-view {
            display: grid !important;
            grid-template-rows: 1fr !important;
            height: calc(100vh - 60px) !important;
        }
        
        /* 全般的なスライド操作用スタイル */
        .slide-controls {
            z-index: 100 !important;
            position: relative !important;
        }
        
        /* ボタンの視認性向上 */
        .btn {
            box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
            transition: all 0.2s ease !important;
        }
        
        .btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        }
        
        .btn:active {
            transform: translateY(0) !important;
        }
    `;
    
    // スタイルをドキュメントに追加
    document.head.appendChild(style);
    console.log('プレゼンター画面のスタイルを修正しました');
})();
