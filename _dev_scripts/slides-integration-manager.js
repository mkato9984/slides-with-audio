/**
 * 全体的なプレゼンテーション状態を統合管理するスクリプト
 * Salesforceスライド修正の統合マネージャー
 */

(function() {
    console.log('Salesforceスライド統合マネージャーを初期化しています');
      // グローバル状態
    window.SLIDES_MANAGER = {
        initialized: false,
        slideCount: 11, // スライド数（デフォルト値）
        startingSlide: 1,
        audioEnabled: false,
        autoplayEnabled: false,
        presenterMode: false,
        fixScriptsLoaded: {
            resetState: false,
            presenterSlides: false,
            presenterStyles: false,
            audioSync: false,
            autoplayState: false,
            enhancedAutoplay: false,
            presenterButtons: false,
            enhancedSync: false
        }
    };
    
    // 実行環境を検出
    function detectEnvironment() {
        // プレゼンターモードかどうかを判断
        const isPresenter = window.location.href.indexOf('presenter') !== -1;
        window.SLIDES_MANAGER.presenterMode = isPresenter;
        
        console.log(`実行環境: ${isPresenter ? 'プレゼンター画面' : 'メイン画面'}`);
        
        // スライド数を検出
        const detectSlideCount = () => {
            if (window.totalSlides) {
                window.SLIDES_MANAGER.slideCount = window.totalSlides;
            }
            return window.SLIDES_MANAGER.slideCount;
        };
        
        return {
            isPresenter,
            slideCount: detectSlideCount()
        };
    }
    
    // 修正スクリプトの読み込み状況を確認
    function checkFixScriptsStatus() {
        const status = window.SLIDES_MANAGER.fixScriptsLoaded;
        const incomplete = Object.keys(status).filter(key => !status[key]);
        
        if (incomplete.length > 0) {
            console.warn(`未ロードの修正スクリプト: ${incomplete.join(', ')}`);
        } else {
            console.log('すべての修正スクリプトが正常に読み込まれました');
        }
        
        return incomplete.length === 0; // すべて読み込まれたかどうか
    }
    
    // エラーハンドリングを強化
    function enhanceErrorHandling() {
        // エラーイベントをグローバルにキャプチャ
        window.addEventListener('error', function(e) {
            console.error('グローバルエラー:', e.message, 'at', e.filename, ':', e.lineno);
            
            // エラーを通知（通知機能が利用可能な場合）
            if (typeof showNotification === 'function') {
                showNotification('エラーが発生しました。コンソールを確認してください。');
            }
            
            // エラー修復処理（可能な場合）
            if (e.message.includes('audio') || e.message.includes('Audio')) {
                console.log('音声関連のエラーを検出。音声機能を再初期化します。');
                if (window.audioSyncFix && typeof window.audioSyncFix.reinitialize === 'function') {
                    window.audioSyncFix.reinitialize();
                }
            }
            
            if (e.message.includes('slide') || e.message.includes('Slide')) {
                console.log('スライド関連のエラーを検出。スライド表示を修復します。');
                if (window.fixPresenterSlides && typeof window.fixPresenterSlides.fix === 'function') {
                    window.fixPresenterSlides.fix();
                }
            }
        });
    }
    
    // 初期化処理
    function init() {
        if (window.SLIDES_MANAGER.initialized) return;
        
        console.log('統合マネージャーの初期化を開始します');
        
        // 環境を検出
        const env = detectEnvironment();
        
        // エラーハンドリングを強化
        enhanceErrorHandling();
        
        // 修正スクリプトのステータスを定期的にチェック
        const intervalId = setInterval(() => {
            if (checkFixScriptsStatus()) {
                clearInterval(intervalId);
                console.log('すべての修正が適用されました。統合マネージャーの監視を終了します。');
            }
        }, 2000); // 2秒ごとにチェック
        
        window.SLIDES_MANAGER.initialized = true;
        
        // 初期化完了の通知
        if (typeof showNotification === 'function') {
            showNotification('プレゼンテーション修正が完了しました');
        }
    }
    
    // DOMの読み込み状態に基づいて初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 安全のため、load イベントでも再初期化
    window.addEventListener('load', init);
    
    // 公開API
    window.slidesManager = {
        reinitialize: init,
        checkStatus: checkFixScriptsStatus,
        setFixLoaded: function(fixName) {
            if (window.SLIDES_MANAGER.fixScriptsLoaded.hasOwnProperty(fixName)) {
                window.SLIDES_MANAGER.fixScriptsLoaded[fixName] = true;
                console.log(`修正スクリプト ${fixName} の読み込みが完了しました`);
            }
        }
    };
})();
