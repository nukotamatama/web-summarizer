module.exports = {
  // テスト環境
  testEnvironment: 'node',
  
  // テストファイルのパターン
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // カバレッジ設定
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/'
  ],
  
  // モジュールの変換設定
  transform: {},
  
  // テストのタイムアウト設定
  testTimeout: 10000,
  
  // テスト実行時のグローバル設定
  globals: {
    'NODE_ENV': 'test'
  },
  
  // テスト実行前の設定
  setupFiles: [],
  
  // テスト実行後の設定
  teardown: [],
  
  // テスト実行時の詳細表示
  verbose: true
};
