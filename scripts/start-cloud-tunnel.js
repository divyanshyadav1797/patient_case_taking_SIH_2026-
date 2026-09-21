const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const frontendDist = path.join(rootDir, 'Frontend', 'dist');
const frontendIndexHtml = path.join(frontendDist, 'index.html');
const cloudflaredBin = path.join(rootDir, 'cloudflared.exe');
const isWindows = process.platform === 'win32';

console.log('====================================================');
console.log('   Starting Quantum Care Online Server & Tunnel     ');
console.log('====================================================\n');

// ── 0. Terminate Orphaned cloudflared Instances ──
function cleanupOrphanedTunnels() {
  try {
    if (isWindows) {
      execSync('taskkill /F /IM cloudflared.exe /T 2>nul', { stdio: 'ignore' });
    } else {
      execSync('pkill -f cloudflared 2>/dev/null', { stdio: 'ignore' });
    }
  } catch {
    // Ignore if not running
  }
}

// ── 1. Ensure Frontend Production Assets are Built ──
function ensureFrontendBuilt() {
  const needsBuild = !fs.existsSync(frontendIndexHtml);
  if (needsBuild) {
    console.log('[Build] Frontend build not detected. Compiling React production SPA...');
  } else {
    console.log('[Build] Verified Frontend production build at Frontend/dist');
    return;
  }

  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  try {
    console.log(`[Build] Running ${npmCmd} --prefix Frontend run build...`);
    execSync(`${npmCmd} --prefix Frontend run build`, {
      cwd: rootDir,
      stdio: 'inherit'
    });
    console.log('[Build] Frontend production build completed successfully.\n');
  } catch (err) {
    console.error('[Build Error] Failed to build frontend:', err.message);
    console.warn('[Build Warning] Will attempt to serve available files.');
  }
}

// ── 2. Check if Server on Port 5000 is Running and Healthy ──
function checkServerState() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5000/health', (res) => {
      if (res.statusCode !== 200) return resolve({ running: true, servingFrontend: false });
      
      // Also verify root serves HTML
      http.get('http://127.0.0.1:5000/', (rootRes) => {
        const contentType = rootRes.headers['content-type'] || '';
        const isHtml = contentType.includes('text/html');
        resolve({ running: true, servingFrontend: isHtml });
      }).on('error', () => {
        resolve({ running: true, servingFrontend: false });
      });
    });

    req.on('error', () => resolve({ running: false, servingFrontend: false }));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve({ running: false, servingFrontend: false });
    });
  });
}

// ── 3. Kill Stale Process on Port 5000 if not Serving Frontend ──
function killProcessOnPort5000() {
  try {
    if (isWindows) {
      const output = execSync('netstat -ano | findstr :5000', { encoding: 'utf8' });
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(':5000') && parts[3] === 'LISTENING') {
          const pid = parts[4];
          if (pid && pid !== '0') {
            console.log(`[Process] Terminating stale process on port 5000 (PID: ${pid})...`);
            execSync(`taskkill /F /PID ${pid} 2>nul`, { stdio: 'ignore' });
          }
        }
      }
    }
  } catch {
    // Port was likely already free
  }
}

