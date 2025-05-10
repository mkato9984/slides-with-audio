/**
 * プレゼンター画面のスライド読み込み問題を修正するスクリプト
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('プレゼンター画面の読み込み修正を初期化します');
    
    // スライドとプレビュー要素を取得
    const currentSlidePreview = document.querySelector('.current-slide-preview');
    const nextSlidePreview = document.querySelector('.next-slide-preview');
    
    // スライド画像の読み込みエラー処理を強化
    function enhanceSlideImageLoading() {
        // 現在表示されているスライドのすべての画像要素にエラーハンドラを追加
        const slideImages = document.querySelectorAll('.slide-image');
        
        slideImages.forEach(img => {
            // 元の src を保存
            const originalSrc = img.src;
            
            // エラーハンドラを追加
            img.onerror = function() {
                console.error(`スライド画像の読み込みに失敗しました: ${originalSrc}`);
                
                // 再読み込みを試みる
                setTimeout(() => {
                    console.log(`スライド画像を再読み込みします: ${originalSrc}`);
                    img.src = originalSrc + '?reload=' + new Date().getTime();
                }, 1000);
                
                // 代替テキストをより詳細に
                this.alt = "画像の読み込みができませんでした";
            };
        });
    }
    
    // 初期の読み込み強化
    enhanceSlideImageLoading();
    
    // スライド変更時にも読み込み強化を適用
    document.addEventListener('slideChanged', function() {
        // 少し遅延させて確実に新しいスライド要素に対して処理
        setTimeout(enhanceSlideImageLoading, 500);
    });
    
    // ページが完全に読み込まれた後にも実行
    window.addEventListener('load', function() {
        enhanceSlideImageLoading();
        
        // スライドコンテナが表示されていない場合は強制的に表示
        if (currentSlidePreview && nextSlidePreview) {
            currentSlidePreview.style.display = 'flex';
            nextSlidePreview.style.display = 'flex';
        }
    });
    
    // 最後の保険として、5秒後に再度強化を適用
    setTimeout(enhanceSlideImageLoading, 5000);
});
