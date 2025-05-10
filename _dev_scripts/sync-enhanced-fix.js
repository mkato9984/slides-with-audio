/**
 * 同期機能修復スクリプト
 * メイン画面とプレゼンター画面の同期問題を解決します
 */

(function() {
    console.log('同期機能修復スクリプトを初期化');
    
    // グローバル状態
    const STATE = {
        initialized: false,
        isSyncInProgress: false,
        lastSyncTime: 0,
        syncDebounceTime: 200, // ms
        syncCount: 0
    };
    
    // 通知機能
    function showSyncNotification(message) {
        try {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.textContent = message;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            } else {
                console.log('同期通知:', message);
            }
        } catch (e) {
            console.log('通知表示中にエラー:', e);
        }
    }
    
    // 環境検出
    function detectEnvironment() {
        const isPresenter = window.location.href.indexOf('presenter') !== -1;
        const hasPresenterElements = !!document.querySelector('.presenter-view, .current-slide-preview');
        
        return {
            isPresenter: isPresenter || hasPresenterElements,
            source: isPresenter || hasPresenterElements ? 'presenter' : 'main'
        };
    }
    
    // 拡張された同期コマンド送信
    function sendSyncCommand(action, data = {}) {
        // 重複防止のため、短時間に複数回の同期を防ぐ
        const now = Date.now();
        if (STATE.isSyncInProgress || (now - STATE.lastSyncTime < STATE.syncDebounceTime)) {
            console.log('同期コマンドをスキップ: 重複防止');
            return false;
        }
        
        try {
            STATE.isSyncInProgress = true;
            STATE.lastSyncTime = now;
            
            // 環境情報を取得
            const env = detectEnvironment();
            
            // 基本的な同期コマンドを作成
            const syncData = {
                action: action,
                timestamp: now,
                source: env.source,
                syncId: `sync_${now}_${Math.random().toString(36).substr(2, 5)}`,
                ...data
            };
            
            // 現在のスライド番号を追加
            if (!syncData.slide && window.currentSlide) {
                syncData.slide = window.currentSlide;
            }
            
            // 自動再生状態を追加
            const isAutoplayActive = window.autoplayMode || 
                                    (window.SlideshowCore && window.SlideshowCore.state && 
                                     window.SlideshowCore.state.autoplayEnabled);
            
            syncData.autoplayState = isAutoplayActive;
            
            // 音声状態を追加
            const isAudioPlaying = window.audioPlaying || 
                                  (document.querySelector('#audio-btn.active') !== null);
            
            if (isAudioPlaying) {
                syncData.audioAction = 'play';
            }
            
            // コンソールに詳細をログ
            console.log('同期コマンドを送信:', syncData);
            
            // LocalStorageを使って同期
            localStorage.setItem('syncCommand', JSON.stringify(syncData));
            
            // カウントを増加
            STATE.syncCount++;
            
            // 少し遅延してロックを解除
            setTimeout(() => {
                STATE.isSyncInProgress = false;
            }, STATE.syncDebounceTime);
            
            return true;
        } catch (e) {
            console.error('同期コマンド送信中にエラー:', e);
            STATE.isSyncInProgress = false;
            return false;
        }
    }
    
    // 同期コマンドの処理を拡張
    function enhanceSyncCommandHandling() {
        // すでにstorageイベントハンドラがある場合は、それを増強する
        const originalHandler = window.onstorage;
        
        window.onstorage = function(e) {
            // 同期コマンドを処理
            if (e.key === 'syncCommand') {
                try {
                    const syncData = JSON.parse(e.newValue);
                    
                    // 2秒以上前のコマンドは無視
                    if (syncData.timestamp && (Date.now() - syncData.timestamp > 2000)) {
                        console.log('古い同期コマンドをスキップ');
                        return;
                    }
                    
                    // 自分自身からの同期コマンドは処理しない（不要なループを防ぐ）
                    const env = detectEnvironment();
                    if (syncData.source === env.source) {
                        console.log('自分自身からの同期コマンドをスキップ');
                        return;
                    }
                    
                    console.log('同期コマンドを受信:', syncData);
                    
                    // 同期の種類に応じて処理
                    switch (syncData.action) {
                        case 'slideChange':
                            handleSlideChangeSync(syncData);
                            break;
                        case 'autoplay':
                            handleAutoplaySync(syncData);
                            break;
                        case 'fullSync':
                            handleFullSync(syncData);
                            break;
                        default:
                            // 未知の同期コマンドは元のハンドラに渡す
                            if (typeof originalHandler === 'function') {
                                originalHandler.call(window, e);
                            }
                    }
                } catch (e) {
                    console.error('同期コマンド処理中にエラー:', e);
                }
                
                return;
            }
            
            // すべてのLocalStorage変更について元のハンドラを呼び出す
            if (typeof originalHandler === 'function') {
                originalHandler.call(window, e);
            }
        };
    }
    
    // スライド変更の同期処理
    function handleSlideChangeSync(syncData) {
        if (!syncData.slide) return;
        
        const slideNum = parseInt(syncData.slide);
        if (isNaN(slideNum) || slideNum < 1) return;
        
        // 現在のスライドと異なる場合のみ変更
        if (window.currentSlide !== slideNum) {
            console.log(`スライドを同期: ${slideNum}`);
            
            // プレゼンター画面の場合
            const env = detectEnvironment();
            if (env.isPresenter) {
                // プレゼンターのスライド変更
                if (typeof window.changeSlide === 'function') {
                    window.changeSlide(slideNum);
                } else {
                    // 強制的にスライドを変更
                    window.currentSlide = slideNum;
                    if (typeof window.updatePresenterView === 'function') {
                        window.updatePresenterView();
                    }
                }
            } else {
                // メイン画面のスライド変更
                if (typeof window.changeSlide === 'function') {
                    // fromSyncパラメータがある場合は付与
                    if (typeof window.changeSlide === 'function' && 
                        window.changeSlide.toString().indexOf('fromSync') !== -1) {
                        window.changeSlide(slideNum, true);
                    } else {
                        window.changeSlide(slideNum);
                    }
                }
            }
            
            // 通知
            showSyncNotification(`スライド ${slideNum} に同期しました`);
        }
        
        // 自動再生状態の同期
        if (syncData.autoplayState !== undefined) {
            handleAutoplaySync({
                action: 'autoplay',
                state: syncData.autoplayState ? 'active' : 'inactive'
            });
        }
        
        // 音声状態の同期
        if (syncData.audioAction) {
            handleAudioSync({
                action: syncData.audioAction,
                slide: slideNum
            });
        }
    }
    
    // 自動再生状態の同期処理
    function handleAutoplaySync(syncData) {
        if (!syncData.state) return;
        
        const shouldBeActive = syncData.state === 'active';
        const isCurrentlyActive = window.autoplayMode || 
                                 (window.SlideshowCore && window.SlideshowCore.state && 
                                  window.SlideshowCore.state.autoplayEnabled);
        
        if (shouldBeActive !== isCurrentlyActive) {
            console.log(`自動再生状態を同期: ${shouldBeActive ? 'オン' : 'オフ'}`);
            
            // グローバル変数の更新
            window.autoplayMode = shouldBeActive;
            if (window.SlideshowCore && window.SlideshowCore.state) {
                window.SlideshowCore.state.autoplayEnabled = shouldBeActive;
            }
            
            // 自動再生ボタンのUI更新
            const autoplayBtn = document.getElementById('autoplay-btn');
            if (autoplayBtn) {
                if (shouldBeActive) {
                    autoplayBtn.classList.add('active');
                    autoplayBtn.textContent = '自動再生停止';
                } else {
                    autoplayBtn.classList.remove('active');
                    autoplayBtn.textContent = '自動再生';
                }
            }
            
            // LocalStorageの更新
            localStorage.setItem('sf01_autoplayState', shouldBeActive ? 'active' : 'inactive');
            
            // 通知
            showSyncNotification(`自動再生: ${shouldBeActive ? 'オン' : 'オフ'} に同期しました`);
        }
    }
    
    // 音声状態の同期処理
    function handleAudioSync(syncData) {
        if (!syncData.action) return;
        
        const shouldPlay = syncData.action === 'play';
        const isCurrentlyPlaying = window.audioPlaying || 
                                  (document.querySelector('#audio-btn.active') !== null);
        
        if (shouldPlay !== isCurrentlyPlaying) {
            console.log(`音声状態を同期: ${shouldPlay ? '再生' : '停止'}`);
            
            // 音声ボタンのUI更新
            const audioBtn = document.getElementById('audio-btn');
            if (audioBtn) {
                if (shouldPlay) {
                    audioBtn.classList.add('active');
                    audioBtn.textContent = '音声停止';
                    
                    // 音声再生処理
                    if (typeof window.playAudio === 'function') {
                        window.playAudio(syncData.slide || window.currentSlide);
                    } else if (typeof window.playCurrentAudio === 'function') {
                        window.playCurrentAudio();
                    }
                } else {
                    audioBtn.classList.remove('active');
                    audioBtn.textContent = '音声再生';
                    
                    // 音声停止処理
                    if (typeof window.stopAudio === 'function') {
                        window.stopAudio();
                    } else if (window.currentAudio) {
                        window.currentAudio.pause();
                        window.currentAudio.currentTime = 0;
                    }
                }
            }
            
            // グローバル変数の更新
            window.audioPlaying = shouldPlay;
        }
    }
    
    // 完全同期処理
    function handleFullSync(syncData) {
        console.log('完全同期を開始します');
        
        // スライド、自動再生、音声をすべて同期
        handleSlideChangeSync(syncData);
        
        // 通知
        showSyncNotification('すべての設定を同期しました');
    }
    
    // フルリフレッシュ同期を実行
    function performFullRefreshSync() {
        // 環境情報を取得
        const env = detectEnvironment();
        
        // フル同期コマンドを送信
        sendSyncCommand('fullSync', {
            slide: window.currentSlide,
            autoplayState: window.autoplayMode,
            audioAction: window.audioPlaying ? 'play' : 'stop'
        });
        
        console.log('フルリフレッシュ同期を実行しました');
        showSyncNotification('完全同期を実行しました');
    }
    
    // 拡張関数を公開
    function exposeEnhancedFunctions() {
        // requestFullSyncの拡張
        const originalRequestFullSync = window.requestFullSync;
        
        window.requestFullSync = function() {
            console.log('拡張された完全同期を実行');
            
            if (typeof originalRequestFullSync === 'function') {
                originalRequestFullSync();
            }
            
            performFullRefreshSync();
        };
        
        // syncWithMainWindowの拡張（プレゼンター画面用）
        if (detectEnvironment().isPresenter) {
            const originalSyncWithMain = window.syncWithMainWindow;
            
            window.syncWithMainWindow = function() {
                console.log('拡張されたメイン画面との同期を実行');
                
                if (typeof originalSyncWithMain === 'function') {
                    originalSyncWithMain();
                }
                
                sendSyncCommand('slideChange');
            };
        }
        
        // syncWithPresenterの拡張（メイン画面用）
        if (!detectEnvironment().isPresenter) {
            const originalSyncWithPresenter = window.syncWithPresenter;
            
            window.syncWithPresenter = function() {
                console.log('拡張されたプレゼンター画面との同期を実行');
                
                if (typeof originalSyncWithPresenter === 'function') {
                    originalSyncWithPresenter();
                }
                
                sendSyncCommand('slideChange');
            };
        }
    }
    
    // 初期化処理
    function init() {
        if (STATE.initialized) return;
        
        console.log('同期機能修復を実行します');
        
        // 同期コマンド処理を拡張
        enhanceSyncCommandHandling();
        
        // 拡張関数を公開
        exposeEnhancedFunctions();
        
        // 初期化完了
        STATE.initialized = true;
        
        // 起動時に一度同期実行
        setTimeout(performFullRefreshSync, 1500);
    }
    
    // DOM読み込み後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ページ完全読み込み後にも確認
    window.addEventListener('load', function() {
        if (!STATE.initialized) init();
        
        // 一定間隔で同期状態をリフレッシュ
        setInterval(performFullRefreshSync, 30000); // 30秒ごと
    });
      // 公開API
    window.syncFix = {
        performSync: performFullRefreshSync,
        sendSyncCommand: sendSyncCommand,
        reInitialize: init
    };
    
    // 統合マネージャーに登録
    if (window.slidesManager && typeof window.slidesManager.setFixLoaded === 'function') {
        window.slidesManager.setFixLoaded('enhancedSync');
    }
})();
