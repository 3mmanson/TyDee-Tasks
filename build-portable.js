const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST = path.join(__dirname, 'dist', 'TyDee-Tasks');
const ZIP_OUT = path.join(__dirname, 'dist', 'TyDee-Tasks.zip');

// Files/folders to include
const INCLUDE = [
  'src',
  'knexfile.js', // keep for dev
  'build-entry.js',
  'package.json',
  'package-lock.json',
  'frontend/dist',
  'README.md',
];

function rimraf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function mkdirp(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  console.log('Cleaning dist...');
  rimraf(DIST);

  console.log('Copying files...');
  for (const item of INCLUDE) {
    const src = path.join(__dirname, item);
    const dest = path.join(DIST, item);
    if (!fs.existsSync(src)) {
      console.log(`  Skipping ${item} (not found)`);
      continue;
    }
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      copyDir(src, dest);
    } else {
      mkdirp(path.dirname(dest));
      fs.copyFileSync(src, dest);
    }
  }

  // Install production deps in dist folder
  console.log('Installing production dependencies...');
  execSync('npm install --omit=dev', { cwd: DIST, stdio: 'inherit' });

  // Create Start.bat launcher
  const startBat = `@echo off
title TyDee Tasks
cd /d "%~dp0"

:: Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

:: First run setup
if not exist "data" (
    echo First run: setting up database...
    node build-entry.js --setup-only
)

:: Start server and open browser
echo Starting TyDee Tasks...
start "" "http://localhost:3000"
node build-entry.js
`;

  fs.writeFileSync(path.join(DIST, 'Start.bat'), startBat);

  // Create Stop.bat
  const stopBat = `@echo off
taskkill /F /IM node.exe /FI "WINDOWTITLE eq TyDee Tasks*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq node.exe" /FI "MODULES eq *build-entry*" >nul 2>&1
echo TyDee Tasks stopped.
`;
  fs.writeFileSync(path.join(DIST, 'Stop.bat'), stopBat);

  // Create README for the package
  const readme = `# TyDee Tasks - Portable Edition

## Quick Start
1. Double-click **Start.bat**
2. Browser opens automatically to http://localhost:3000
3. Register an account and start managing tasks!

## Requirements
- [Node.js](https://nodejs.org/) v18+ (must be in PATH)

## Files
- Start.bat    - Launch the app
- Stop.bat     - Stop the server
- data/        - Database and config (created on first run)
- src/         - Backend source code
- frontend/    - Built frontend

## Notes
- Your data is stored in data/tasks.db
- JWT secret is auto-generated in data/config.json
- To reset: delete the data/ folder and restart
`;

  fs.writeFileSync(path.join(DIST, 'README.txt'), readme);

  // Create zip
  console.log('Creating ZIP archive...');
  rimraf(ZIP_OUT + '.tmp');
  execSync(`powershell -Command "Compress-Archive -Path '${DIST}' -DestinationPath '${ZIP_OUT}' -Force"`, { stdio: 'inherit' });

  const zipSize = (fs.statSync(ZIP_OUT).size / 1024 / 1024).toFixed(1);
  console.log(`\nBuild complete!`);
  console.log(`Package: ${ZIP_OUT}`);
  console.log(`Size: ${zipSize} MB`);
}

build();
