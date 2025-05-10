/**
 * プレゼンター画面のボタン機能を修復するスクリプト
 * 特にプレゼンター画面での操作性問題を解決します
 */

(function() {
    console.log('プレゼンター画面のボタン機能修復スクリプトを初期化');
    
    // 問題の状態を追跡
    let initialized = false;
    let fixAttempts = 0;
    
    // 問題のあるボタン要素の一覧
    const BUTTON_SELECTORS = {
        prev: '#prev-btn',
        next: '#next-btn',
        autoplay: '#autoplay-btn', 
        sync: '#sync-btn',
        audio: '#audio-btn',
        startTimer: '#start-timer-btn',
        resetTimer: '#reset-timer-btn',
        editNote: '#edit-note-btn',
        saveNote: '#save-note-btn',
        cancelNote: '#cancel-note-btn'
    };
    
    // 通知機能
    function showFixNotification(message) {
        try {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.textContent = message;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            } else {
                console.log('通知:', message);
            }
        } catch (e) {
            console.log('通知表示中にエラー:', e);
        }
    }
    
    // ボタンの機能を修復
    function fixButtonFunctionality(selector, expectedFunction, forceFix = false) {
        try {
            const button = document.querySelector(selector);
            if (!button) {
                console.warn(`ボタンが見つかりません: ${selector}`);
                return false;
            }
            
            // イベントハンドラが機能しているか確認
            const hasClickHandler = button.onclick || 
                                   (button._events && button._events.click) || 
                                   button.getAttribute('onclick');
            
            // 強制修復モードか、ハンドラがない場合に修復
            if (forceFix || !hasClickHandler) {
                console.log(`ボタン ${selector} の機能を修復します`);
                
                // セレクタに基づいて、適切な機能を割り当て
                switch (selector) {
                    case '#prev-btn':
                        button.onclick = function() {
                            console.log('前へボタンがクリックされました');
                            if (window.currentSlide > 1) {
                                if (typeof window.changeSlide === 'function') {
                                    window.changeSlide(window.currentSlide - 1);
                                } else {
                                    // 代替実装
                                    window.currentSlide--;
                                    updatePresenterView();
                                    syncWithMainWindow();
                                }
                            }
                        };
                        break;
                        
                    case '#next-btn':
                        button.onclick = function() {
                            console.log('次へボタンがクリックされました');
                            if (window.currentSlide < (window.totalSlides || 11)) {
                                if (typeof window.changeSlide === 'function') {
                                    window.changeSlide(window.currentSlide + 1);
                                } else {
                                    // 代替実装
                                    window.currentSlide++;
                                    updatePresenterView();
                                    syncWithMainWindow();
                                }
                            }
                        };
                        break;
                        
                    case '#autoplay-btn':
                        button.onclick = function() {
                            console.log('自動再生ボタンがクリックされました');
                            if (typeof window.toggleAutoplay === 'function') {
                                window.toggleAutoplay();
                            } else {
                                // 代替実装
                                window.autoplayMode = !window.autoplayMode;
                                
                                // ボタンの状態を更新
                                if (window.autoplayMode) {
                                    button.classList.add('active');
                                    button.textContent = '自動再生停止';
                                    showFixNotification('自動再生を開始しました');
                                } else {
                                    button.classList.remove('active');
                                    button.textContent = '自動再生';
                                    showFixNotification('自動再生を停止しました');
                                }
                                
                                // 同期用にローカルストレージを更新
                                try {
                                    localStorage.setItem('sf01_autoplayState', window.autoplayMode ? 'active' : 'inactive');
                                    
                                    // 同期コマンド送信
                                    const autoplayCommand = {
                                        action: 'autoplay',
                                        state: window.autoplayMode ? 'active' : 'inactive',
                                        slide: window.currentSlide,
                                        timestamp: Date.now()
                                    };
                                    
                                    localStorage.setItem('syncCommand', JSON.stringify(autoplayCommand));
                                } catch (e) {
                                    console.error('自動再生状態の同期に失敗:', e);
                                }
                            }
                        };
                        break;
                        
                    case '#sync-btn':
                        button.onclick = function() {
                            console.log('同期ボタンがクリックされました');
                            if (typeof window.requestFullSync === 'function') {
                                window.requestFullSync();
                            } else {
                                // 代替実装
                                try {
                                    const syncData = {
                                        action: 'fullSync',
                                        slide: window.currentSlide,
                                        timestamp: Date.now(),
                                        source: 'presenter'
                                    };
                                    
                                    localStorage.setItem('syncCommand', JSON.stringify(syncData));
                                    showFixNotification('同期リクエストを送信しました');
                                } catch (e) {
                                    console.error('同期リクエスト送信中にエラー:', e);
                                }
                            }
                        };
                        break;
                        
                    case '#audio-btn':
                        button.onclick = function() {
                            console.log('音声ボタンがクリックされました');
                            if (typeof window.toggleAudio === 'function') {
                                window.toggleAudio();
                            } else {
                                // 代替実装
                                const isCurrentlyPlaying = button.classList.contains('active');
                                
                                if (isCurrentlyPlaying) {
                                    button.classList.remove('active');
                                    button.textContent = '音声再生';
                                    showFixNotification('音声を停止しました');
                                    
                                    // 音声停止処理
                                    if (typeof window.stopAudio === 'function') {
                                        window.stopAudio();
                                    }
                                } else {
                                    button.classList.add('active');
                                    button.textContent = '音声停止';
                                    showFixNotification('音声を再生します');
                                    
                                    // 音声再生処理
                                    if (typeof window.playAudio === 'function') {
                                        window.playAudio(window.currentSlide);
                                    }
                                }
                                
                                // 同期用にローカルストレージを更新
                                try {
                                    const audioCommand = {
                                        action: isCurrentlyPlaying ? 'stop' : 'play',
                                        slide: window.currentSlide,
                                        timestamp: Date.now()
                                    };
                                    
                                    localStorage.setItem('audioCommand', JSON.stringify(audioCommand));
                                } catch (e) {
                                    console.error('音声状態の同期に失敗:', e);
                                }
                            }
                        };
                        break;
                        
                    // その他のボタンに対する処理を追加...
                    case '#start-timer-btn':
                        button.onclick = function() {
                            console.log('タイマー開始ボタンがクリックされました');
                            if (typeof window.startTimer === 'function') {
                                window.startTimer();
                            }
                        };
                        break;
                        
                    case '#reset-timer-btn':
                        button.onclick = function() {
                            console.log('タイマーリセットボタンがクリックされました');
                            if (typeof window.resetTimer === 'function') {
                                window.resetTimer();
                            }
                        };
                        break;
                    
                    case '#edit-note-btn':
                        button.onclick = function() {
                            console.log('ノート編集ボタンがクリックされました');
                            if (typeof window.startEditingNote === 'function') {
                                window.startEditingNote();
                            }
                        };
                        break;
                        
                    case '#save-note-btn':
                        button.onclick = function() {
                            console.log('ノート保存ボタンがクリックされました');
                            if (typeof window.saveNote === 'function') {
                                window.saveNote();
                            }
                        };
                        break;
                        
                    case '#cancel-note-btn':
                        button.onclick = function() {
                            console.log('ノート編集キャンセルボタンがクリックされました');
                            if (typeof window.cancelNote === 'function') {
                                window.cancelNote();
                            }
                        };
                        break;
                }
                
                return true;
            }
            
            return hasClickHandler;
        } catch (e) {
            console.error(`ボタン ${selector} の修復中にエラー:`, e);
            return false;
        }
    }
    
    // 更新中のスライドエラーを修復
    function fixUpdatePresenterView() {
        if (typeof window.updatePresenterView !== 'function') {
            console.log('updatePresenterView関数が存在しないため、代替実装を提供します');
            
            window.updatePresenterView = function() {
                try {
                    // スライドカウンターの更新
                    const slideCounter = document.getElementById('slide-counter');
                    if (slideCounter) {
                        const totalSlides = window.totalSlides || 11;
                        slideCounter.textContent = `${window.currentSlide} / ${totalSlides}`;
                    }
                    
                    // 現在のスライドと次のスライドのプレビュー画像を更新
                    const currentSlideImage = document.getElementById('current-slide-image');
                    if (currentSlideImage) {
                        currentSlideImage.src = `salesforce_slides/salesforce_slides01/slide${String(window.currentSlide).padStart(2, '0')}.png`;
                    }
                    
                    // 次のスライドのプレビューを更新
                    const nextSlideImage = document.getElementById('next-slide-image');
                    if (nextSlideImage) {
                        if (window.currentSlide < (window.totalSlides || 11)) {
                            nextSlideImage.src = `salesforce_slides/salesforce_slides01/slide${String(window.currentSlide + 1).padStart(2, '0')}.png`;
                            nextSlideImage.style.display = 'block';
                            const nextLabel = document.querySelector('.next-slide-preview .next-label');
                            if (nextLabel) nextLabel.style.display = 'block';
                        } else {
                            // 最後のスライドの場合は次のプレビューを非表示
                            nextSlideImage.style.display = 'none';
                            const nextLabel = document.querySelector('.next-slide-preview .next-label');
                            if (nextLabel) nextLabel.style.display = 'none';
                        }
                    }
                    
                    // ノートを表示
                    if (typeof window.displayNotes === 'function') {
                        window.displayNotes(window.currentSlide);
                    }
                    
                    // ナビゲーションボタンの状態を更新
                    if (typeof window.updateButtonState === 'function') {
                        window.updateButtonState();
                    } else {
                        const prevBtn = document.getElementById('prev-btn');
                        const nextBtn = document.getElementById('next-btn');
                        
                        if (prevBtn) prevBtn.disabled = window.currentSlide <= 1;
                        if (nextBtn) nextBtn.disabled = window.currentSlide >= (window.totalSlides || 11);
                    }
                    
                    console.log(`プレゼンタービューを更新しました: スライド ${window.currentSlide}`);
                } catch (e) {
                    console.error('プレゼンタービュー更新中にエラー:', e);
                }
            };
            
            return true;
        }
        
        return false;
    }
    
    // 同期関数の修復
    function fixSyncWithMainWindow() {
        if (typeof window.syncWithMainWindow !== 'function') {
            console.log('syncWithMainWindow関数が存在しないため、代替実装を提供します');
            
            window.syncWithMainWindow = function() {
                try {
                    localStorage.setItem('sf01_currentSlide', window.currentSlide.toString());
                    
                    // 同期コマンドデータ
                    const syncData = {
                        action: 'slideChange',
                        slide: window.currentSlide,
                        timestamp: Date.now(),
                        source: 'presenter'
                    };
                    
                    // 音声状態も含める
                    const audioBtn = document.getElementById('audio-btn');
                    if (audioBtn && audioBtn.classList.contains('active')) {
                        syncData.audioAction = 'play';
                    }
                    
                    localStorage.setItem('syncCommand', JSON.stringify(syncData));
                    console.log(`メイン画面と同期: スライド ${window.currentSlide}`);
                    
                    // 通知
                    showFixNotification(`スライド ${window.currentSlide} に同期しました`);
                } catch (e) {
                    console.error('メイン画面との同期に失敗:', e);
                }
            };
            
            return true;
        }
        
        return false;
    }
    
    // すべてのボタンの動作を修復
    function fixAllButtons(forceFix = false) {
        let fixedCount = 0;
        
        // 各ボタンを修復
        for (const [name, selector] of Object.entries(BUTTON_SELECTORS)) {
            if (fixButtonFunctionality(selector, name, forceFix)) {
                fixedCount++;
            }
        }
        
        // 重要な関数の修復
        if (fixUpdatePresenterView()) fixedCount++;
        if (fixSyncWithMainWindow()) fixedCount++;
        
        // 修復結果をログ
        if (fixedCount > 0) {
            console.log(`${fixedCount}個のボタン/機能が修復されました`);
            showFixNotification(`プレゼンター機能が修復されました (${fixedCount}項目)`);
        }
        
        return fixedCount;
    }
    
    // 初期化関数
    function initialize() {
        if (initialized) return;
        
        console.log('プレゼンター画面のボタン修復を実行します');
        
        // 強制修復モードは最初に1回だけ実行
        const forceFix = (fixAttempts === 0);
        const fixedCount = fixAllButtons(forceFix);
        
        if (fixedCount > 0) {
            console.log(`${fixedCount}個のボタン/機能が初期化されました`);
            initialized = true;
        } else {
            console.log('修復の必要はありませんでした');
        }
        
        fixAttempts++;
    }
    
    // DOM読み込み完了後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOMがすでに読み込まれている場合は即時実行
        initialize();
    }
    
    // 完全読み込み後にも再チェック
    window.addEventListener('load', function() {
        initialize();
        
        // 定期的なチェック
        setInterval(() => {
            fixAllButtons(false);
        }, 3000); // 3秒ごとにチェック
    });
      // 公開API
    window.presenterButtonsFix = {
        fixAllButtons: function(force = true) {
            return fixAllButtons(force);
        },
        reInitialize: initialize
    };
    
    // 統合マネージャーに登録
    if (window.slidesManager && typeof window.slidesManager.setFixLoaded === 'function') {
        window.slidesManager.setFixLoaded('presenterButtons');
    }
})();
