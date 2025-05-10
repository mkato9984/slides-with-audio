/**
 * 自動再生の安定化と初期状態の設定を強化するスクリプト
 * スライドプレゼンテーションの自動再生機能を安定させ、初期状態を確実に設定します
 */

(function() {
    console.log('自動再生および初期状態修正スクリプトを初期化しています');
    
    // グローバル状態を追跡
    window.AUTOPLAY_FIX = {
        initialized: false,
        stateChecked: false,
        storageKey: 'sf01_autoplayState', // LocalStorageのキー
        slideKey: 'sf01_currentSlide'     // LocalStorageのキー
    };
    
    // 自動再生ボタンの参照
    let autoplayBtn;
    
    // 通知機能
    function showNotification(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // 初期状態を強制的に設定
    function resetInitialState() {
        console.log('スライドの初期状態をリセットしています');
        
        // LocalStorageから以前の状態をクリア
        localStorage.setItem(window.AUTOPLAY_FIX.slideKey, '1');
        localStorage.setItem(window.AUTOPLAY_FIX.storageKey, 'inactive');
        localStorage.removeItem('sf01_autoplayEnabled');
        
        // グローバル変数を更新
        window.currentSlide = 1;
        window.autoplayMode = false;
        
        if (window.globalAutoplayState !== undefined) {
            window.globalAutoplayState = false;
        }
        
        // UIの更新
        if (autoplayBtn) {
            autoplayBtn.classList.remove('active');
            autoplayBtn.textContent = '自動再生';
        }
        
        // スライドカウンターを更新
        const slideCounter = document.getElementById('slide-counter');
        if (slideCounter) {
            const totalSlides = window.totalSlides || 6;
            slideCounter.textContent = `1 / ${totalSlides}`;
        }
        
        console.log('スライドの初期状態のリセットが完了しました');
    }
    
    // 自動再生機能の安定化
    function enhanceAutoplay() {
        // 元の関数をバックアップ
        const originalToggleAutoplay = window.toggleAutoplay;
        
        if (typeof originalToggleAutoplay !== 'function') {
            console.warn('元の自動再生切り替え関数が見つかりません');
            return;
        }
        
        // 拡張された自動再生切り替え関数
        window.toggleAutoplay = function() {
            console.log('拡張された自動再生切り替え機能を呼び出し');
            
            // 元の関数を呼び出し
            try {
                originalToggleAutoplay();
            } catch (e) {
                console.error('元の自動再生関数でエラーが発生:', e);
                // エラーが発生した場合でも続行
            }
            
            // 現在の状態を取得
            const isAutoplayActive = window.autoplayMode;
            
            // LocalStorageに状態を保存（強化版）
            localStorage.setItem(window.AUTOPLAY_FIX.storageKey, isAutoplayActive ? 'active' : 'inactive');
            
            // UIの更新を保証
            if (autoplayBtn) {
                if (isAutoplayActive) {
                    autoplayBtn.classList.add('active');
                    autoplayBtn.textContent = '自動再生停止';
                } else {
                    autoplayBtn.classList.remove('active');
                    autoplayBtn.textContent = '自動再生';
                }
            }
            
            // 通知
            const message = isAutoplayActive ? '自動再生を開始しました' : '自動再生を停止しました';
            showNotification(message);
            
            // 状態をコンソールに出力
            console.log(`自動再生状態: ${isAutoplayActive ? 'ON' : 'OFF'}`);
        };
    }
    
    // 状態を確認して必要に応じて調整
    function checkState() {
        if (window.AUTOPLAY_FIX.stateChecked) return;
        
        console.log('プレゼンテーションの状態をチェックしています');
        
        // 自動再生の状態を取得
        const autoplayState = localStorage.getItem(window.AUTOPLAY_FIX.storageKey);
        const currentSlideStored = localStorage.getItem(window.AUTOPLAY_FIX.slideKey);
        
        // 自動再生状態とグローバル変数を同期
        if (autoplayState) {
            const shouldBeActive = (autoplayState === 'active');
            
            // グローバル変数とUIの状態が異なる場合は修正
            if (window.autoplayMode !== shouldBeActive) {
                console.log(`自動再生状態を修正: ${shouldBeActive ? 'ON' : 'OFF'}`);
                window.autoplayMode = shouldBeActive;
                
                // UIも更新
                if (autoplayBtn) {
                    if (shouldBeActive) {
                        autoplayBtn.classList.add('active');
                        autoplayBtn.textContent = '自動再生停止';
                    } else {
                        autoplayBtn.classList.remove('active');
                        autoplayBtn.textContent = '自動再生';
                    }
                }
            }
        } else {
            // 自動再生状態がない場合は初期状態に設定
            localStorage.setItem(window.AUTOPLAY_FIX.storageKey, 'inactive');
        }
        
        // スライド番号の確認
        if (currentSlideStored) {
            const slideNum = parseInt(currentSlideStored);
            if (!isNaN(slideNum) && slideNum >= 1) {
                if (window.currentSlide !== slideNum) {
                    console.log(`スライド番号を修正: ${slideNum}`);
                    // changeSlide関数が利用可能な場合は使用
                    if (typeof window.changeSlide === 'function' && !window.isTransitioning) {
                        window.changeSlide(slideNum);
                    } else {
                        // グローバル変数だけ更新
                        window.currentSlide = slideNum;
                    }
                }
            }
        } else {
            // スライド番号がない場合は初期値に設定
            localStorage.setItem(window.AUTOPLAY_FIX.slideKey, '1');
        }
        
        window.AUTOPLAY_FIX.stateChecked = true;
        console.log('状態チェックが完了しました');
    }
    
    // スライド変更機能の強化
    function enhanceSlideChange() {
        if (typeof window.changeSlide !== 'function') {
            console.warn('スライド変更関数が見つかりません');
            return;
        }
        
        const originalChangeSlide = window.changeSlide;
        
        window.changeSlide = function(newSlide, ...args) {
            console.log(`スライド変更（拡張）: ${newSlide}`);
            
            // 元の関数を呼び出し
            const result = originalChangeSlide.apply(this, [newSlide, ...args]);
            
            // LocalStorageを確実に更新
            localStorage.setItem(window.AUTOPLAY_FIX.slideKey, String(newSlide));
            
            return result;
        };
    }
    
    // 起動処理
    function init() {
        if (window.AUTOPLAY_FIX.initialized) return;
        
        console.log('自動再生修正モジュールを初期化しています');
        
        // UIの参照を取得
        autoplayBtn = document.getElementById('autoplay-btn');
        
        // 自動再生機能を強化
        enhanceAutoplay();
        
        // スライド変更機能を強化
        enhanceSlideChange();
        
        // 初期化フラグを設定
        window.AUTOPLAY_FIX.initialized = true;
        
        // 起動時に一度だけ初期状態をリセット
        resetInitialState();
        
        console.log('自動再生修正モジュールの初期化が完了しました');
        
        // 状態チェックを少し遅延して実行（DOM構築後）
        setTimeout(checkState, 500);
    }
    
    // DOMの読み込み状態に基づいて初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMがすでに読み込まれている場合は即時実行
        init();
    }
    
    // すべてのリソースが読み込まれた後に再度チェック
    window.addEventListener('load', function() {
        if (!window.AUTOPLAY_FIX.initialized) {
            init();
        }
        checkState();
    });
    
    // 公開API
    window.autoplayFix = {
        reset: resetInitialState,
        checkState: checkState,
        reinitialize: init
    };
})();
