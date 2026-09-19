const { spawn } = require('child_process');
const http = require('http');

const testScript = process.argv[2];
const port = Number(process.env.PORT || 3000);

if (!testScript) {
  console.error('Usage: node test-runner.js <test-script>');
  process.exit(1);
}

function waitForServer(timeoutMs = 10000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    function check() {
      const request = http.get(`http://127.0.0.1:${port}/health`, (response) => {
        response.resume();
        if (response.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });

      request.on('error', retry);
      request.setTimeout(1000, () => {
        request.destroy();
        retry();
      });
    }

    function retry() {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Server did not become ready on port ${port}`));
        return;
      }
      setTimeout(check, 200);
    }

    check();
  });
}

async function run() {
  const server = spawn(process.execPath, ['server.js'], {
    env: process.env,
    stdio: 'inherit'
  });

  let testProcess;
  try {
    await waitForServer();
    testProcess = spawn(process.execPath, [testScript], {
      env: process.env,
      stdio: 'inherit'
    });

    const exitCode = await new Promise((resolve, reject) => {
      testProcess.on('error', reject);
      testProcess.on('exit', (code, signal) => {
        resolve(code ?? (signal ? 1 : 0));
      });
    });

    process.exitCode = exitCode;
  } catch (error) {
    console.error(`Test runner error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (testProcess && !testProcess.killed) {
      testProcess.kill();
    }
    if (!server.killed) {
      server.kill();
    }
  }
}

run();
