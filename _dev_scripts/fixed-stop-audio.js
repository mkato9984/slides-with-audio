/**
 * 修正した音声停止関数
 */

// 現在の音声を停止
function stopCurrentAudio(keepAutoplay = false) {
    console.log('音声停止関数を実行: 自動再生を維持=', keepAutoplay);
    
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
}
