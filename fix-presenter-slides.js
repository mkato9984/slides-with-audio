/**
 * プレゼンター画面のスライド表示問題を修正するスクリプト（強化版）
 * スライド画像が正しく表示されない問題を確実に解決します
 */

// 即時実行関数で最優先に実行 - ページ読み込み前から実行
(function() {
    console.log('プレゼンター画面スライド表示の修正スクリプト(強化版)を実行します');
    
    // グローバル変数をバックアップ（重要）
    window.SLIDES_FIX = {
        attempts: 0,
        initialized: false,
        slidePathRoot: 'salesforce_slides/salesforce_slides01',
        checkInterval: null
    };
    
    // スライド画像のパスを修正する関数
    function fixSlidePaths() {
        console.log('スライド画像パスの修正を試みます（試行回数: ' + window.SLIDES_FIX.attempts + '）');
        window.SLIDES_FIX.attempts++;
        
        // スライド画像要素を取得
        const slideImages = document.querySelectorAll('.slide-image');
        const currentSlide = window.currentSlide || 1;
        const totalSlides = window.totalSlides || 11;
        
        if (slideImages && slideImages.length > 0) {
            console.log(`スライド画像要素を ${slideImages.length} 件検出しました、パスを修正します`);
            
            slideImages.forEach((img, index) => {
                // 元の参照を保存
                const originalSrc = img.getAttribute('src') || '';
                
                if (!originalSrc || originalSrc.includes('読み込みができませんでした') || !img.complete) {
                    // 正しいパスを構築 - ルートからの絶対パスを使用
                    const slideNumber = index === 0 ? currentSlide : (currentSlide < totalSlides ? currentSlide + 1 : currentSlide);
                    const paddedNumber = slideNumber.toString().padStart(2, '0');
                    const correctPath = `/${window.SLIDES_FIX.slidePathRoot}/slide${paddedNumber}.png`;
                    
                    console.log(`画像 ${index + 1} のパスを修正: ${correctPath}`);
                    img.src = correctPath;                    
                    // 複数の代替パスを試すために、エラー回数を追跡
                    img.dataset.errorCount = 0;
                    
                    // エラー処理を追加 - 複数のフォールバック機構
                    img.onerror = function() {
                        const errorCount = parseInt(this.dataset.errorCount || '0') + 1;
                        this.dataset.errorCount = errorCount;
                        console.error(`画像の読み込みに失敗: ${this.src} (試行: ${errorCount})`);
                        
                        // 代替パスをいくつか試す
                        if (errorCount === 1) {
                            // 最初の失敗: クエリパラメータを追加して再試行
                            console.log('クエリパラメータを追加して再読み込みを試みます');
                            const altPath = `/${window.SLIDES_FIX.slidePathRoot}/slide${paddedNumber}.png?reload=${Date.now()}`;
                            this.src = altPath;
                        } else if (errorCount === 2) {
                            // 2回目の失敗: 相対パスを試す
                            console.log('相対パスで再読み込みを試みます');
                            this.src = `../salesforce_slides/salesforce_slides01/slide${paddedNumber}.png?v2=${Date.now()}`;
                        } else if (errorCount === 3) {
                            // 3回目の失敗: 絶対パスを試す（ドメインルートから）
                            console.log('絶対パスで再読み込みを試みます');
                            this.src = `/public_work/slides_project/salesforce_slides/salesforce_slides01/slide${paddedNumber}.png`;
                        } else {
                            // それでも失敗: 画像が読み込めないメッセージを表示
                            this.alt = '画像の読み込みができませんでした';
                            console.warn('全ての読み込み試行が失敗しました。スライド表示を再作成します。');
                            
                            // 遅延してスライド要素を再作成
                            setTimeout(() => {
                                createSlideElements();
                            }, 1000);
                        }
                    };
                }
            });
            
            // 全てのスライド画像の読み込み完了またはエラーを監視
            Promise.all(
                Array.from(slideImages).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.onload = img.onerror = () => resolve();
                        }
                    });
                })
            ).then(() => {
                console.log('全スライド画像の読み込み処理が完了しました');
            });
        } else {
            console.warn('スライド画像要素が見つかりませんでした - 要素を作成します');
            createSlideElements();
        }
    }
    
    // スライド要素を直接作成する関数
    function createSlideElements() {
        console.log('スライド要素を直接作成します');
        
        const currentSlidePreview = document.querySelector('.current-slide-preview');
        const nextSlidePreview = document.querySelector('.next-slide-preview');
        
        if (!currentSlidePreview || !nextSlidePreview) {
            console.error('プレビューコンテナが見つかりません。DOM構造を確認します');
            // トップレベル要素の確認
            const presenterViewElem = document.querySelector('.presenter-view');
            if (!presenterViewElem) {
                console.error('プレゼンタービュー要素が見つかりません');
                return;
            }
            
            // コンテナが見つからない場合は作成を試みる
            if (!currentSlidePreview) {
                console.log('現在のスライドプレビューコンテナを作成します');
                const newContainer = document.createElement('div');
                newContainer.className = 'current-slide-preview';
                presenterViewElem.appendChild(newContainer);
                currentSlidePreview = newContainer;
            }
            
            if (!nextSlidePreview) {
                console.log('次のスライドプレビューコンテナを作成します');
                const newContainer = document.createElement('div');
                newContainer.className = 'next-slide-preview';
                presenterViewElem.appendChild(newContainer);
                nextSlidePreview = newContainer;
            }
            
            if (!currentSlidePreview || !nextSlidePreview) {
                console.error('コンテナの作成に失敗しました');
                return;
            }
        }
        
        // 既存の画像を削除
        currentSlidePreview.innerHTML = '';
        nextSlidePreview.innerHTML = '';
        
        // 現在のスライド番号を取得（デフォルトは1）
        const currentSlide = window.currentSlide || 1;
        const totalSlides = window.totalSlides || 11;
        
        // 現在のスライド画像を作成 - フルパスを使用
        const currentImg = document.createElement('img');
        currentImg.className = 'slide-image current-slide-img';
        const currentPaddedNumber = currentSlide.toString().padStart(2, '0');
        currentImg.src = `salesforce_slides/salesforce_slides01/slide${currentPaddedNumber}.png`;
        currentImg.alt = `スライド ${currentSlide}`;
        currentSlidePreview.appendChild(currentImg);
          // 次のスライド画像を作成（最終スライドでない場合）
        const nextSlide = currentSlide < totalSlides ? currentSlide + 1 : currentSlide;
        const nextImg = document.createElement('img');
        nextImg.className = 'slide-image next-slide-img';
        const nextPaddedNumber = nextSlide.toString().padStart(2, '0');
        nextImg.src = `salesforce_slides/salesforce_slides01/slide${nextPaddedNumber}.png`;
        nextImg.alt = `スライド ${nextSlide}`;
        nextSlidePreview.appendChild(nextImg);
        
        // ラベルを追加
        if (nextSlide !== currentSlide) {
            const nextLabel = document.createElement('div');
            nextLabel.className = 'next-label';
            nextLabel.textContent = '次';
            nextSlidePreview.appendChild(nextLabel);
        }
        
        // 更新されたDOM要素をグローバル変数に設定（後で使うため）
        window.SLIDES_FIX.currentImg = currentImg;
        window.SLIDES_FIX.nextImg = nextImg;
        window.SLIDES_FIX.initialized = true;
        
        // 高度なエラーハンドリングを追加
        [currentImg, nextImg].forEach((img, index) => {
            // 複数の代替パスを試すために、エラー回数を追跡
            img.dataset.errorCount = 0;
            
            img.onerror = function() {
                const errorCount = parseInt(this.dataset.errorCount || '0') + 1;
                this.dataset.errorCount = errorCount;
                console.error(`画像の読み込みに失敗: ${this.src} (試行: ${errorCount})`);
                
                const slideNum = index === 0 ? currentSlide : nextSlide;
                const paddedNum = slideNum.toString().padStart(2, '0');
                
                // 複数の代替パスを順に試す
                if (errorCount === 1) {
                    // 1回目の失敗: リロードタイムスタンプを追加
                    const reloadSrc = `salesforce_slides/salesforce_slides01/slide${paddedNum}.png?reload=${Date.now()}`;
                    console.log(`代替パス1を試みます: ${reloadSrc}`);
                    this.src = reloadSrc;
                } else if (errorCount === 2) {
                    // 2回目の失敗: 相対パスを変更
                    const altPath = `../salesforce_slides/salesforce_slides01/slide${paddedNum}.png`;
                    console.log(`代替パス2を試みます: ${altPath}`);
                    this.src = altPath;
                } else if (errorCount === 3) {
                    // 3回目の失敗: フルパスを試す
                    const fullPath = `/public_work/slides_project/salesforce_slides/salesforce_slides01/slide${paddedNum}.png`;
                    console.log(`代替パス3を試みます: ${fullPath}`);
                    this.src = fullPath;
                } else {
                    // 最後の手段: プレースホルダ画像を表示
                    this.alt = `スライド ${slideNum} を読み込めません`;
                    
                    // プレースホルダとしてDIVを重ねる
                    const placeholder = document.createElement('div');
                    placeholder.className = 'slide-placeholder';
                    placeholder.innerHTML = `<p>スライド ${slideNum}</p><p>読み込みに失敗しました</p>`;
                    
                    // 画像の親要素に追加
                    this.parentNode.appendChild(placeholder);
                }
            };
            
            // 読み込み完了時の処理
            img.onload = function() {
                console.log(`スライド画像が正常に読み込まれました: ${this.src}`);
                // 画像が読み込まれたらプレースホルダを削除（あれば）
                const placeholders = this.parentNode.querySelectorAll('.slide-placeholder');
                placeholders.forEach(pl => pl.remove());
            };
        });
        
        // スライド画像が表示されたことをユーザーに通知
        if (window.showNotification) {
            window.showNotification('スライド画像を読み込みました');
        }
        
        return { currentImg, nextImg }; // 作成した要素を返す
    }
    
    // DOMが読み込まれた時に実行
    function init() {
        console.log('プレゼンター画面スライド表示修正の初期化');
        
        // まずパスを修正
        fixSlidePaths();
        
        // それでも表示されない場合は要素を再作成
        setTimeout(() => {
            if (document.querySelectorAll('.slide-image').length === 0) {
                console.log('スライド画像が見つからないため、要素を作成します');
                createSlideElements();
            } else {
                console.log('スライド画像を確認: すでに存在します');
            }
        }, 500);
        
        // 安全策として一定間隔でスライド表示をチェック（すでに設定されていなければ）
        if (!window.SLIDES_FIX.checkInterval) {
            window.SLIDES_FIX.checkInterval = setInterval(() => {
                const images = document.querySelectorAll('.slide-image');
                if (images.length === 0) {
                    console.log('定期チェック: スライド画像が見つかりません、再作成します');
                    createSlideElements();
                } else {
                    let allLoaded = true;
                    images.forEach(img => {
                        if (!img.complete) allLoaded = false;
                    });
                    
                    if (!allLoaded) {
                        console.log('定期チェック: 読み込まれていない画像があります、パスを修正します');
                        fixSlidePaths();
                    }
                }
            }, 3000);
        }
    }
      // メイン関数実行のスケジュール
    function scheduleExecution() {
        // ドキュメントの読み込み状態に関わらず、まず一度実行
        setTimeout(() => {
            console.log('初期実行: スライド表示の修正を開始します');
            init();
        }, 0);
        
        // ページが読み込まれたら再実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOMContentLoaded: スライド表示の修正を再実行します');
                init();
            });
        }
        
        // window.load イベントでも実行（最も信頼性の高いタイミング）
        window.addEventListener('load', function() {
            console.log('window.load: スライド表示の修正を確実に実行します');
            fixSlidePaths();
            
            // 短い間隔でスライド要素をチェック（数回）
            for (let i = 1; i <= 3; i++) {
                setTimeout(() => {
                    console.log(`スライド表示チェック (${i}/3)`);
                    const images = document.querySelectorAll('.slide-image');
                    if (images.length === 0) {
                        console.log('スライド画像が見つからないため、要素を作成します');
                        createSlideElements();
                    } else {
                        console.log(`スライド画像 ${images.length} 個を確認しました`);
                        fixSlidePaths();
                    }
                }, i * 500);
            }
        });
        
        // スライドが変更されたときにも実行するためのフック
        const originalChangeSlide = window.changeSlide;
        if (typeof originalChangeSlide === 'function') {
            window.changeSlide = function(slideNumber, ...args) {
                // 元の関数を呼び出し
                const result = originalChangeSlide.call(this, slideNumber, ...args);
                
                // スライド変更後、画像を更新
                console.log('スライド変更が検出されました。画像を更新します');
                setTimeout(() => {
                    fixSlidePaths();
                }, 100);
                
                return result;
            };
        }
    }
    
    // 実行をスケジュール
    scheduleExecution();
    
    // 公開API - 他のスクリプトからも使えるように
    window.fixPresenterSlides = {
        fix: fixSlidePaths,
        create: createSlideElements,
        reinitialize: init
    };
})();
