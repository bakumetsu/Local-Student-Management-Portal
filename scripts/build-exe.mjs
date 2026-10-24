#!/usr/bin/env node
// scripts/build-exe.mjs
// Đóng gói toàn bộ dự án (frontend + backend + dependencies) thành MỘT file thực thi
// chạy độc lập, không cần cài Node.js trên máy đích.
//
// Các bước:
//   1. Cài dependencies (nếu thiếu) cho frontend/backend
//   2. Build frontend bằng Vite  → frontend/dist
//   3. Bundle backend bằng esbuild → build/sea/server.cjs (một file CommonJS duy nhất)
//   4. Tạo SEA blob (Node Single Executable Applications) kèm frontend dưới dạng asset nhúng
//   5. Sao chép binary node hiện tại và tiêm blob vào bằng postject
//
// Dùng: npm run build:exe [-- --skip-install] [-- --out=release]
// Kết quả: release/student-portal-<platform>-<arch>[.exe]

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const outArg = process.argv.find((a) => a.startsWith('--out='))
const OUT_DIR = path.resolve(ROOT, outArg ? outArg.slice('--out='.length) : 'release')
const BUILD_DIR = path.join(ROOT, 'build', 'sea')
const FRONTEND = path.join(ROOT, 'frontend')
const BACKEND = path.join(ROOT, 'backend')
const isWindows = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const exeName = `student-portal-${process.platform}-${process.arch}${isWindows ? '.exe' : ''}`
const SEA_FUSE = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'

const log = (msg) => console.log(`\x1b[36m▶\x1b[0m ${msg}`)
const fail = (msg) => {
  console.error(`\x1b[31m✖ ${msg}\x1b[0m`)
  process.exit(1)
}

function run(cmd, cmdArgs, cwd = ROOT) {
  // npm trên Windows là npm.cmd → cần shell để chạy được.
  const result = spawnSync(cmd, cmdArgs, { cwd, stdio: 'inherit', shell: isWindows })
  if (result.status !== 0) fail(`Lệnh thất bại: ${cmd} ${cmdArgs.join(' ')}`)
}

// ---- 0. Kiểm tra môi trường ----
const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 13)) {
  fail(`Cần Node.js >= 22.13 (đang dùng ${process.versions.node}) để có node:sqlite và Single Executable Applications.`)
}
log(`Node ${process.versions.node} (${process.platform}-${process.arch})`)

// ---- 1. Dependencies ----
if (!args.has('--skip-install')) {
  for (const dir of [ROOT, FRONTEND, BACKEND]) {
    if (!fs.existsSync(path.join(dir, 'node_modules'))) {
      log(`Cài dependencies: ${path.relative(ROOT, dir) || '.'}`)
      run('npm', ['install', '--no-audit', '--no-fund'], dir)
    }
  }
}

const { build } = await import('esbuild').catch(() => fail('Thiếu esbuild. Chạy "npm install" ở thư mục gốc.'))
const postject = await import('postject').catch(() => fail('Thiếu postject. Chạy "npm install" ở thư mục gốc.'))
// postject là module CommonJS: hàm inject có thể nằm ở named export hoặc default export.
const inject = postject.inject ?? postject.default?.inject

// ---- 2. Build frontend ----
log('Build frontend (Vite)...')
run('npm', ['run', 'build'], FRONTEND)
const webDist = path.join(FRONTEND, 'dist')
if (!fs.existsSync(path.join(webDist, 'index.html'))) fail('Không tìm thấy frontend/dist/index.html sau khi build.')

// ---- 3. Bundle backend ----
fs.rmSync(BUILD_DIR, { recursive: true, force: true })
fs.mkdirSync(BUILD_DIR, { recursive: true })
const bundlePath = path.join(BUILD_DIR, 'server.cjs')

log('Bundle backend (esbuild)...')
const result = await build({
  entryPoints: [path.join(BACKEND, 'server', 'index.js')],
  outfile: bundlePath,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: `node${major}`,
  minify: true,
  keepNames: true,
  legalComments: 'none',
  logLevel: 'warning',
  // main.js dùng import.meta.url chỉ khi không có __dirname (ESM); trong bundle CJS luôn có __dirname.
  logOverride: { 'empty-import-meta': 'silent' }
})
if (result.errors.length) fail('esbuild gặp lỗi.')

// ---- 4. SEA config + blob ----
const files = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else files.push(path.relative(webDist, full).split(path.sep).join('/'))
  }
}
walk(webDist)

const manifestPath = path.join(BUILD_DIR, 'web-manifest.json')
fs.writeFileSync(manifestPath, JSON.stringify(files))
const assets = { 'web-manifest.json': manifestPath }
for (const rel of files) assets[`web/${rel}`] = path.join(webDist, rel)

const blobPath = path.join(BUILD_DIR, 'sea-prep.blob')
const seaConfigPath = path.join(BUILD_DIR, 'sea-config.json')
fs.writeFileSync(seaConfigPath, JSON.stringify({
  main: bundlePath,
  output: blobPath,
  disableExperimentalSEAWarning: true,
  useSnapshot: false,
  useCodeCache: false,
  assets
}, null, 2))

log(`Tạo SEA blob (${files.length} file frontend nhúng)...`)
execFileSync(process.execPath, ['--experimental-sea-config', seaConfigPath], { stdio: 'inherit', cwd: BUILD_DIR })

// ---- 5. Tạo file thực thi ----
fs.mkdirSync(OUT_DIR, { recursive: true })
const exePath = path.join(OUT_DIR, exeName)
fs.rmSync(exePath, { force: true })
fs.copyFileSync(process.execPath, exePath)
if (!isWindows) fs.chmodSync(exePath, 0o755)

// Gỡ chữ ký số của node gốc (nếu có công cụ) vì chữ ký sẽ không còn hợp lệ sau khi tiêm blob.
if (isMac) {
  spawnSync('codesign', ['--remove-signature', exePath], { stdio: 'inherit' })
} else if (isWindows) {
  const signtool = spawnSync('signtool', ['remove', '/s', exePath], { stdio: 'ignore', shell: true })
  if (signtool.status !== 0) console.log('  (bỏ qua: không có signtool, file .exe sẽ không có chữ ký số — vẫn chạy bình thường)')
}

log('Tiêm blob vào binary (postject)...')
await inject(exePath, 'NODE_SEA_BLOB', fs.readFileSync(blobPath), {
  sentinelFuse: SEA_FUSE,
  machoSegmentName: isMac ? 'NODE_SEA' : undefined,
  overwrite: true
})

if (isMac) spawnSync('codesign', ['--sign', '-', exePath], { stdio: 'inherit' })

const sizeMb = (fs.statSync(exePath).size / 1024 / 1024).toFixed(1)
console.log(`\n\x1b[32m✔ Hoàn tất:\x1b[0m ${path.relative(ROOT, exePath)} (${sizeMb} MB)`)
console.log('  Chạy file này để khởi động portal tại http://localhost:8080')
console.log('  Dữ liệu (database, file upload, log) lưu ở thư mục "data" cạnh file thực thi.')
console.log('  Cấu hình: biến môi trường hoặc file .env cạnh file thực thi (xem README).')
