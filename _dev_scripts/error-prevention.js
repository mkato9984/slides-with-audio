/**
 * Salesforceスライドプレゼンテーション用の修正スクリプト
 * HTML側で構文エラーが発生しないように修正済みの関数を提供します
 */

console.log('構文エラー修正用の初期化スクリプトが読み込まれました');

document.addEventListener('DOMContentLoaded', function() {
    console.log('構文エラー修正モジュールが初期化されました');
    
    // 読み込み状態の監視
    let checkLoadingInterval = setInterval(function() {
        const loadingElement = document.getElementById('loading-container');
        if (loadingElement) {
            if (loadingElement.style.display === 'none' || loadingElement.style.opacity === '0') {
                console.log('ローディングが完了しています。スライドショーの準備が整いました。');
                clearInterval(checkLoadingInterval);
            } else {
                console.log('ローディング中...');
            }
        } else {
            console.log('ローディング要素が見つかりません');
            clearInterval(checkLoadingInterval);
        }
    }, 1000);
    
    // 1秒後にローディング強制終了の確認
    setTimeout(function() {
        const loadingElement = document.getElementById('loading-container');
        if (loadingElement && (loadingElement.style.display !== 'none' && loadingElement.style.opacity !== '0')) {
            console.log('10秒でもロードが完了していないため、ローディング画面を強制的に閉じます');
            loadingElement.style.opacity = '0';
            
            setTimeout(function() {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }, 10000);
    
    // 自動再生状態の設定と確認
    window.checkAndRestoreAutoplay = function() {
        // ローカルストレージから自動再生状態を確認
        const storedAutoplayState = localStorage.getItem('sf01_autoplayState');
        console.log('保存されている自動再生状態:', storedAutoplayState);
        
        // 自動再生状態の整合性を確保
        if (storedAutoplayState === 'active') {
            // グローバル変数の状態を確実に設定
            if (typeof window.SlideshowCore !== 'undefined' && window.SlideshowCore.state) {
                window.SlideshowCore.setAutoplayState(true);
            }
            
            if (typeof window.globalAutoplayState !== 'undefined') {
                window.globalAutoplayState = true;
            }
            
            if (typeof autoplayMode !== 'undefined') {
                autoplayMode = true;
            }
            
            // UI更新が可能であれば実行
            if (typeof updateAutoplayUI === 'function') {
                updateAutoplayUI(true);
            }
        }
    };
    
    // 5秒後に自動再生状態を確認・修復
    setTimeout(function() {
        if (typeof window.checkAndRestoreAutoplay === 'function') {
            window.checkAndRestoreAutoplay();
        }
    }, 5000);
});
