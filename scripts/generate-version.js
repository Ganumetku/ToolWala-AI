const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    // Return custom env variable if present, or N/A
    return process.env.GIT_COMMIT_HASH || 'N/A';
  }
}

function main() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const versionJsonDir = path.join(__dirname, '../src/data');
  const versionJsonPath = path.join(versionJsonDir, 'version.json');

  // Load package.json version
  let version = '0.1.0';
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version || '0.1.0';
  } catch (err) {
    console.warn('[Version Gen] Could not read package.json version:', err.message);
  }

  const commit = getGitCommit();
  const deployedAt = new Date().toISOString();

  const versionData = {
    version,
    commit,
    deployedAt
  };

  // Ensure output directory exists
  if (!fs.existsSync(versionJsonDir)) {
    fs.mkdirSync(versionJsonDir, { recursive: true });
  }

  // Sync pdfjs worker to public directory
  try {
    const workerSrc = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
    const workerDestDir = path.join(__dirname, '../public');
    const workerDest = path.join(workerDestDir, 'pdf.worker.min.mjs');
    if (fs.existsSync(workerSrc)) {
      if (!fs.existsSync(workerDestDir)) {
        fs.mkdirSync(workerDestDir, { recursive: true });
      }
      fs.copyFileSync(workerSrc, workerDest);
      console.log('[Version Gen] Synced pdf.worker.min.mjs to public folder');
    }
  } catch (err) {
    console.warn('[Version Gen] Warning: Could not sync pdf worker to public folder:', err.message);
  }

  // Write file
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2), 'utf8');
  console.log(`[Version Gen] Generated version metadata: v${version} (${commit}) at ${deployedAt}`);
}

main();
