const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const cloudflaredBin = path.join(rootDir, 'cloudflared.exe');

console.log('====================================================');
console.log('   Starting Quantum Care Online Server & Tunnel     ');
console.log('====================================================\n');

// 1. Check if backend on port 5000 is already running
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5000/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  const isRunning = await checkServerRunning();
  if (!isRunning) {
    console.log('[1/2] Launching Backend Server on port 5000...');
    const serverProcess = spawn('node', ['Backend/server.js'], {
      cwd: rootDir,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production', SERVE_FRONTEND: 'true' }
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start backend server:', err.message);
    });

    // Wait 3 seconds for server to initialize
    await new Promise((r) => setTimeout(r, 3000));
  } else {
    console.log('[1/2] Backend Server is already running on port 5000.');
  }

  // 2. Launch Cloudflare Tunnel
  if (!fs.existsSync(cloudflaredBin)) {
    console.error(`Error: cloudflared.exe not found in ${rootDir}`);
    console.error('Download it or run npm run tunnel');
    process.exit(1);
  }

  console.log('[2/2] Launching Cloudflare Tunnel...');
  const tunnel = spawn(cloudflaredBin, ['tunnel', '--url', 'http://localhost:5000'], {
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
        '   QUANTUM CARE LIVE PUBLIC URL',
        '====================================================',
        '',
        `Public Link: ${liveUrl}`,
        '',
        `Patient Portal: ${liveUrl}/patient/login`,
        `Doctor Portal:  ${liveUrl}/doctor/login`,
        `Hospital Ops:   ${liveUrl}/hospital/dashboard`,
        '',
        `Generated: ${new Date().toLocaleString()}`,
        'Keep this window open to keep the server online.',
        '===================================================='
      ].join('\n');

      fs.writeFileSync(linkFilePath, fileContent, 'utf8');

      console.log('\n====================================================');
      console.log('   🎉 YOUR APP IS LIVE WORLDWIDE!');
      console.log('====================================================');
      console.log(`\n  👉 Public URL:    ${liveUrl}`);
      console.log(`  👉 Patient Login: ${liveUrl}/patient/login`);
      console.log(`  👉 Doctor Login:  ${liveUrl}/doctor/login`);
      console.log(`  👉 Saved to:      ${linkFilePath}\n`);
      console.log('Anyone can use this link on their phone or computer.');
      console.log('Keep this window open while you want the app online.\n');
    }
  };

  tunnel.stdout.on('data', handleLog);
  tunnel.stderr.on('data', handleLog);

  tunnel.on('close', (code) => {
    console.log(`\nCloudflare Tunnel closed (code: ${code})`);
  });

  process.on('SIGINT', () => {
    tunnel.kill();
    process.exit();
  });
}

main().catch(console.error);
