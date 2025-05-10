/**
 * スライド1の自動再生機能を修正するためのスクリプト
 * 問題: スライド1が自動再生で次に進まない
 */

// スライド1用の自動再生機能を強化
document.addEventListener('DOMContentLoaded', function() {
    console.log('スライド1自動再生修正スクリプトを初期化しています');
    
    // スライドショーが完全にロードされた後に実行
    let slideLoadCheckInterval = setInterval(function() {
        // SlideshowCoreがロードされ、スライド表示の準備ができているか確認
        if (window.SlideshowCore && document.querySelector('.slide')) {
            clearInterval(slideLoadCheckInterval);
            initSlide1AutoplayFix();
        }
    }, 500);
    
    // 10秒後にインターバルを強制的に停止（セーフティ）
    setTimeout(function() {
        if (slideLoadCheckInterval) {
            clearInterval(slideLoadCheckInterval);
            console.log('タイムアウト - スライドショーのロード完了を待つのを中止します');
        }
    }, 10000);
});

// スライド1の自動再生修正を初期化
function initSlide1AutoplayFix() {
    console.log('スライド1の自動再生修正を初期化します');
    
    // スライド変更イベントをリッスンして、スライド1に戻ったときの処理を追加
    document.addEventListener('slideChanged', function(e) {
        console.log('スライド変更イベントを検知:', e.detail);
        
        // スライド1に移動したかどうかを確認
        if (e.detail.to === 1) {
            handleSlide1Activation();
        }
    });
    
    // 自動再生状態変更イベントをリッスン
    document.addEventListener('autoplayStateChanged', function(e) {
        console.log('自動再生状態変更を検知:', e.detail);
        
        // 自動再生が有効になり、現在スライド1が表示されている場合
        if (e.detail.newState === true && window.SlideshowCore.state.currentSlide === 1) {
            handleSlide1Activation();
        }
    });
    
    // 初期ロード時にスライド1が表示されている場合の処理
    if (window.SlideshowCore.state.currentSlide === 1) {
        console.log('初期ロード時にスライド1が表示されています');
        handleSlide1Activation();
    }
}

// スライド1がアクティブになったときの処理
function handleSlide1Activation() {
    console.log('スライド1がアクティブになりました');
    
    // 現在の自動再生状態をチェック
    const isAutoplayEnabled = window.SlideshowCore.state.autoplayEnabled || 
                            window.globalAutoplayState === true || 
                            localStorage.getItem('sf01_autoplayState') === 'active';
    
    if (!isAutoplayEnabled) {
        console.log('自動再生が無効のため、スライド1の特別処理をスキップします');
        return;
    }
    
    console.log('スライド1の自動再生監視を開始します');
    
    // 既存のタイマーをクリア
    if (window.slide1AutoplayTimer) {
        clearTimeout(window.slide1AutoplayTimer);
    }
    
    // スライド1用の自動再生タイマーをセット
    window.slide1AutoplayTimer = setTimeout(function() {
        // 再度状態を確認（タイマー待機中に変わっている可能性があるため）
        const currentAutoplayState = window.SlideshowCore.state.autoplayEnabled || 
                                  window.globalAutoplayState === true || 
                                  localStorage.getItem('sf01_autoplayState') === 'active';
        
        const currentSlide = window.SlideshowCore.state.currentSlide;
        
        console.log('スライド1自動再生タイマーが発火: 現在の状態', {
            slide: currentSlide,
            autoplay: currentAutoplayState
        });
        
        if (currentSlide === 1 && currentAutoplayState) {
            console.log('スライド1から次のスライドへ自動進行します');
            
            // スライド2へ移動
            if (typeof changeSlide === 'function') {
                changeSlide(2);
                console.log('スライド2へ移動しました');
            } else {
                console.error('changeSlide関数が見つかりません');
            }
        }
    }, 5000); // スライド1用に特別に長めの時間を設定（5秒）
    
    // 処理済みフラグを設定
    window.slide1AutoplayProcessed = true;
}

// スライド1の音声終了イベントを強化
function enhanceSlide1AudioEndedEvent() {
    // preloadedAudiosが利用可能になるまで待機
    let checkAudioInterval = setInterval(function() {
        if (window.preloadedAudios && window.preloadedAudios.length > 0) {
            clearInterval(checkAudioInterval);
            
            // スライド1用の音声があるか確認
            const slide1Audio = window.preloadedAudios[0];
            if (slide1Audio) {
                console.log('スライド1の音声イベントを強化します');
                
                // 既存のendedイベントを保持しつつ、新しいイベントを追加
                const originalEndedEvent = slide1Audio.onended;
                
                slide1Audio.addEventListener('ended', function() {
                    console.log('強化されたスライド1音声終了イベント発火');
                    
                    // 自動再生モードが有効なら次のスライドへ
                    const isAutoplayOn = window.SlideshowCore.state.autoplayEnabled || 
                                       window.globalAutoplayState === true || 
                                       localStorage.getItem('sf01_autoplayState') === 'active';
                    
                    if (isAutoplayOn && window.SlideshowCore.state.currentSlide === 1) {
                        console.log('スライド1の音声終了: 自動再生モードで次へ進みます');
                        
                        // 既存のタイマーをクリア
                        if (window.autoplayTimeout) {
                            clearTimeout(window.autoplayTimeout);
                        }
                        
                        // 少し遅延させて次のスライドへ移動
                        window.autoplayTimeout = setTimeout(function() {
                            if (window.SlideshowCore.state.currentSlide === 1) {
                                console.log('スライド1から次へ移動します');
                                if (typeof changeSlide === 'function') {
                                    changeSlide(2);
                                }
                            }
                        }, 1500);
                    }
                });
                
                console.log('スライド1の音声イベントが強化されました');
            }
        }
    }, 500);
    
    // 10秒後にインターバルを強制的に停止（セーフティ）
    setTimeout(function() {
        if (checkAudioInterval) {
            clearInterval(checkAudioInterval);
            console.log('タイムアウト - オーディオの準備完了を待つのを中止します');
        }
    }, 10000);
}

// すべての修正を初期化
window.addEventListener('load', function() {
    // 音声終了イベントの強化
    enhanceSlide1AudioEndedEvent();
    
    console.log('スライド1の自動再生修正が完全に初期化されました');
});
