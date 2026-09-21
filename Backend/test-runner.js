require('dotenv').config();
const { spawn } = require('child_process');
const http = require('http');

const testScript = process.argv[2];
const port = Number(process.env.PORT || 5000);

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

function killProcessOnPort(targetPort) {
  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');
      const out = execSync(`netstat -ano | findstr :${targetPort}`).toString();
      const lines = out.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && line.includes('LISTENING')) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            pids.add(pid);
          }
        }
      }
      for (const pid of pids) {
        try { execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' }); } catch (e) {}
      }
    } catch (e) {}
  }
}

async function run() {
  killProcessOnPort(port);
  const server = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, SEED_DEMO_DATA: 'true' },
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
    if (testProcess && testProcess.pid) {
      try {
        if (process.platform === 'win32') {
          const { execSync } = require('child_process');
          execSync(`taskkill /F /T /PID ${testProcess.pid}`, { stdio: 'ignore' });
        } else {
          testProcess.kill();
        }
      } catch (e) {}
    }
    if (server && server.pid) {
      try {
        if (process.platform === 'win32') {
          const { execSync } = require('child_process');
          execSync(`taskkill /F /T /PID ${server.pid}`, { stdio: 'ignore' });
        } else {
          server.kill();
        }
      } catch (e) {}
    }
    killProcessOnPort(port);
  }
}

run();
