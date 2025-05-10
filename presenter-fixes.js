/**
 * プレゼンター画面用の修正スクリプト
 * メイン画面とプレゼンター画面の自動再生状態を同期するための修正を行います
 */

(function() {
    // スライドコアモジュールが存在しない場合は作成
    if (!window.SlideshowCore) {
        console.log('SlideshowCoreモジュールを初期化します');
        
        // スライド共通コアモジュール - プレゼンテーション状態管理
        window.SlideshowCore = {
            // 状態管理
            state: {
                totalSlides: 11,
                currentSlide: 1,
                autoplayEnabled: false,
                audioPlaying: false,
                isTransitioning: false,
                isPresentationMode: true  // プレゼンターモード
            },
            
            // タイマー管理
            timers: {
                autoplayTimeout: null,
                transitionTimeout: null
            },
            
            // 現在の音声要素
            audio: {
                current: null,
                preloaded: []
            },
            
            // 状態変更関数
            setAutoplayState: function(enabled) {
                this.state.autoplayEnabled = enabled;
                window.globalAutoplayState = enabled;
                localStorage.setItem('sf01_autoplayState', enabled ? 'active' : 'inactive');
                console.log(`SlideshowCore: 自動再生状態を ${enabled ? '有効' : '無効'} に設定しました`);
                return enabled;
            },
            
            setSlide: function(slideNumber) {
                if (slideNumber >= 1 && slideNumber <= this.state.totalSlides) {
                    this.state.currentSlide = slideNumber;
                    localStorage.setItem('sf01_currentSlide', slideNumber.toString());
                    console.log(`SlideshowCore: スライドを ${slideNumber} に設定しました`);
                    return true;
                }
                return false;
            },
            
            setAudioPlaying: function(isPlaying) {
                this.state.audioPlaying = isPlaying;
                return isPlaying;
            },
            
            stopAllTimers: function() {
                if (this.timers.autoplayTimeout) {
                    clearTimeout(this.timers.autoplayTimeout);
                    this.timers.autoplayTimeout = null;
                }
                return true;
            },
            
            // 初期化
            initialize: function(isPresentationMode) {
                this.state.isPresentationMode = isPresentationMode;
                
                // ローカルストレージから状態を復元
                const storedAutoplayState = localStorage.getItem('sf01_autoplayState');
                if (storedAutoplayState === 'active') {
                    this.setAutoplayState(true);
                }
                
                const storedSlide = localStorage.getItem('sf01_currentSlide');
                if (storedSlide) {
                    const slideNum = parseInt(storedSlide);
                    if (!isNaN(slideNum) && slideNum >= 1 && slideNum <= this.state.totalSlides) {
                        this.setSlide(slideNum);
                    }
                }
                
                console.log('SlideshowCore: 初期化完了, プレゼンテーションモード:', isPresentationMode);
                return true;
            }
        };
        
        // グローバル変数を初期化
        window.globalAutoplayState = false;
        
        // DOMContentLoadedイベントが既に発火している場合に備えて
        // メインスクリプト内の初期化処理が実行されるようにする
        document.addEventListener('slideshowCoreReady', function() {
            console.log('SlideshowCoreモジュールの準備完了イベントを発行');
        });
        
        // カスタムイベントを発火させて準備完了を通知
        document.dispatchEvent(new CustomEvent('slideshowCoreReady'));
    }

    // UI更新用のヘルパー関数（メイン画面と共通）
    if (!window.updateAutoplayUI) {
        window.updateAutoplayUI = function(isEnabled) {
            // パラメータをブール値として扱う
            const shouldBeEnabled = Boolean(isEnabled);
            
            // コア状態との一貫性を確保
            if (window.SlideshowCore && window.SlideshowCore.state.autoplayEnabled !== shouldBeEnabled) {
                window.SlideshowCore.setAutoplayState(shouldBeEnabled);
            }
            
            // グローバル状態の一貫性を確保
            if (window.globalAutoplayState !== shouldBeEnabled) {
                window.globalAutoplayState = shouldBeEnabled;
            }
            
            // ローカルストレージの一貫性を確保
            const storageState = localStorage.getItem('sf01_autoplayState') === 'active';
            if (storageState !== shouldBeEnabled) {
                localStorage.setItem('sf01_autoplayState', shouldBeEnabled ? 'active' : 'inactive');
            }
            
            // autoplayMode変数の一貫性を確保
            if (window.autoplayMode !== shouldBeEnabled) {
                window.autoplayMode = shouldBeEnabled;
            }
            
            // UI要素の更新
            const autoplayBtn = document.getElementById('autoplay-btn');
            if (autoplayBtn) {
                if (shouldBeEnabled) {
                    autoplayBtn.classList.add('active');
                    autoplayBtn.textContent = '自動停止';
                } else {
                    autoplayBtn.classList.remove('active');
                    autoplayBtn.textContent = '自動再生';
                }
            }
            
            return shouldBeEnabled;
        };
    }

    // toggleAutoplay関数を上書き（メイン画面と共通の実装）
    window.toggleAutoplay = function(isFromSync = false) {
        // 連続クリック時に処理が重複しないようロック
        if (window.isTogglingAutoplay) {
            console.log('自動再生の切り替え処理が進行中です...');
            return;
        }
        
        window.isTogglingAutoplay = true;
        
        // 現在の状態を保存（デバッグ用）
        const previousState = {
            core: window.SlideshowCore ? window.SlideshowCore.state.autoplayEnabled : null,
            global: window.globalAutoplayState,
            local: localStorage.getItem('sf01_autoplayState'),
            autoplayMode: window.autoplayMode
        };
        
        // コアモジュールで状態を切り替え
        window.autoplayMode = !window.autoplayMode;
        if (window.SlideshowCore) {
            window.SlideshowCore.setAutoplayState(window.autoplayMode);
        }
        window.globalAutoplayState = window.autoplayMode;
        
        // localStorage状態も確実に更新
        localStorage.setItem('sf01_autoplayState', window.autoplayMode ? 'active' : 'inactive');
        
        console.log(`自動再生モードを ${window.autoplayMode ? '開始' : '停止'} します ${isFromSync ? '(同期による変更)' : ''}`);
        console.log('状態変更前:', previousState);
        console.log('状態変更後:', {
            core: window.SlideshowCore ? window.SlideshowCore.state.autoplayEnabled : null,
            global: window.globalAutoplayState,
            local: localStorage.getItem('sf01_autoplayState'),
            autoplayMode: window.autoplayMode
        });
        
        // UI更新処理 - ボタン状態を反映
        if (window.updateAutoplayUI) {
            window.updateAutoplayUI(window.autoplayMode);
        }
        
        // 自動再生開始/停止時の処理
        if (window.autoplayMode) {
            // このウィンドウが音声/自動再生ソースであることをマーク
            if (!isFromSync) {
                localStorage.setItem('sf01_audioSource', 'presenter');
            }
            
            showNotification('自動再生モードを開始しました');
            
            // 既に音声が再生中でなければ再生開始
            if (!window.audioPlaying && 
                (!isFromSync || localStorage.getItem('sf01_audioSource') === 'presenter')) {
                setTimeout(() => {
                    try {
                        // 音声を再生 (playAudioが存在する場合)
                        if (typeof playAudio === 'function') {
                            playAudio(window.currentSlide);
                        }
                    } catch (error) {
                        console.error('自動再生モード開始時の音声再生エラー:', error);
                    }
                }, 100);
            }
        } else {
            showNotification('自動再生モードを停止しました');
            
            // タイマーをクリア
            if (window.SlideshowCore) {
                window.SlideshowCore.stopAllTimers();
            }
            if (window.autoplayTimeout) {
                clearTimeout(window.autoplayTimeout);
                window.autoplayTimeout = null;
            }
        }
        
        // 同期処理 (sendSyncCommandが存在する場合)
        if (!isFromSync && typeof sendSyncCommand === 'function') {
            sendSyncCommand(window.autoplayMode ? 'autoplayStart' : 'autoplayStop', {});
        }            // 状態変更のタイムスタンプを記録（同期中の優先度判定に使用）
            localStorage.setItem('sf01_lastStateChangeTime', Date.now().toString());
            
            // カスタムイベントを発火させて自動再生モニターに通知
            document.dispatchEvent(new CustomEvent('autoplayStateChanged', { 
                detail: { 
                    newState: window.autoplayMode,
                    source: isFromSync ? 'sync' : 'presenter',
                    timestamp: new Date().toISOString()
                }
            }));
        
        // ロック解除（少し遅延させて連続実行を防止）
        setTimeout(() => {
            window.isTogglingAutoplay = false;
        }, 300);
    };

    // autoplayStateからautoplayUIへの更新関数をリダイレクト
    if (window.updateAutoplayState && !window.updateAutoplayStateOriginal) {
        window.updateAutoplayStateOriginal = window.updateAutoplayState;
        window.updateAutoplayState = function(state) {
            const newState = state === 'active';
            if (window.updateAutoplayUI) {
                window.updateAutoplayUI(newState);
            } else {
                window.updateAutoplayStateOriginal(state);
            }
        };
    }
    
    // 初期化時にSlideshowCoreも初期化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('プレゼンター画面用コアモジュール修正を適用');
        
        // 初期化されていない場合は初期化
        if (window.SlideshowCore && !window.SlideshowCore.initialized) {
            window.SlideshowCore.initialize(true); // プレゼンターモードとして初期化
            window.SlideshowCore.initialized = true;
            
            // ローカルストレージから状態を復元
            const storedAutoplayState = localStorage.getItem('sf01_autoplayState');
            window.globalAutoplayState = storedAutoplayState === 'active';
            window.autoplayMode = storedAutoplayState === 'active';
            
            if (window.updateAutoplayUI) {
                window.updateAutoplayUI(window.autoplayMode);
            }
        }
    });

    // 同期状態のテスト機能
    window.testSynchronization = function() {
        const results = {
            mainView: {},
            presenterView: {},
            localStorageState: {},
            syncStatus: 'unknown'
        };
        
        try {
            // 現在のスライドと自動再生状態を取得
            results.mainView = {
                autoplayEnabled: window.SlideshowCore ? window.SlideshowCore.state.autoplayEnabled : null,
                currentSlide: window.SlideshowCore ? window.SlideshowCore.state.currentSlide : null,
                uiState: document.getElementById('autoplay-btn')?.classList.contains('active') || false
            };
            
            results.presenterView = {
                autoplayEnabled: window.autoplayMode, 
                currentSlide: window.currentSlide,
                uiState: document.getElementById('autoplay-btn')?.classList.contains('active') || false
            };
            
            results.localStorageState = {
                autoplayState: localStorage.getItem('sf01_autoplayState'),
                currentSlide: localStorage.getItem('sf01_currentSlide'),
                audioSource: localStorage.getItem('sf01_audioSource')
            };
            
            // 状態が一致しているか確認
            const stateConsistent = 
                results.mainView.autoplayEnabled === (results.localStorageState.autoplayState === 'active') &&
                results.mainView.autoplayEnabled === results.presenterView.autoplayEnabled &&
                results.mainView.uiState === results.presenterView.uiState;
            
            results.syncStatus = stateConsistent ? 'synced' : 'inconsistent';
            
            if (!stateConsistent) {
                console.warn('自動再生状態の同期状態に不一致が検出されました', results);
            }
        } catch (error) {
            results.error = error.message;
            results.syncStatus = 'error';
            console.error('同期状態テスト実行中にエラーが発生しました:', error);
        }
        
        return results;
    };
    
    // 定期的な同期状態チェック
    const syncStateInterval = setInterval(() => {
        try {
            const syncState = window.testSynchronization();
            if (syncState.syncStatus === 'inconsistent') {
                console.warn('自動再生状態の不一致が検出されました。自動修正を試みます。');
                if (window.forceAutoplayStateCorrection) {
                    // コアの状態を信頼して修正
                    const coreState = window.SlideshowCore?.state?.autoplayEnabled || false;
                    window.forceAutoplayStateCorrection(coreState);
                }
            }
        } catch (error) {
            console.error('同期状態チェック中にエラーが発生しました:', error);
        }
    }, 5000); // 5秒ごとにチェック

    console.log('プレゼンター画面用の修正スクリプトを読み込みました（テスト監視機能付き）');
})();