// ── 4. Main Deployment & Tunnel Orchestration ──
async function main() {
  cleanupOrphanedTunnels();
  ensureFrontendBuilt();

  let state = await checkServerState();
  let serverProcess = null;

  if (state.running && !state.servingFrontend) {
    console.log('[1/2] Port 5000 is occupied by a server that is NOT serving Frontend. Restarting unified server...');
    killProcessOnPort5000();
    await new Promise((r) => setTimeout(r, 1500));
    state = await checkServerState();
  }

  if (!state.running) {
    console.log('[1/2] Launching Quantum Care Unified Server (Express + React SPA) on port 5000...');
    serverProcess = spawn('node', ['Backend/server.js'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        SERVE_FRONTEND: 'true',
        CORS_ORIGIN: '*',
        PORT: '5000'
      }
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start backend server:', err.message);
    });

    // Wait up to 15 seconds for server to become healthy
    let ready = false;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const cur = await checkServerState();
      if (cur.running && cur.servingFrontend) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      console.warn('[Warning] Backend server is taking longer than expected to initialize. Proceeding with tunnel...');
    } else {
      console.log('[1/2] Backend Server is ready and serving Frontend SPA on port 5000.');
    }
  } else {
    console.log('[1/2] Backend Server is already running and serving Frontend SPA on port 5000.');
  }

  // ── 5. Launch Cloudflare Tunnel ──
  if (!fs.existsSync(cloudflaredBin)) {
    console.error(`\n[Error] cloudflared.exe not found in: ${rootDir}`);
    console.error('Please ensure cloudflared.exe exists in the project root directory.');
    process.exit(1);
  }

  console.log('[2/2] Launching Cloudflare Tunnel (proxying to http://127.0.0.1:5000)...');
  const tunnel = spawn(cloudflaredBin, ['tunnel', '--url', 'http://127.0.0.1:5000'], {
    cwd: rootDir
  });

  let urlFound = false;

  const handleLog = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !urlFound) {
      urlFound = true;
      const liveUrl = match[0];
      const linkFilePath = path.join(rootDir, 'LIVE_LINK.txt');

      const fileContent = [
        '====================================================',
        '   QUANTUM CARE - LIVE WORLDWIDE PUBLIC URL',
        '====================================================',
        '',
        `Main Web App:    ${liveUrl}`,
        '',
        '--- DIRECT ACCESS PORTALS ---',
        `Patient Portal:  ${liveUrl}/login?role=patient`,
        `Doctor Portal:   ${liveUrl}/login?role=doctor`,
        `Hospital Portal: ${liveUrl}/login?role=hospital`,
        `OPD Kiosk:       ${liveUrl}/kiosk`,
        '',
        '--- DIRECT DASHBOARDS (When Signed In) ---',
        `Patient Home:    ${liveUrl}/patient/dashboard`,
        `Doctor Clinic:   ${liveUrl}/doctor/dashboard`,
        `Hospital Ops:    ${liveUrl}/hospital/dashboard`,
        '',
        '--- SYSTEM HEALTH ---',
        `API Status:      ${liveUrl}/health`,
        '',
        `Generated:       ${new Date().toLocaleString()}`,
        'Keep this terminal window open to keep the server live.',
        '===================================================='
      ].join('\n');

      fs.writeFileSync(linkFilePath, fileContent, 'utf8');

      console.log('\n====================================================');
      console.log('   🎉 YOUR HEALTHCARE PLATFORM IS LIVE WORLDWIDE!');
      console.log('====================================================');
      console.log(`\n  👉 Main Public URL:   ${liveUrl}`);
      console.log(`  👉 Patient Login:     ${liveUrl}/login?role=patient`);
      console.log(`  👉 Doctor Login:      ${liveUrl}/login?role=doctor`);
      console.log(`  👉 Hospital Admin:    ${liveUrl}/login?role=hospital`);
      console.log(`  👉 Kiosk Terminal:    ${liveUrl}/kiosk`);
      console.log(`  👉 Links Saved To:    ${linkFilePath}\n`);
      console.log('Share this link with anyone - works directly on mobile phones & laptops.');
      console.log('Keep this window OPEN to keep the server online.\n');

      // Attempt to automatically launch the browser to the live URL on Windows
      if (isWindows) {
        try {
          execSync(`start "" "${liveUrl}"`, { stdio: 'ignore' });
        } catch {
          // Non-critical if auto-open fails
        }
      }
    }
  };

  tunnel.stdout.on('data', handleLog);
  tunnel.stderr.on('data', handleLog);

  tunnel.on('close', (code) => {
    console.log(`\nCloudflare Tunnel closed (code: ${code})`);
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  const cleanup = () => {
    console.log('\nShutting down tunnel and server...');
    tunnel.kill();
    if (serverProcess) {
      serverProcess.kill();
    }
    cleanupOrphanedTunnels();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error('Fatal error starting cloud tunnel:', err);
});
