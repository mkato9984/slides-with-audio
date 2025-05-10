/**
 * スライド状態をリセットするスクリプト - 強化版
 * このスクリプトはページ読み込み時に実行され、初期状態を確実にスライド1に設定します
 * 自動再生状態を必ず無効にするため、複数の方法で状態をリセットします
 */

// スクリプトの優先度を高く設定し、他のスクリプトより先に実行されるようにします
(function() {
    console.log('スライド状態リセットスクリプト（強化版）を実行します');
    
    // スライドの初期状態をリセット
    localStorage.setItem('sf01_currentSlide', '1');
    
    // 自動再生の状態を複数の箇所でオフにリセット
    localStorage.setItem('sf01_autoplayState', 'inactive');
    localStorage.removeItem('sf01_autoplayEnabled');
    
    // グローバル状態もリセット
    if (window.globalAutoplayState !== undefined) {
        window.globalAutoplayState = false;
    }
    
    if (window.SlideshowCore && window.SlideshowCore.state) {
        window.SlideshowCore.state.autoplayEnabled = false;
    }
    
    // 同期の衝突を防ぐため他の状態もクリア
    localStorage.removeItem('sf01_syncCommand');
    localStorage.removeItem('sf01_syncCommandFromPresenter');
    localStorage.removeItem('sf01_audioCommand');
    localStorage.removeItem('sf01_audioCommandFromPresenter');
    
    // コンソールにリセット操作を記録
    console.log('スライド状態を強制的にリセットしました: スライド番号=1, 自動再生=無効');
})();

// DOMContentLoadedイベントでも再度実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM読み込み完了後、再度状態をリセットします');
    
    // スライドの初期状態を再確認
    localStorage.setItem('sf01_currentSlide', '1');
    
    // 自動再生の状態を再度オフに設定
    localStorage.setItem('sf01_autoplayState', 'inactive');
    
    // 自動再生ボタンのUI状態も直接リセット
    const autoplayBtn = document.getElementById('autoplay-btn');
    if (autoplayBtn) {
        autoplayBtn.classList.remove('active');
        console.log('自動再生ボタンのUI状態をリセットしました');
    }
    
    // コアモジュールの状態も更新
    if (window.SlideshowCore && typeof window.SlideshowCore.setAutoplayState === 'function') {
        window.SlideshowCore.setAutoplayState(false);
        console.log('SlideshowCoreの自動再生状態をリセットしました');
    }
    
    // グローバル変数も更新
    if (window.autoplayMode !== undefined) {
        window.autoplayMode = false;
    }
    if (window.globalAutoplayState !== undefined) {
        window.globalAutoplayState = false;
    }
});
