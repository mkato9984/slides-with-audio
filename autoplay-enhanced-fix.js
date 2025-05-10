/**
 * 拡張自動再生リセットスクリプト
 * スライドプレゼンテーションでの自動再生問題を修正するスクリプト
 */

(function() {
    console.log('拡張自動再生リセット処理を実行します');
    
    // 即時実行セクション - スクリプト読み込み時に最優先で実行
    (function immediateReset() {
        // 既存ストレージをすべて消去して初期化
        try {
            const keys = ['sf01_autoplayState', 'sf01_autoplayEnabled', 'autoplayState', 'autoplayEnabled', 'autoplay'];
            keys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
            
            // 明示的に無効状態をセット（inactiveキーワードだとうまく動作しない可能性があるため）
            localStorage.setItem('sf01_autoplayState', 'false');
            localStorage.setItem('autoplayEnabled', 'false');
            localStorage.setItem('autoplayActive', 'false');
            
            console.log('自動再生状態の完全リセットが完了しました');
        } catch (e) {
            console.error('自動再生状態リセット中にエラー:', e);
        }
    })();
    
    // DOMの読み込み完了後に実行
    function initOnDOMReady() {
        console.log('DOM読み込み後の自動再生状態チェックを実行');
        
        // グローバル変数の強制リセット
        if (window.autoplayMode !== undefined) window.autoplayMode = false;
        if (window.SlideshowCore && window.SlideshowCore.state) {
            window.SlideshowCore.state.autoplayEnabled = false;
        }
        if (window.globalAutoplayState !== undefined) window.globalAutoplayState = false;
        
        // ボタンのUI状態を初期化
        const autoplayBtn = document.getElementById('autoplay-btn');
        if (autoplayBtn) {
            autoplayBtn.classList.remove('active');
            autoplayBtn.textContent = '自動再生';
            
            // イベントハンドラを強化
            enhanceAutoplayButton(autoplayBtn);
            console.log('自動再生ボタンのUI状態を初期化しました');
        }
    }
    
    // 自動再生ボタンのイベントハンドラを強化
    function enhanceAutoplayButton(button) {
        if (!button) return;
        
        // 元のイベントハンドラをバックアップ
        const originalClickHandler = button.onclick;
        
        // 新しいイベントハンドラ
        button.onclick = function(e) {
            try {
                console.log('自動再生ボタンがクリックされました');
                
                // ボタンの視覚的状態を切り替え
                const isActivating = !button.classList.contains('active');
                
                // この変更で自動再生をオン/オフにするかをログ
                console.log(`自動再生を${isActivating ? 'オン' : 'オフ'}にします`);
                
                // 元のハンドラがある場合は呼び出し
                if (typeof originalClickHandler === 'function') {
                    originalClickHandler.call(this, e);
                }
                
                // ボタンの視覚的な状態が変わったことを確認
                if (isActivating) {
                    if (!button.classList.contains('active')) {
                        button.classList.add('active');
                        button.textContent = '自動再生停止';
                        console.log('ボタンのUI状態を手動で「オン」に設定しました');
                    }
                } else {
                    if (button.classList.contains('active')) {
                        button.classList.remove('active');
                        button.textContent = '自動再生';
                        console.log('ボタンのUI状態を手動で「オフ」に設定しました');
                    }
                }
                
                // グローバル変数を確実に更新
                window.autoplayMode = isActivating;
                if (window.SlideshowCore && window.SlideshowCore.state) {
                    window.SlideshowCore.state.autoplayEnabled = isActivating;
                }
                if (window.globalAutoplayState !== undefined) {
                    window.globalAutoplayState = isActivating;
                }
                
                // 最後にStorage状態も更新
                localStorage.setItem('sf01_autoplayState', isActivating ? 'active' : 'inactive');
                localStorage.setItem('autoplayEnabled', isActivating ? 'true' : 'false');
            } catch (err) {
                console.error('自動再生ボタンハンドラでエラー:', err);
            }
        };
    }
    
    // ページ完全読み込み時にも実行
    function initOnLoad() {
        console.log('ページ完全読み込み後の自動再生状態チェックを実行');
        
        // 自動再生ボタンの状態を再確認
        const autoplayBtn = document.getElementById('autoplay-btn');
        if (autoplayBtn) {
            const isActive = autoplayBtn.classList.contains('active');
            console.log(`自動再生ボタン状態: ${isActive ? 'アクティブ' : '非アクティブ'}`);
            
            // UIと内部状態の不一致を修正
            const shouldBeActive = localStorage.getItem('sf01_autoplayState') === 'active' || 
                                   localStorage.getItem('autoplayEnabled') === 'true';
            
            if (isActive !== shouldBeActive) {
                console.warn('自動再生ボタン状態の不一致を検出。修正します。');
                if (shouldBeActive) {
                    autoplayBtn.classList.add('active');
                    autoplayBtn.textContent = '自動再生停止';
                } else {
                    autoplayBtn.classList.remove('active');
                    autoplayBtn.textContent = '自動再生';
                }
            }
        }
        
        // 内部状態の一貫性を確認
        if (window.autoplayMode !== (localStorage.getItem('sf01_autoplayState') === 'active')) {
            console.warn('内部自動再生状態の不一致を検出。修正します。');
            window.autoplayMode = localStorage.getItem('sf01_autoplayState') === 'active';
        }
        
        // 定期的なチェックを設定（2秒ごと）
        setInterval(() => {
            // 自動再生ボタンの状態を確認
            const btn = document.getElementById('autoplay-btn');
            if (btn) {
                const isActive = btn.classList.contains('active');
                const shouldBeActive = window.autoplayMode;
                
                // 不一致を修正
                if (isActive !== shouldBeActive) {
                    console.warn('自動再生ボタン状態の不一致を検出。修正します。');
                    if (shouldBeActive) {
                        btn.classList.add('active');
                        btn.textContent = '自動再生停止';
                    } else {
                        btn.classList.remove('active');
                        btn.textContent = '自動再生';
                    }
                }
            }
        }, 2000);
    }
    
    // DOM読み込み後に実行
    document.addEventListener('DOMContentLoaded', initOnDOMReady);
    
    // ページ完全読み込み後に実行
    window.addEventListener('load', initOnLoad);
      // 追加の安全策として、すぐに初期化も試行
    if (document.readyState !== 'loading') {
        initOnDOMReady();
    }
    
    // 統合マネージャーに登録
    if (window.slidesManager && typeof window.slidesManager.setFixLoaded === 'function') {
        window.slidesManager.setFixLoaded('enhancedAutoplay');
    }
})();
