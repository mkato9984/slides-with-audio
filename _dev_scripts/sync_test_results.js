/**
 * 同期テスト用スクリプト
 * このスクリプトはメインとプレゼンター画面の同期状態をテストし、結果を収集します
 */

(function() {
    // テスト結果オブジェクト
    const testResults = {
        testStartTime: new Date().toISOString(),
        syncTests: [],
        stateHistory: [],
        errors: []
    };
    
    // テスト結果をリセット
    function resetTestResults() {
        testResults.syncTests = [];
        testResults.stateHistory = [];
        testResults.errors = [];
        testResults.testStartTime = new Date().toISOString();
    }
    
    // 現在の状態を記録
    function recordCurrentState(label, isManualTest = false) {
        try {
            const state = {
                timestamp: new Date().toISOString(),
                label: label,
                isManualTest: isManualTest,
                core: window.SlideshowCore ? {
                    autoplayEnabled: window.SlideshowCore.state.autoplayEnabled,
                    currentSlide: window.SlideshowCore.state.currentSlide,
                    audioPlaying: window.SlideshowCore.state.audioPlaying
                } : null,
                global: {
                    autoplayMode: window.autoplayMode,
                    globalAutoplayState: window.globalAutoplayState,
                    currentSlide: window.currentSlide,
                    audioPlaying: window.audioPlaying
                },
                localStorage: {
                    autoplayState: localStorage.getItem('sf01_autoplayState'),
                    currentSlide: localStorage.getItem('sf01_currentSlide'),
                    audioSource: localStorage.getItem('sf01_audioSource')
                },
                ui: {
                    autoplayBtnActive: document.getElementById('autoplay-btn')?.classList.contains('active') || false,
                    audioBtnActive: document.getElementById('audio-btn')?.classList.contains('active') || false
                }
            };
            
            testResults.stateHistory.push(state);
            console.log(`[テスト] 状態記録: ${label}`, state);
            return state;
        } catch (error) {
            const errorInfo = {
                timestamp: new Date().toISOString(),
                message: error.message,
                stack: error.stack,
                label: label
            };
            testResults.errors.push(errorInfo);
            console.error('[テスト] 状態記録エラー:', errorInfo);
            return null;
        }
    }
    
    // 同期テストを実行
    function runSyncTest(testName, description) {
        const testId = 'test_' + Date.now();
        
        const testInfo = {
            id: testId,
            name: testName,
            description: description,
            startTime: new Date().toISOString(),
            initialState: recordCurrentState(`${testName} - 開始状態`),
            steps: []
        };
        
        testResults.syncTests.push(testInfo);
        console.log(`[テスト] "${testName}" を開始しました`);
        
        return {
            recordStep: function(stepName, detail = {}) {
                const stepState = recordCurrentState(`${testName} - ${stepName}`);
                testInfo.steps.push({
                    name: stepName,
                    timestamp: new Date().toISOString(),
                    state: stepState,
                    detail: detail
                });
                console.log(`[テスト] "${testName}" ステップ記録: ${stepName}`);
                return this;
            },
            
            complete: function(success, notes = '') {
                testInfo.endTime = new Date().toISOString();
                testInfo.finalState = recordCurrentState(`${testName} - 終了状態`);
                testInfo.success = success;
                testInfo.notes = notes;
                
                const duration = new Date(testInfo.endTime) - new Date(testInfo.startTime);
                console.log(`[テスト] "${testName}" を終了しました (${duration}ms) - ${success ? '成功' : '失敗'}`);
                
                if (notes) {
                    console.log(`[テスト] "${testName}" 備考: ${notes}`);
                }
                
                return testResults;
            }
        };
    }
    
    // テスト結果をエクスポート
    window.exportTestResults = function() {
        try {
            const result = JSON.stringify(testResults, null, 2);
            const blob = new Blob([result], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `sync_test_results_${new Date().toISOString().replace(/:/g, '-')}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('[テスト] テスト結果をエクスポートしました');
            return true;
        } catch (error) {
            console.error('[テスト] テスト結果のエクスポート中にエラーが発生しました:', error);
            return false;
        }
    };
    
    // グローバルに公開
    window.TestSync = {
        recordState: recordCurrentState,
        runTest: runSyncTest,
        getResults: () => testResults,
        reset: resetTestResults,
        export: window.exportTestResults
    };
    
    console.log('同期テストモジュールを初期化しました');
})();
