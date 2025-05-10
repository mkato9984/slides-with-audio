/**
 * Salesforceスライドプレゼンテーション - コア機能修正セット
 * このファイルをインクルードすることで、自動再生と音声機能の問題を修正します。
 */

// メインスライドショーで実行する場合の初期化関数
function initializeFixedFunctions() {
    console.log('修正された機能セットを初期化します');
    
    // 音声再生の修正版関数
    window.playCurrentAudio = function() {
        console.log('音声再生関数を実行(修正版): 現在のスライド=', window.SlideshowCore.state.currentSlide);
        
        // 再生中ロックのチェック
        if (window.isPlayingAudio) {
            console.log('音声再生処理が既に進行中です');
            return;
        }
        
        window.isPlayingAudio = true;
        
        try {
            // スライド番号の整合性確認
            const currentSlideNum = window.SlideshowCore.state.currentSlide;
            
            console.log('音声再生準備: スライド番号=', currentSlideNum, 'オーディオ配列長=', preloadedAudios.length);
            
            // 音声ファイルの存在チェック
            if (!preloadedAudios[currentSlideNum - 1]) {
                console.error(`スライド ${currentSlideNum} 用のオーディオが見つかりません`);
                showNotification('音声ファイルが見つかりません');
                window.isPlayingAudio = false;
                return;
            }
            
            // 重複再生防止
            if (window.SlideshowCore.state.audioPlaying && 
                window.SlideshowCore.audio.current === preloadedAudios[currentSlideNum - 1]) {
                console.log('現在のスライドの音声が既に再生中です');
                
                // UIを確実に更新
                audioBtn.classList.add('active');
                audioBtn.textContent = '音声停止';
                audioPlaying = true;
                
                window.isPlayingAudio = false;
                return;
            }
            
            // 現在の音声を停止して新しい音声の準備（自動再生状態は維持）
            if (window.SlideshowCore.state.audioPlaying) {
                console.log('新しい音声再生のため、現在の音声を停止します');
                stopCurrentAudio(true); // 自動再生状態は維持
            }
            
            // プレゼンターモード連携確認
            const presenterConnected = localStorage.getItem('sf01_presenterConnected') === 'true';
            
            // プレゼンター連携時の処理
            if (presenterConnected && localStorage.getItem('sf01_audioSource') === 'presenter') {
                // プレゼンターが制御している場合、UIのみ更新
                window.SlideshowCore.setAudioPlaying(true);
                audioPlaying = true;
                audioBtn.classList.add('active');
                audioBtn.textContent = '音声停止';
                window.isPlayingAudio = false;
                return;
            }
            
            // このウィンドウを音声ソースとしてマーク
            localStorage.setItem('sf01_audioSource', 'main');
            
            // 現在のスライド番号とオーディオを取得
            const slideIndex = window.SlideshowCore.state.currentSlide;
            currentAudio = preloadedAudios[slideIndex - 1];
            
            // コアモジュールに現在の音声を設定
            window.SlideshowCore.audio.current = currentAudio;
            
            // オーディオ要素の初期化
            if (currentAudio.readyState > 0) {
                currentAudio.currentTime = 0;
            }
            
            // エラーハンドリング設定
            currentAudio.onerror = function(e) {
                console.error(`音声ファイル再生エラー:`, e);
                showNotification(`音声再生エラー`);
                
                // 状態更新
                window.SlideshowCore.setAudioPlaying(false);
                audioPlaying = false;
                audioBtn.classList.remove('active');
                audioBtn.textContent = '音声再生';
                window.isPlayingAudio = false;
            };
            
            // 再生完了イベント設定
            currentAudio.onended = function() {
                console.log(`音声再生完了: スライド ${window.SlideshowCore.state.currentSlide}`);
                
                // 状態更新
                window.SlideshowCore.setAudioPlaying(false);
                audioPlaying = false;
                audioBtn.classList.remove('active');
                audioBtn.textContent = '音声再生';
                
                // 自動再生モードでの次スライド処理
                const autoplayEnabled = window.SlideshowCore.state.autoplayEnabled;
                const maxSlides = window.SlideshowCore.state.totalSlides;
                const currentPosition = window.SlideshowCore.state.currentSlide;
                
                console.log('音声終了時の自動再生状態:', {
                    autoplayEnabled,
                    currentPosition,
                    maxSlides,
                    globalState: window.globalAutoplayState
                });
                
                if (autoplayEnabled && currentPosition < maxSlides) {
                    // 既存のタイマーをクリア
                    if (autoplayTimeout) {
                        clearTimeout(autoplayTimeout);
                        autoplayTimeout = null;
                    }
                    
                    // 自動再生タイマー設定
                    console.log(`自動再生: ${1500}ミリ秒後にスライド ${currentPosition + 1} に進みます`);
                    autoplayTimeout = setTimeout(() => {
                        // 再度状態をチェック
                        if (window.SlideshowCore.state.autoplayEnabled && 
                            window.SlideshowCore.state.currentSlide === currentPosition) {
                            console.log(`自動再生: スライド ${currentPosition + 1} に移動します`);
                            changeSlide(currentPosition + 1);
                        } else {
                            console.log('自動再生状態が変わったか、すでにスライドが移動しているため次へ進みません');
                        }
                    }, 1500);
                    
                    // コアモジュールにタイマーを登録
                    window.SlideshowCore.timers.autoplayTimeout = autoplayTimeout;
                } else if (autoplayEnabled && currentPosition === maxSlides) {
                    // 最終スライドで自動再生終了
                    console.log('最終スライドに到達したため、自動再生を停止します');
                    showNotification('プレゼンテーションが終了しました');
                    toggleAutoplay(); // 自動再生を停止
                }
                
                // 同期コマンドを送信
                if (!syncInProgress) {
                    sendAudioCommand('ended', currentPosition);
                }
                
                window.isPlayingAudio = false;
            };
            
            // 音量設定
            currentAudio.volume = 1.0;
            
            // 状態とUI更新
            window.SlideshowCore.setAudioPlaying(true);
            audioPlaying = true;
            audioBtn.classList.add('active');
            audioBtn.textContent = '音声停止';
            
            // 再生開始
            console.log(`音声再生開始: スライド ${slideIndex}`);
            
            // 再生を試みる
            try {
                const playPromise = currentAudio.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('音声再生成功');
                        // プレゼンターにも同期
                        if (!syncInProgress) {
                            sendAudioCommand('play', slideIndex);
                        }
                        window.isPlayingAudio = false;
                    }).catch(error => {
                        console.error('音声再生失敗:', error);
                        // 失敗時の状態更新
                        window.SlideshowCore.setAudioPlaying(false);
                        audioPlaying = false;
                        audioBtn.classList.remove('active');
                        audioBtn.textContent = '音声再生';
                        showNotification('音声の再生に失敗しました');
                        window.isPlayingAudio = false;
                    });
                } else {
                    // Promise APIをサポートしていない古いブラウザ向け
                    window.isPlayingAudio = false;
                }
            } catch (error) {
                console.error('音声再生の実行中にエラーが発生しました:', error);
                audioBtn.textContent = '音声再生';
                audioBtn.classList.remove('active');
                audioPlaying = false;
                if (!syncInProgress) {
                    sendAudioCommand('stop');
                }
                window.isPlayingAudio = false;
                showNotification('音声の再生に失敗しました');
            }
        } catch (error) {
            console.error('音声再生処理でエラーが発生:', error);
            audioPlaying = false;
            window.SlideshowCore.setAudioPlaying(false);
            audioBtn.classList.remove('active');
            audioBtn.textContent = '音声再生';
            window.isPlayingAudio = false;
        }
    };
    
    // 音声停止の修正版関数
    window.stopCurrentAudio = function(keepAutoplay = false) {
        console.log('音声停止関数を実行(修正版): 自動再生を維持=', keepAutoplay);
        
        // 停止中ロックのチェック
        if (window.isStoppingAudio) {
            console.log('音声停止処理が既に進行中です');
            return;
        }
        
        window.isStoppingAudio = true;
        
        try {
            // 現在再生中の音声を取得
            const currentAudio = window.SlideshowCore.audio.current;
            
            if (currentAudio) {
                // 音声の停止処理
                try {
                    currentAudio.pause();
                    if (currentAudio.readyState > 0) {
                        currentAudio.currentTime = 0;
                    }
                    console.log('音声停止成功');
                } catch (e) {
                    console.error('音声停止中にエラー:', e);
                }
            }
            
            // UI状態の更新
            audioBtn.classList.remove('active');
            audioBtn.textContent = '音声再生';
            
            // 状態変数の更新
            audioPlaying = false;
            window.SlideshowCore.setAudioPlaying(false);
            
            // 自動再生状態の管理
            if (autoplayMode && !keepAutoplay) {
                // 手動停止の場合のみ自動再生モードを停止
                console.log('手動停止: 自動再生モードを停止します');
                
                // コア状態の更新
                window.SlideshowCore.setAutoplayState(false);
                window.globalAutoplayState = false;
                autoplayMode = false;
                
                // UI状態の更新
                autoplayBtn.classList.remove('active');
                autoplayBtn.textContent = '自動再生';
                
                // LocalStorage状態の更新
                localStorage.setItem('sf01_autoplayState', 'inactive');
                
                // タイムアウトをクリア
                if (autoplayTimeout) {
                    clearTimeout(autoplayTimeout);
                    autoplayTimeout = null;
                    window.SlideshowCore.timers.autoplayTimeout = null;
                }
                
                // 自動再生停止コマンドも送信（同期実行中は送信しない）
                if (!syncInProgress) {
                    sendSyncCommand('autoplayStop', {});
                }
            } else if (autoplayMode && keepAutoplay) {
                // 自動再生モードを維持する場合はすべての状態を確実に一貫させる
                console.log('自動再生モードを維持します: keepAutoplay=', keepAutoplay);
                
                // コア状態の更新
                window.SlideshowCore.setAutoplayState(true);
                window.globalAutoplayState = true;
                
                // UI状態の更新
                autoplayBtn.classList.add('active');
                autoplayBtn.textContent = '自動停止';
                
                // LocalStorage状態の更新
                localStorage.setItem('sf01_autoplayState', 'active');
            }
            
            // 音声停止の同期コマンドを送信（同期実行中は送信しない）
            if (!syncInProgress) {
                // keepAutoplay状態も送信
                sendAudioCommand('stop', currentSlide, keepAutoplay);
            }
        } catch (error) {
            console.error('音声停止処理でエラーが発生:', error);
        } finally {
            // 終了時には常にフラグをリセット
            setTimeout(() => {
                window.isStoppingAudio = false;
            }, 100);
        }
    };
    
    // 音声再生トグルの修正版関数
    window.toggleAudio = function() {
        console.log('音声トグル開始(修正版): 現在の状態=', audioPlaying, '自動再生=', autoplayMode);
        
        // 既に処理中の場合はリターン
        if (window.isTogglingAudio) {
            console.log('音声トグル処理が既に実行中です');
            return;
        }
        
        window.isTogglingAudio = true;
        
        try {
            if (audioPlaying) {
                // 自動再生中の場合、音声ボタンは音声だけ停止する（自動再生は維持）
                const preserveAutoplay = autoplayMode;
                
                console.log('音声停止実行: 自動再生維持=', preserveAutoplay);
                stopCurrentAudio(preserveAutoplay);
                
                // 通知表示
                if (!preserveAutoplay) {
                    showNotification('音声と自動再生を停止しました');
                } else {
                    showNotification('音声を停止しました');
                }
            } else {
                // このウィンドウが音声ソースであることをマーク
                localStorage.setItem('sf01_audioSource', 'main');
                
                // 音声再生
                playCurrentAudio();
                showNotification('音声を再生します');
            }
        } catch (e) {
            console.error('音声トグル処理でエラー:', e);
        } finally {
            // フラグをリセット
            setTimeout(() => {
                window.isTogglingAudio = false;
            }, 200);
        }
    };
    
    // 自動再生トグルの修正版関数
    window.toggleAutoplay = function(isFromSync = false) {
        // 連続クリック時に処理が重複しないようロック
        if (window.isTogglingAutoplay) {
            console.log('自動再生の切り替え処理が進行中です...');
            return;
        }
        
        console.log('自動再生トグル開始(修正版): 現在の状態=', autoplayMode, '音声再生中=', audioPlaying);
        window.isTogglingAutoplay = true;
        
        try {
            // 現在の状態を保存（デバッグ用）
            const previousState = {
                core: window.SlideshowCore.state.autoplayEnabled,
                global: window.globalAutoplayState,
                local: localStorage.getItem('sf01_autoplayState'),
                autoplayMode: autoplayMode
            };
            
            // コアモジュールで状態を切り替え
            autoplayMode = !autoplayMode;
            window.SlideshowCore.setAutoplayState(autoplayMode);
            window.globalAutoplayState = autoplayMode;
            
            // localStorage状態も確実に更新
            localStorage.setItem('sf01_autoplayState', autoplayMode ? 'active' : 'inactive');
            
            // 状態変更のタイムスタンプを記録（同期中の優先度判定に使用）
            localStorage.setItem('sf01_lastStateChangeTime', Date.now().toString());
            
            console.log(`自動再生モードを ${autoplayMode ? '開始' : '停止'} します ${isFromSync ? '(同期による変更)' : ''}`);
            console.log('状態変更前:', previousState);
            console.log('状態変更後:', {
                core: window.SlideshowCore.state.autoplayEnabled,
                global: window.globalAutoplayState,
                local: localStorage.getItem('sf01_autoplayState'),
                autoplayMode: autoplayMode
            });
            
            // UI更新処理 - ボタン状態を反映
            updateAutoplayUI(autoplayMode);
            
            if (autoplayMode) {
                // このウィンドウが音声/自動再生ソースであることをマーク
                if (!isFromSync) {
                    localStorage.setItem('sf01_audioSource', 'main');
                }
                
                showNotification('自動再生モードを開始しました');
                
                // 音声の状態に関わらず、常に適切な音声再生を開始
                // ここが重要：音声再生と連携
                if (!isFromSync || localStorage.getItem('sf01_audioSource') === 'main') {
                    console.log('自動再生開始: 現在の音声を停止し、新しく再生を試みます');
                    
                    // まず音声を確実に停止（自動再生は保持）
                    if (window.SlideshowCore.state.audioPlaying) {
                        stopCurrentAudio(true); // 自動再生モードは保持
                    }
                    
                    // UI状態を更新
                    audioBtn.classList.add('active');
                    audioBtn.textContent = '音声停止';
                    audioPlaying = true;
                    window.SlideshowCore.setAudioPlaying(true);
                    
                    // 少し遅延させて再生（UIの更新とタイミングをずらす）
                    setTimeout(() => {
                        console.log('自動再生モード有効化に伴い音声再生開始');
                        playCurrentAudio();
                    }, 200);
                }
            } else {
                showNotification('自動再生モードを停止しました');
                
                // タイマーをクリア
                window.SlideshowCore.stopAllTimers();
                if (autoplayTimeout) {
                    clearTimeout(autoplayTimeout);
                    autoplayTimeout = null;
                }
            }
            
            // 同期処理
            if (!isFromSync && window.SyncModule) {
                window.SyncModule.syncAutoplay(autoplayMode);
            }
            
            // カスタムイベントを発火させて自動再生モニターに通知
            document.dispatchEvent(new CustomEvent('autoplayStateChanged', { 
                detail: { 
                    newState: autoplayMode,
                    source: isFromSync ? 'sync' : 'user',
                    timestamp: new Date().toISOString()
                }
            }));
        } catch (error) {
            console.error('自動再生トグル処理でエラー:', error);
        } finally {
            // ロック解除（少し遅延させて連続実行を防止）
            setTimeout(() => {
                window.isTogglingAutoplay = false;
            }, 300);
        }
    };
    
    // 音声コマンド処理の修正版関数
    window.handleAudioCommand = function(command) {
        if (!command) return;
        
        // 古いコマンドは処理しない（5秒以上前のコマンド）
        if (command.timestamp && (Date.now() - command.timestamp > 5000)) {
            console.log('古い音声コマンドを無視します');
            return;
        }
        
        console.log('オーディオコマンドを受信(修正版):', command);
        
        // 自動再生状態も同期
        if (command.autoplayState !== undefined) {
            const newState = command.autoplayState === true;
            if (autoplayMode !== newState) {
                console.log(`音声コマンドから自動再生状態を同期: ${newState ? '有効' : '無効'}`);
                
                // 直接状態を設定（トグル関数を呼ばずに）
                window.SlideshowCore.setAutoplayState(newState);
                window.globalAutoplayState = newState;
                autoplayMode = newState;
                localStorage.setItem('sf01_autoplayState', newState ? 'active' : 'inactive');
                
                // UI更新
                updateAutoplayUI(newState);
            }
        }
        
        if (command.action === 'play') {
            // スライド番号が指定されていて、現在のスライドと一致する場合のみ再生
            if (command.slide !== undefined && command.slide === currentSlide && !audioPlaying) {
                console.log(`メイン画面が音声ソースになりました: スライド ${command.slide}の音声を再生`);
                localStorage.setItem('sf01_audioSource', command.source || 'main');
                playCurrentAudio();
            }
        } else if (command.action === 'stop') {
            if (audioPlaying) {
                // keepAutoplay フラグを尊重
                const keepAutoplay = command.keepAutoplay === true;
                console.log(`メイン画面から音声停止コマンドを受信: 自動再生保持=${keepAutoplay}`);
                stopCurrentAudio(keepAutoplay);
            }
        }
    };
    
    // 関数をオーバーライドして完了メッセージを表示
    console.log('メイン機能を修正版にオーバーライドしました');
}

// 修正関数をグローバルに展開
if (typeof window !== 'undefined') {
    window.enableFixedSlidesFeatures = initializeFixedFunctions;
}
