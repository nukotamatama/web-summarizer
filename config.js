// Web Summarizer Configuration

// APIエンドポイントの設定
// 開発環境ではローカルサーバー、本番環境では相対パスを使用
window.API_CONFIG = {
    // APIのベースURL
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://${window.location.hostname}:3000/api`
        : '/api',
    
    // レート制限の情報
    rateLimit: {
        requestsPerWindow: 10,
        windowMinutes: 15
    }
};

// バージョン情報
window.APP_VERSION = '1.1.0';

// アプリケーション情報をコンソールに表示
document.addEventListener('DOMContentLoaded', () => {
    console.log(`Web Summarizer v${window.APP_VERSION} initialized`);
    console.log(`API endpoint: ${window.API_CONFIG.baseUrl}`);
    
    // 使用情報セクションを追加
    createUsageInfoSection();
});

// 使用情報セクションを作成
function createUsageInfoSection() {
    const mainElement = document.querySelector('main');
    if (!mainElement) return;
    
    // 使用情報セクションを作成
    const usageSection = document.createElement('div');
    usageSection.className = 'mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200';
    usageSection.innerHTML = `
        <h3 class="text-lg font-semibold text-gray-800 mb-2">使用情報</h3>
        <p class="text-sm text-gray-600 mb-2">このアプリケーションはレート制限があります：${window.API_CONFIG.rateLimit.windowMinutes}分間に${window.API_CONFIG.rateLimit.requestsPerWindow}リクエストまで</p>
        <p class="text-sm text-gray-600">バージョン: v${window.APP_VERSION}</p>
    `;
    
    // フッターの前に挿入
    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(usageSection, footer);
    } else {
        mainElement.appendChild(usageSection);
    }
}