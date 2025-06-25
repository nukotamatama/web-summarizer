/**
 * Web Summarizerバックエンドのシンプルなテスト
 */

// テスト用のユーティリティ関数
function describe(name, fn) {
  console.log(`\n\n--- ${name} ---`);
  fn();
}

function it(name, fn) {
  console.log(`\n  Test: ${name}`);
  const result = { name, passed: false, error: null };
  
  try {
    fn();
    console.log('  ✓ PASSED');
    result.passed = true;
  } catch (err) {
    console.log(`  ✗ FAILED: ${err.message}`);
    console.error(err);
    result.error = err.message;
  }
  
  testResults.push(result);
}

// テスト結果を保存する配列
const testResults = [];

// テストを実行
console.log('\n==== Running Simple Backend Tests ====\n');
console.log('This should appear in the console output');

describe('Environment Variables', () => {
  it('should check for required environment variables', () => {
    // 必要な環境変数のリスト
    const requiredEnvVars = [
      'GEMINI_API_KEY',
      'PORT',
      'NODE_ENV',
      'ALLOWED_ORIGIN'
    ];
    
    // .env.exampleファイルの存在を確認
    const fs = require('fs');
    const path = require('path');
    
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    const envExampleExists = fs.existsSync(envExamplePath);
    
    console.log(`  .env.example exists: ${envExampleExists ? '✓' : '✗'}`);
    
    if (envExampleExists) {
      const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      
      // 各必要環境変数が.env.exampleに含まれているか確認
      for (const envVar of requiredEnvVars) {
        const included = envExampleContent.includes(envVar);
        console.log(`  ${envVar} in .env.example: ${included ? '✓' : '✗'}`);
        
        if (!included) {
          throw new Error(`${envVar} is not included in .env.example`);
        }
      }
    } else {
      throw new Error('.env.example file does not exist');
    }
  });
});

describe('Server Configuration', () => {
  it('should check server.js exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const serverJsPath = path.join(__dirname, '..', 'server.js');
    const serverJsExists = fs.existsSync(serverJsPath);
    
    console.log(`  server.js exists: ${serverJsExists ? '✓' : '✗'}`);
    
    if (!serverJsExists) {
      throw new Error('server.js file does not exist');
    }
    
    // server.jsの内容を確認
    const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
    
    // 必要なコンポーネントが含まれているか確認
    const requiredComponents = [
      'express',
      'cors',
      'rateLimit',
      'GEMINI_API_KEY',
      '/api/summarize',
      '/api/fetch-url'
    ];
    
    for (const component of requiredComponents) {
      const included = serverJsContent.includes(component);
      console.log(`  ${component} in server.js: ${included ? '✓' : '✗'}`);
      
      if (!included) {
        throw new Error(`${component} is not included in server.js`);
      }
    }
  });
});

describe('Frontend Configuration', () => {
  it('should check app.js and config.js exist', () => {
    const fs = require('fs');
    const path = require('path');
    
    const appJsPath = path.join(__dirname, '..', 'app.js');
    const configJsPath = path.join(__dirname, '..', 'config.js');
    
    const appJsExists = fs.existsSync(appJsPath);
    const configJsExists = fs.existsSync(configJsPath);
    
    console.log(`  app.js exists: ${appJsExists ? '✓' : '✗'}`);
    console.log(`  config.js exists: ${configJsExists ? '✓' : '✗'}`);
    
    if (!appJsExists) {
      throw new Error('app.js file does not exist');
    }
    
    if (!configJsExists) {
      throw new Error('config.js file does not exist');
    }
    
    // app.jsの内容を確認
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const configJsContent = fs.readFileSync(configJsPath, 'utf8');
    
    // APIキーがクライアント側に含まれていないことを確認
    const noApiKeyInClient = !appJsContent.includes('GEMINI_API_KEY') && !configJsContent.includes('GEMINI_API_KEY');
    console.log(`  No API key in client code: ${noApiKeyInClient ? '✓' : '✗'}`);
    
    if (!noApiKeyInClient) {
      throw new Error('API key is still referenced in client-side code');
    }
    
    // バックエンドAPIを呼び出していることを確認
    // 特定のパターンでチェックする
    const summarizePattern = /fetch\s*\(\s*`\$\{CONFIG\.API_URL\}\/summarize`/;
    const fetchUrlPattern = /fetch\s*\(\s*`\$\{CONFIG\.API_URL\}\/fetch-url`/;
    
    const callsSummarizeApi = summarizePattern.test(appJsContent);
    const callsFetchUrlApi = fetchUrlPattern.test(appJsContent);
    
    console.log(`  Calls /api/summarize endpoint: ${callsSummarizeApi ? '✓' : '✗'}`);
    console.log(`  Calls /api/fetch-url endpoint: ${callsFetchUrlApi ? '✓' : '✗'}`);
    
    const callsBackendApi = callsSummarizeApi && callsFetchUrlApi;
    console.log(`  Calls both backend APIs: ${callsBackendApi ? '✓' : '✗'}`);
    
    if (!callsBackendApi) {
      throw new Error('Frontend does not call backend API endpoints correctly');
    }
  });
});

console.log('\n==== Tests Complete ====\n');

// テスト結果のサマリーを表示
console.log('\n==== Test Summary ====\n');
console.log(`Total tests: ${testResults.length}`);
const passedTests = testResults.filter(r => r.passed).length;
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${testResults.length - passedTests}`);
console.log('\n==== End of Tests ====\n');

// 結果をファイルに書き込み
const fs = require('fs');
const path = require('path');
const resultPath = path.join(__dirname, 'test-results.txt');

fs.writeFileSync(resultPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  totalTests: testResults.length,
  passedTests,
  failedTests: testResults.length - passedTests,
  results: testResults
}, null, 2));

console.log(`Test results written to ${resultPath}`);
