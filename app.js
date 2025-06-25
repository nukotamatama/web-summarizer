// -----------------------------------------
// CONFIGURATION
// -----------------------------------------
const CONFIG = {
    MAX_CHARACTERS: 100,
    // APIエンドポイント
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `http://${window.location.hostname}:3000/api` 
        : '/api'
};

// バックエンドプロキシを使用するため、外部CORSプロキシは不要になりました

// -----------------------------------------
// DOM ELEMENTS
// -----------------------------------------
const elements = {
    // Debug
    debugLogContainer: document.getElementById('debug-log-container'),
    debugLog: document.getElementById('debug-log'),
    // Tabs
    tabText: document.getElementById('tab-text'),
    tabUrl: document.getElementById('tab-url'),
    textInputSection: document.getElementById('text-input-section'),
    urlInputSection: document.getElementById('url-input-section'),
    // Inputs
    inputText: document.getElementById('inputText'),
    inputUrl: document.getElementById('inputUrl'),
    // Buttons
    summarizeBtn: document.getElementById('summarizeBtn'),
    fetchContentBtn: document.getElementById('fetchContentBtn'),
    clearBtn: document.getElementById('clearBtn'),
    // Outputs
    resultContainer: document.getElementById('result-container'),
    summary: document.getElementById('summary'),
    charCount: document.getElementById('charCount'),
    status: document.getElementById('status'),
    urlStatus: document.getElementById('urlStatus'),
};

// -----------------------------------------
// DEBUG LOGGING
// -----------------------------------------
function clearLogs() {
    if (elements.debugLog) {
        elements.debugLog.textContent = '';
        elements.debugLogContainer.classList.add('hidden');
    }
}

function log(_) {
    // デバッグログを画面に表示しないよう機能を無効化
}

// -----------------------------------------
// UI & STATUS FUNCTIONS
// -----------------------------------------
function showStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.className = 'text-right ' + (isError ? 'text-red-600' : 'text-green-600');
}

function showUrlStatus(message, isError = false) {
    elements.urlStatus.textContent = message;
    elements.urlStatus.className = 'mt-2 text-sm ' + (isError ? 'text-red-600' : 'text-green-600');
    elements.urlStatus.classList.remove('hidden');
    if (!isError) {
        setTimeout(() => elements.urlStatus.classList.add('hidden'), 5000);
    }
}

function updateCharCount() {
    const text = elements.summary.textContent || '';
    elements.charCount.textContent = `${text.length}文字`;
    elements.charCount.classList.toggle('text-red-600', text.length > CONFIG.MAX_CHARACTERS);
}

function switchTab(tab) {
    const isTextTab = tab === 'text';
    elements.tabText.classList.toggle('text-blue-600', isTextTab);
    elements.tabText.classList.toggle('border-blue-600', isTextTab);
    elements.tabText.classList.toggle('text-gray-500', !isTextTab);
    elements.tabText.classList.toggle('border-transparent', !isTextTab);
    elements.textInputSection.classList.toggle('hidden', !isTextTab);

    elements.tabUrl.classList.toggle('text-blue-600', !isTextTab);
    elements.tabUrl.classList.toggle('border-blue-600', !isTextTab);
    elements.tabUrl.classList.toggle('text-gray-500', isTextTab);
    elements.tabUrl.classList.toggle('border-transparent', isTextTab);
    elements.urlInputSection.classList.toggle('hidden', isTextTab);
    log(`タブを「${isTextTab ? 'テキスト入力' : 'URL入力'}」に切り替えました。`);
}

function clearAll() {
    elements.inputText.value = '';
    elements.inputUrl.value = '';
    elements.resultContainer.classList.add('hidden');
    elements.summary.textContent = '';
    elements.charCount.textContent = '0文字';
    elements.urlStatus.classList.add('hidden');
    showStatus('', false);
    clearLogs();
    log('入力と結果をクリアしました。');
}

