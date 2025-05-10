/**
 * Salesforce Slides プレゼンテーション - 自動再生モニタースクリプト
 * このスクリプトは、自動再生状態の一貫性を監視し、維持するためのものです。
 */

(function() {
    // モニターの状態
    const monitor = {
        totalChecks: 0,
        totalCorrections: 0,
        lastCheckTime: null,
        isProcessingCheck: false,
        consecutiveCorrections: 0,
        history: []
    };
    
    /**
     * 自動再生状態の整合性チェック - 定期的に実行
     * @param {Object} options - チェックオプション
     * @param {boolean} options.isFromEvent - イベントからの呼び出しかどうか
     * @param {boolean} options.forceCheck - 強制的にチェックを実行するかどうか
     */
    function checkAutoplayConsistency(options = {}) {
        const { isFromEvent = false, forceCheck = false } = options;
        
        // 重複チェック防止（1回のチェックが完了するまで新しいチェックを開始しない）
        if (monitor.isProcessingCheck && !forceCheck) {
            console.log('自動再生状態チェックが進行中です。スキップします。');
            return;
        }
        
        monitor.isProcessingCheck = true;
        monitor.totalChecks++;
        monitor.lastCheckTime = new Date();
        
        // SlideshowCoreが初期化されている場合のみ実行
        if (window.SlideshowCore && window.SlideshowCore.state) {
            // 各ソースからの状態を取得
            const coreState = window.SlideshowCore.state.autoplayEnabled;
            const globalState = window.globalAutoplayState === true;
            const uiState = document.getElementById('autoplay-btn')?.classList.contains('active') || false;
            const localStorageState = localStorage.getItem('sf01_autoplayState') === 'active';
            
            // 変数の状態
            let autoplayMode = false;
            try {
                // グローバルスコープから取得を試みる
                autoplayMode = window.autoplayMode === true;
            } catch(e) {
                console.log('autoplayMode変数は直接アクセスできません');
            }
            
            const states = { coreState, globalState, uiState, localStorageState, autoplayMode };
            monitor.history.push(states);
            
            // 履歴が長すぎる場合は古いものを削除
            if (monitor.history.length > 10) {
                monitor.history.shift();
            }
              // 状態の不一致を検出
            if (coreState !== globalState || coreState !== uiState || coreState !== localStorageState || coreState !== autoplayMode) {
                monitor.totalCorrections++;
                monitor.consecutiveCorrections++;
                
                console.warn(`自動再生状態の不一致を検出 [${monitor.consecutiveCorrections}回目]: 修正します`, states);
                
                // 優先順位判定を強化: 最も信頼できる状態を選択
                // 1. 変更が最近行われた場合はLocalStorageの状態を優先（他のビューからの同期）
                // 2. その他の場合はコア状態を優先
                const lastStateChangeTime = parseInt(localStorage.getItem('sf01_lastStateChangeTime') || '0');
                const timeNow = Date.now();
                const recentChange = (timeNow - lastStateChangeTime) < 2000; // 2秒以内の変更は「最近」とみなす
                
                let correctState;
                if (recentChange) {
                    correctState = localStorageState;
                    console.log('LocalStorage状態を優先します（最近の変更）');
                } else {
                    correctState = coreState || globalState || localStorageState || uiState;
                    console.log('コア状態または最も妥当な状態を優先します');
                }
                  // すべての状態を同期
                try {
                    // コア状態の更新
                    window.SlideshowCore.setAutoplayState(correctState);
                    
                    // グローバル状態の更新
                    window.globalAutoplayState = correctState;
                    
                    // autoplayMode変数の更新も試みる
                    try {
                        window.autoplayMode = correctState;
                    } catch(e) {
                        console.log('autoplayMode変数は直接更新できません');
                    }
                    
                    // ローカルストレージの更新
                    localStorage.setItem('sf01_autoplayState', correctState ? 'active' : 'inactive');
                    
                    // UI状態の更新
                    const autoplayBtn = document.getElementById('autoplay-btn');
                    if (autoplayBtn) {
                        if (correctState) {
                            autoplayBtn.classList.add('active');
                            autoplayBtn.textContent = '自動停止';
                        } else {
                            autoplayBtn.classList.remove('active');
                            autoplayBtn.textContent = '自動再生';
                        }
                    }
                    
                    // autoplayMode変数の更新を試みる
                    try {
                        window.autoplayMode = correctState;
                    } catch(e) {
                        // 何もしない
                    }
                    
                    console.log(`自動再生状態を ${correctState ? '有効' : '無効'} に統一しました`);
                    
                    // 連続修正回数が多い場合は警告
                    if (monitor.consecutiveCorrections > 3) {
                        console.warn(`自動再生状態の連続${monitor.consecutiveCorrections}回修正が必要でした。コード内に根本的な問題がある可能性があります。`);
                    }
                } catch(error) {
                    console.error('自動再生状態の修正中にエラーが発生しました:', error);
                }
            } else {
                // 状態が一致している場合、連続修正カウンタをリセット
                monitor.consecutiveCorrections = 0;
                
                // イベントからの呼び出しの場合のみログ出力
                if (isFromEvent) {
                    console.log('自動再生状態チェック: 状態は一致しています', states);
                }
            }
        }
        
        // チェック処理の完了
        setTimeout(() => {
            monitor.isProcessingCheck = false;
        }, 50);
    }
    
    // 定期的なチェックを設定（短く頻繁にチェックする）
    setInterval(() => checkAutoplayConsistency({ isFromEvent: false }), 1500);
      // 最初のチェックは少し遅らせて実行（DOMContentLoadedの後）
    setTimeout(() => checkAutoplayConsistency({ forceCheck: true }), 1000);
    
    /**
     * イベントリスナーの追加
     * スライド変更時や自動再生切り替え時に確実にチェックするためにイベントリスナーを追加
     */
    
    // スライド変更時にチェック
    document.addEventListener('slideChanged', (event) => {
        console.log('スライド変更イベントを検出:', event.detail);
        // スライド変更直後と少し時間をおいた後の2回チェック
        setTimeout(() => checkAutoplayConsistency({ isFromEvent: true }), 10);
        setTimeout(() => checkAutoplayConsistency({ isFromEvent: true }), 1000);
    });
    
    // 自動再生状態変更イベント処理
    document.addEventListener('autoplayStateChanged', (event) => {
        console.log('自動再生状態変更イベントを検出:', event.detail);
        checkAutoplayConsistency({ isFromEvent: true, forceCheck: true });
    });
    
    // LocalStorage変更イベント処理
    window.addEventListener('storage', (event) => {
        if (event.key === 'sf01_autoplayState') {
            console.log('LocalStorageの自動再生状態変更を検出:', event.newValue);
            checkAutoplayConsistency({ isFromEvent: true });
        }
    });
    
    // 診断情報取得関数
    window.getAutoplayMonitorStatus = function() {
        return {
            monitorStatus: monitor,
            currentStates: {
                coreState: window.SlideshowCore?.state?.autoplayEnabled,
                globalState: window.globalAutoplayState === true,
                uiState: document.getElementById('autoplay-btn')?.classList.contains('active') || false,
                localStorageState: localStorage.getItem('sf01_autoplayState') === 'active'
            },
            stateHistory: monitor.history
        };
    };
    
    // 強制的に状態を修正する関数を提供
    window.forceAutoplayStateCorrection = function(desiredState) {
        const state = desiredState === undefined ? 
            window.SlideshowCore?.state?.autoplayEnabled : 
            Boolean(desiredState);
            
        console.log(`自動再生状態を強制的に ${state ? '有効' : '無効'} に設定します`);
        
        try {
            window.SlideshowCore.setAutoplayState(state);
            window.globalAutoplayState = state;
            window.autoplayMode = state;
            localStorage.setItem('sf01_autoplayState', state ? 'active' : 'inactive');
            
            const autoplayBtn = document.getElementById('autoplay-btn');
            if (autoplayBtn) {
                if (state) {
                    autoplayBtn.classList.add('active');
                } else {
                    autoplayBtn.classList.remove('active');
                }
            }
            
            return { success: true, state: state };
        } catch (error) {
            console.error('強制修正に失敗しました:', error);
            return { success: false, error: error.message };
        }
    };
    
    console.log('自動再生モニター: 初期化完了（拡張版）');
})();
