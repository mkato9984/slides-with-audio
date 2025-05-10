/**
 * Salesforceスライドプレゼンテーション - 最終テスト結果
 * 
 * このファイルでは、プレゼンテーションシステムの修正後のテスト結果を記録します。
 */

// テスト結果を記録する関数
function recordTestResult(testName, result, details) {
    // テスト名、結果（成功/失敗）、詳細を記録
    const testResult = {
        name: testName,
        success: result,
        details: details,
        timestamp: new Date().toISOString()
    };
    
    // 既存のテスト結果を取得するか、新しい配列を作成
    let existingResults = [];
    try {
        const storedResults = localStorage.getItem('sf01_testResults');
        if (storedResults) {
            existingResults = JSON.parse(storedResults);
        }
    } catch (e) {
        console.error('テスト結果の読み込み中にエラーが発生しました:', e);
    }
    
    // 新しいテスト結果を追加
    existingResults.push(testResult);
    
    // ローカルストレージに保存
    try {
        localStorage.setItem('sf01_testResults', JSON.stringify(existingResults));
    } catch (e) {
        console.error('テスト結果の保存中にエラーが発生しました:', e);
    }
    
    // コンソールにも出力
    if (result) {
        console.log(`✅ テスト成功: ${testName}`, details);
    } else {
        console.error(`❌ テスト失敗: ${testName}`, details);
    }
    
    return testResult;
}

// テスト結果をクリアする関数
function clearTestResults() {
    localStorage.removeItem('sf01_testResults');
    console.log('テスト結果をクリアしました');
}

// システム状態をチェックする関数
function checkSystemState() {
    // 現在のシステム状態を収集
    const currentState = {
        // スライド情報
        slide: {
            current: window.SlideshowCore?.state?.currentSlide || window.currentSlide,
            localStorage: localStorage.getItem('sf01_currentSlide'),
        },
        // 自動再生情報
        autoplay: {
            enabled: window.SlideshowCore?.state?.autoplayEnabled || window.autoplayMode,
            global: window.globalAutoplayState,
            localStorage: localStorage.getItem('sf01_autoplayState'),
            uiState: document.getElementById('autoplay-btn')?.classList.contains('active')
        },
        // 音声再生情報
        audio: {
            playing: window.SlideshowCore?.state?.audioPlaying || window.audioPlaying,
            source: localStorage.getItem('sf01_audioSource')
        },
        // 同期情報
        sync: {
            inProgress: window.syncInProgress || window.SyncModule?.inProgress,
            presenterConnected: localStorage.getItem('sf01_presenterConnected') === 'true'
        },
        // 時刻情報
        timestamp: Date.now(),
        formattedTime: new Date().toLocaleTimeString()
    };
    
    // 一貫性チェック
    const isConsistent = 
        // 自動再生状態の一貫性
        currentState.autoplay.enabled === (currentState.autoplay.localStorage === 'active') &&
        currentState.autoplay.enabled === currentState.autoplay.global &&
        currentState.autoplay.enabled === currentState.autoplay.uiState &&
        // スライド番号の一貫性
        currentState.slide.current === parseInt(currentState.slide.localStorage);
    
    currentState.isConsistent = isConsistent;
    
    return currentState;
}

// エクスポートする関数
window.TestUtils = {
    recordTestResult,
    clearTestResults,
    checkSystemState,
    
    // テスト結果をファイルとしてダウンロード
    downloadTestResults: function() {
        try {
            const storedResults = localStorage.getItem('sf01_testResults');
            if (!storedResults) {
                console.warn('ダウンロードするテスト結果がありません');
                return null;
            }
            
            const results = JSON.parse(storedResults);
            const resultsText = JSON.stringify(results, null, 2);
            
            // Blob形式でデータを作成
            const blob = new Blob([resultsText], { type: 'application/json' });
            
            // ダウンロードリンクを作成
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `test-results-${new Date().toISOString().slice(0, 10)}.json`;
            
            // リンクをクリックしてダウンロード
            document.body.appendChild(a);
            a.click();
            
            // クリーンアップ
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return results;
        } catch (e) {
            console.error('テスト結果のダウンロード中にエラーが発生しました:', e);
            return null;
        }
    },
    
    // すべてのテスト結果を取得
    getAllTestResults: function() {
        try {
            const storedResults = localStorage.getItem('sf01_testResults');
            return storedResults ? JSON.parse(storedResults) : [];
        } catch (e) {
            console.error('テスト結果の取得中にエラーが発生しました:', e);
            return [];
        }
    }
};

console.log('テスト結果管理システムを初期化しました');
