/**
 * プレゼンテーションの音声再生機能の修正スクリプト
 * このファイルは、構文エラーにより発生していた問題を修正した音声再生機能を提供します。
 */

// 音声再生のための修正された関数
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
                toggleAutoplay();
                showNotification('プレゼンテーションが終了しました');
            }
            
            // 同期コマンドを送信
            if (typeof syncInProgress !== 'undefined' && !syncInProgress) {
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
        
        // 音声再生を試みる
        try {
            const playPromise = currentAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`スライド ${slideIndex} の音声再生成功`);
                    
                    // 同期コマンド送信
                    if (typeof syncInProgress !== 'undefined' && !syncInProgress && typeof window.SyncModule !== 'undefined') {
                        window.SyncModule.syncAudio('play', slideIndex);
                    }
                    window.isPlayingAudio = false;
                }).catch(error => {
                    console.error(`スライド ${slideIndex} の音声再生に失敗:`, error);
                    showNotification('音声の再生に失敗しました。ブラウザの自動再生ポリシーによりブロックされている可能性があります。');
                    
                    // 自動再生失敗時のUI処理
                    if (typeof blinkAudioButton === 'function') {
                        blinkAudioButton();
                    }
                    
                    // 状態リセット
                    window.SlideshowCore.setAudioPlaying(false);
                    audioPlaying = false;
                    audioBtn.classList.remove('active');
                    audioBtn.textContent = '音声再生';
                    window.isPlayingAudio = false;
                });
            } else {
                window.isPlayingAudio = false;
            }
        } catch (error) {
            console.error('音声再生の実行中にエラーが発生しました:', error);
            audioBtn.textContent = '音声再生';
            audioBtn.classList.remove('active');
            audioPlaying = false;
            window.SlideshowCore.setAudioPlaying(false);
            
            if (typeof syncInProgress !== 'undefined' && !syncInProgress) {
                sendAudioCommand('stop');
            }
            window.isPlayingAudio = false;
            showNotification('音声の再生に失敗しました');
        }
    } catch (error) {
        // 例外処理 - 音声再生処理全体の例外をキャッチし、状態をリセット
        console.error('音声再生処理でエラーが発生しました:', error);
        audioPlaying = false;
        window.SlideshowCore.setAudioPlaying(false);
        audioBtn.classList.remove('active');
        audioBtn.textContent = '音声再生';
        window.isPlayingAudio = false;
        showNotification('音声再生中にエラーが発生しました');
    }
};

// 修正されたコードが読み込まれたことを確認するためのフラグを設定
console.log('音声再生機能の修正が適用されました');
window.fixedAudioFunctionsLoaded = true;