// -----------------------------------------
// CORE LOGIC
// -----------------------------------------
async function generateSummary(text) {
    log('generateSummary関数を開始します。');

    if (!text.trim()) {
        throw new Error('要約するテキストが空です。');
    }
    log('テキストの存在を確認しました。');

    try {
        log('バックエンドAPIへのリクエストを送信します...');
        const response = await fetch(`${CONFIG.API_URL}/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        log(`APIからレスポンスを受信しました。ステータス: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            log(`APIエラー: ${errorData.error || '不明なエラー'}`);
            throw new Error(errorData.error || `APIエラー: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        log('APIレスポンスをJSONとして解析しました。');
        
        if (!responseData.summary) {
            throw new Error('APIからの応答に要約がありません。');
        }
        
        const summaryText = responseData.summary;
        log(`要約テキストを受信しました (${summaryText.length}文字): ${summaryText}`);
        return summaryText;
    } catch (error) {
        log(`APIエラー: ${error.toString()}`);
        console.error('API Error:', error);
        throw new Error('APIリクエストに失敗しました。詳細はコンソールを確認してください。');
    }
}

async function fetchUrlContent() {
    const url = elements.inputUrl.value.trim();
    if (!url) {
        showUrlStatus('URLを入力してください', true);
        return;
    }
    
    if (!url.match(/^https?:\/\/.+/)) {
        showUrlStatus('有効なURLを入力してください', true);
        return;
    }
    
    clearLogs();
    log(`URL「${url}」からコンテンツを取得します。`);
    
    elements.fetchContentBtn.disabled = true;
    elements.fetchContentBtn.classList.add('opacity-70', 'cursor-not-allowed');
    showUrlStatus('コンテンツを取得中...', false);
    
    try {
        // バックエンドAPIを使用してURLコンテンツを取得
        log('バックエンドAPIを使用してURLコンテンツを取得します...');
        const response = await fetch(`${CONFIG.API_URL}/fetch-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `エラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.content) {
            throw new Error('取得したコンテンツが空です');
        }
        
        log('URLコンテンツを取得しました。コンテンツを処理します...');
        
        // HTMLコンテンツをパースしてテキストを抽出
        const doc = new DOMParser().parseFromString(data.content, 'text/html');
        doc.querySelectorAll('script, style, link, noscript, svg, header, footer, nav, aside').forEach(el => el.remove());
        const textContent = (doc.body.textContent || '').replace(/\s\s+/g, ' ').trim();
        
        if (textContent.length < 50) {
            throw new Error('抽出されたコンテンツが短すぎます');
        }
        
        log(`コンテンツの抽出に成功しました。文字数: ${textContent.length}`);
        elements.inputText.value = textContent;
        switchTab('text');
        showUrlStatus('コンテンツを取得しました！', false);
        
    } catch (error) {
        log(`エラー: ${error.message}`);
        console.error('URL取得エラー:', error);
        showUrlStatus(`コンテンツの取得に失敗しました: ${error.message}`, true);
        setTimeout(() => showUrlStatus('ヒント: 手動でテキストをコピー＆ペーストしてください', false), 3000);
    } finally {
        elements.fetchContentBtn.disabled = false;
        elements.fetchContentBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
}

// -----------------------------------------
// EVENT HANDLERS
// -----------------------------------------
async function handleSummarize() {
    clearLogs();
    log('「要約する」ボタンがクリックされました。');

    const text = elements.inputText.value.trim();
    if (!text) {
        log('エラー: 要約するテキストがありません。');
        showStatus('要約するテキストを入力してください', true);
        return;
    }
    log(`入力テキストを取得しました。文字数: ${text.length}`);

    elements.summarizeBtn.disabled = true;
    elements.summarizeBtn.classList.add('opacity-70', 'cursor-not-allowed');
    showStatus('要約を生成中...', false);

    try {
        const summary = await generateSummary(text);
        elements.summary.textContent = summary;
        updateCharCount();
        elements.resultContainer.classList.remove('hidden');
        showStatus('要約が完了しました', false);
        log('要約結果を表示しました。');

    } catch (error) {
        log(`エラーが発生しました: ${error.message}`);
        showStatus(`エラー: ${error.message}`, true);
    } finally {
        elements.summarizeBtn.disabled = false;
        elements.summarizeBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        log('プロセスが完了しました。');
    }
}

function setupEventListeners() {
    elements.tabText.addEventListener('click', () => switchTab('text'));
    elements.tabUrl.addEventListener('click', () => switchTab('url'));
    elements.summarizeBtn.addEventListener('click', handleSummarize);
    elements.fetchContentBtn.addEventListener('click', fetchUrlContent);
    elements.clearBtn.addEventListener('click', clearAll);

    elements.inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSummarize();
        }
    });
    elements.inputUrl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchUrlContent();
        }
    });
    log('イベントリスナーを設定しました。');
}

// -----------------------------------------
// INITIALIZATION
// -----------------------------------------
function init() {
    clearLogs();
    log('アプリケーションを初期化します。');
    setupEventListeners();
    log('アプリケーションの準備ができました。');
}

document.addEventListener('DOMContentLoaded', init);
