/**
 * 音声同期の問題を修正するスクリプト
 * 音声再生と自動再生の安定性を向上させます
 */

(function() {
    console.log('音声同期修正スクリプトを初期化しています');
    
    // グローバル状態を追跡
    window.AUDIO_FIX = {
        initialized: false,
        currentAudio: null,
        currentSlide: 1,
        isPlaying: false,
        attemptCount: 0,
        maxAttempts: 3,
        retryDelay: 1000, // ミリ秒
        eventHandlersAttached: false
    };
    
    // プレゼンテーションの状態
    let audioElements = [];
    let totalSlides = window.totalSlides || 6;
    
    // DOM要素の参照
    let audioBtn;
    let notification;
    
    // 通知機能
    function showNotification(message) {
        if (!notification) {
            notification = document.getElementById('notification');
            if (!notification) return;
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // 音声要素を見つけてキャッシュ
    function findAudioElements() {
        // preloadedAudiosをチェック（グローバル変数として存在する可能性がある）
        if (window.preloadedAudios && Array.isArray(window.preloadedAudios)) {
            audioElements = window.preloadedAudios;
            console.log(`${audioElements.length}個の音声要素が見つかりました（preloadedAudios）`);
            return true;
        }
        
        // 直接音声要素を作成
        audioElements = [];
        for (let i = 1; i <= totalSlides; i++) {
            try {
                const audio = new Audio(`audio/audio_${i}.wav`);
                audio.preload = 'auto';
                audio.dataset.slideNumber = i;
                
                // エラーハンドリングを強化
                audio.addEventListener('error', function(e) {
                    console.error(`スライド ${i} の音声読み込みエラー:`, e);
                });
                
                audioElements.push(audio);
            } catch (e) {
                console.error(`スライド ${i} の音声要素の作成に失敗:`, e);
            }
        }
        
        console.log(`${audioElements.length}個の音声要素を新規作成しました`);
        return audioElements.length > 0;
    }
    
    // 音声再生の安定性を向上
    function enhanceAudioPlayback() {
        // グローバル関数のバックアップと拡張
        const originalPlayCurrentAudio = window.playCurrentAudio;
        
        window.playCurrentAudio = function() {
            const slideNumber = window.currentSlide || 1;
            console.log(`音声再生の拡張機能: スライド${slideNumber}の音声を再生します`);
            
            // 元の関数を呼び出し
            if (typeof originalPlayCurrentAudio === 'function') {
                try {
                    originalPlayCurrentAudio();
                } catch (e) {
                    console.error('元の音声再生関数でエラーが発生:', e);
                }
            }
            
            // 追加の音声再生ロジック
            playSlideAudio(slideNumber);
        };
    }
    
    // 特定のスライド用の音声を再生
    function playSlideAudio(slideNumber) {
        if (slideNumber < 1 || slideNumber > totalSlides) return;
        
        // 既存の再生中の音声をすべて停止
        stopAllAudio();
        
        // 現在のスライドの音声を取得
        const audioIndex = slideNumber - 1;
        if (audioIndex >= audioElements.length) {
            console.warn(`スライド${slideNumber}の音声は利用できません（範囲外）`);
            return;
        }
        
        const audio = audioElements[audioIndex];
        if (!audio) {
            console.warn(`スライド${slideNumber}の音声要素が見つかりません`);
            return;
        }
        
        // 音声再生状態を追跡
        window.AUDIO_FIX.currentAudio = audio;
        window.AUDIO_FIX.currentSlide = slideNumber;
        window.AUDIO_FIX.isPlaying = true;
        window.AUDIO_FIX.attemptCount = 0;
        
        // 再生開始
        try {
            // 音声の初期設定
            audio.currentTime = 0;
            
            // 再生の堅牢性を高めるために、Promiseと従来のメソッドの両方を試みる
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`スライド ${slideNumber} の音声再生を開始しました`);
                    updateAudioButtonUI(true);
                }).catch(error => {
                    console.error(`音声再生でエラーが発生:`, error);
                    retryAudioPlayback(audio, slideNumber);
                });
            } else {
                // 古いブラウザでの再生
                updateAudioButtonUI(true);
            }
        } catch (e) {
            console.error('音声再生中にエラーが発生:', e);
            retryAudioPlayback(audio, slideNumber);
        }
        
        return audio;
    }
    
    // 再生に失敗した場合、再試行する
    function retryAudioPlayback(audio, slideNumber) {
        if (window.AUDIO_FIX.attemptCount >= window.AUDIO_FIX.maxAttempts) {
            console.warn(`スライド ${slideNumber} の音声再生を ${window.AUDIO_FIX.maxAttempts} 回試行しましたが失敗しました`);
            showNotification(`音声の再生に失敗しました（スライド ${slideNumber}）`);
            updateAudioButtonUI(false);
            return;
        }
        
        window.AUDIO_FIX.attemptCount++;
        console.log(`音声再生の再試行 (${window.AUDIO_FIX.attemptCount}/${window.AUDIO_FIX.maxAttempts})...`);
        
        setTimeout(() => {
            try {
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.error(`再試行中にエラーが発生:`, e);
                    retryAudioPlayback(audio, slideNumber);
                });
            } catch (e) {
                console.error('再試行中にエラーが発生:', e);
                retryAudioPlayback(audio, slideNumber);
            }
        }, window.AUDIO_FIX.retryDelay);
    }
    
    // すべての音声を停止
    function stopAllAudio() {
        audioElements.forEach(audio => {
            try {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            } catch (e) {
                console.error('音声停止中にエラーが発生:', e);
            }
        });
        
        // グローバル変数も更新
        if (window.currentAudio) {
            try {
                window.currentAudio.pause();
                window.currentAudio.currentTime = 0;
            } catch (e) {
                console.error('グローバル音声停止中にエラーが発生:', e);
            }
        }
        
        window.AUDIO_FIX.isPlaying = false;
        updateAudioButtonUI(false);
    }
    
    // 音声再生ボタンの状態を更新
    function updateAudioButtonUI(isPlaying) {
        if (!audioBtn) {
            audioBtn = document.getElementById('audio-btn');
            if (!audioBtn) return;
        }
        
        if (isPlaying) {
            audioBtn.textContent = '音声停止';
            audioBtn.classList.add('active');
        } else {
            audioBtn.textContent = '音声再生';
            audioBtn.classList.remove('active');
        }
    }
    
    // 音声イベントハンドラを設定
    function setupAudioEventHandlers() {
        if (window.AUDIO_FIX.eventHandlersAttached) return;
        
        audioElements.forEach(audio => {
            // 再生終了時のイベント
            audio.addEventListener('ended', function() {
                const slideNumber = parseInt(this.dataset.slideNumber) || 0;
                console.log(`スライド ${slideNumber} の音声再生が終了しました`);
                
                window.AUDIO_FIX.isPlaying = false;
                
                // 自動再生モードの場合は次のスライドに進む
                if (window.autoplayMode && window.currentSlide === slideNumber) {
                    console.log('自動再生: 次のスライドに進みます');
                    
                    // 既存のタイムアウトをクリア
                    if (window.autoplayTimeout) {
                        clearTimeout(window.autoplayTimeout);
                    }
                    
                    // 遅延を入れて次のスライドに進む
                    window.autoplayTimeout = setTimeout(() => {
                        if (window.currentSlide < totalSlides) {
                            if (typeof window.changeSlide === 'function') {
                                window.changeSlide(window.currentSlide + 1);
                            }
                        } else {
                            // 最終スライドで自動再生を停止
                            if (typeof window.toggleAutoplay === 'function') {
                                window.toggleAutoplay();
                            }
                            showNotification('プレゼンテーションが終了しました');
                        }
                    }, 1500); // 1.5秒の遅延
                } else {
                    // 音声ボタンの状態を更新
                    updateAudioButtonUI(false);
                }
            });
            
            // エラーイベントをより詳細に処理
            audio.addEventListener('error', function(e) {
                console.error(`音声エラー (スライド ${this.dataset.slideNumber}):`, e);
                showNotification('音声の読み込みに問題が発生しました');
                updateAudioButtonUI(false);
            });
        });
        
        window.AUDIO_FIX.eventHandlersAttached = true;
    }
    
    // 音声切り替え機能の拡張
    function enhanceAudioToggle() {
        const originalToggleAudio = window.toggleAudio;
        
        window.toggleAudio = function() {
            console.log('拡張された音声切り替え機能を使用');
            
            // 既存の機能を呼び出し
            if (typeof originalToggleAudio === 'function') {
                try {
                    originalToggleAudio();
                } catch (e) {
                    console.error('元の音声切り替え関数でエラーが発生:', e);
                }
            }
            
            // 拡張された音声制御
            const isCurrentlyPlaying = window.audioPlaying || window.AUDIO_FIX.isPlaying;
            
            if (isCurrentlyPlaying) {
                stopAllAudio();
                showNotification('音声再生を停止しました');
            } else {
                // 現在のスライドの音声を再生
                playSlideAudio(window.currentSlide || 1);
                showNotification('音声再生を開始しました');
            }
            
            // グローバル状態を同期
            window.audioPlaying = !isCurrentlyPlaying;
            window.AUDIO_FIX.isPlaying = !isCurrentlyPlaying;
            
            // LocalStorageを使用して同期
            try {
                const audioCommand = {
                    action: !isCurrentlyPlaying ? 'play' : 'pause',
                    slide: window.currentSlide || 1,
                    timestamp: Date.now()
                };
                localStorage.setItem('audioCommand', JSON.stringify(audioCommand));
            } catch (e) {
                console.error('音声コマンドの送信に失敗:', e);
            }
        };
    }
    
    // スライド変更のロジックを拡張
    function enhanceSlideChange() {
        // 元の関数をバックアップ
        const originalChangeSlide = window.changeSlide;
        
        if (typeof originalChangeSlide === 'function') {
            window.changeSlide = function(newSlide, ...args) {
                console.log(`拡張されたスライド変更: ${newSlide}`);
                
                // 音声再生状態を一時保存
                const wasPlaying = window.AUDIO_FIX.isPlaying || window.audioPlaying;
                
                // 現在の音声を停止
                stopAllAudio();
                
                // 元のスライド変更関数を呼び出し
                const result = originalChangeSlide.apply(this, [newSlide, ...args]);
                
                // スライド変更後、音声を再開（再生中だった場合）
                if (wasPlaying) {
                    setTimeout(() => {
                        playSlideAudio(newSlide);
                    }, 300);
                }
                
                return result;
            };
        }
    }
    
    // 起動処理
    function init() {
        if (window.AUDIO_FIX.initialized) return;
        
        console.log('音声修正モジュールを初期化しています...');
        
        // 音声要素の取得
        const hasAudio = findAudioElements();
        if (!hasAudio) {
            console.warn('音声要素が見つからないか、作成できませんでした');
            return;
        }
        
        // イベントハンドラの設定
        setupAudioEventHandlers();
        
        // 既存の機能を拡張
        enhanceAudioPlayback();
        enhanceAudioToggle();
        enhanceSlideChange();
        
        // UIの初期状態を設定
        audioBtn = document.getElementById('audio-btn');
        notification = document.getElementById('notification');
        
        // 初期化完了
        window.AUDIO_FIX.initialized = true;
        console.log('音声修正モジュールの初期化が完了しました');
        
        // 初期状態の同期
        if (window.currentSlide) {
            window.AUDIO_FIX.currentSlide = window.currentSlide;
        }
    }
    
    // DOMの読み込み状態に基づいて初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 安全のため、window.loadでも再度呼び出し
    window.addEventListener('load', init);
    
    // 公開API
    window.audioSyncFix = {
        play: function(slideNumber) {
            return playSlideAudio(slideNumber || window.currentSlide || 1);
        },
        stop: stopAllAudio,
        reinitialize: init
    };
})();
