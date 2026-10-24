// common/db.js
// Lớp lưu trữ dùng SQLite tích hợp sẵn của Node (node:sqlite) thay cho DynamoDB.
// Mỗi "bảng" nghiệp vụ lưu item dưới dạng JSON (id TEXT PRIMARY KEY, data TEXT),
// giữ nguyên mô hình document linh hoạt như DynamoDB nhưng không cần dịch vụ ngoài.
import { DatabaseSync } from 'node:sqlite'
import config from './config.js'

const db = new DatabaseSync(config.dbFile)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA busy_timeout = 5000')
db.exec('PRAGMA foreign_keys = ON')

export const TABLE = {
  STUDENTS: 'students',
  DOCUMENTS: 'documents',
  TEACHERS: 'teachers',
  GRADES: 'grades',
  MATERIALS: 'materials',
  CLASSES: 'classes'
}

for (const name of Object.values(TABLE)) {
  db.exec(`CREATE TABLE IF NOT EXISTS ${name} (id TEXT PRIMARY KEY, data TEXT NOT NULL)`)
}

// Bảng hệ thống: tài khoản đăng nhập, hàng đợi job, mã đặt lại mật khẩu.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    token_version INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    run_at INTEGER NOT NULL,
    last_error TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_jobs_pending ON jobs (status, run_at);
  CREATE TABLE IF NOT EXISTS reset_codes (
    username TEXT PRIMARY KEY REFERENCES users(username) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0
  );
`)

const parse = (row) => (row ? JSON.parse(row.data) : null)

// Repository đơn giản cho một bảng document.
export function table(name) {
  if (!Object.values(TABLE).includes(name)) throw new Error(`Bảng không hợp lệ: ${name}`)
  const getStmt = db.prepare(`SELECT data FROM ${name} WHERE id = ?`)
  const putStmt = db.prepare(`INSERT INTO ${name} (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`)
  const insertStmt = db.prepare(`INSERT INTO ${name} (id, data) VALUES (?, ?)`)
  const deleteStmt = db.prepare(`DELETE FROM ${name} WHERE id = ?`)
  const scanStmt = db.prepare(`SELECT data FROM ${name} ORDER BY rowid`)

  return {
    get: (id) => parse(getStmt.get(String(id))),

    // Ghi đè toàn bộ item (giống PutCommand).
    put: (item) => {
      if (item?.id === undefined || item.id === null || item.id === '') throw new Error('Item thiếu id')
      putStmt.run(String(item.id), JSON.stringify(item))
      return item
    },

    // Chỉ thêm mới; ném lỗi CONFLICT nếu id đã tồn tại (tránh ghi đè ngầm).
    insert: (item) => {
      if (item?.id === undefined || item.id === null || item.id === '') throw new Error('Item thiếu id')
      try {
        insertStmt.run(String(item.id), JSON.stringify(item))
      } catch (err) {
        if (String(err.message).includes('UNIQUE')) {
          const conflict = new Error(`Bản ghi với id "${item.id}" đã tồn tại`)
          conflict.code = 'CONFLICT'
          throw conflict
        }
        throw err
      }
      return item
    },

    // Gộp các trường vào item hiện có. Trả về item mới, hoặc null nếu không tồn tại
    // (khác DynamoDB: không âm thầm tạo item mới khi update id sai).
    update: (id, fields) => {
      const current = parse(getStmt.get(String(id)))
      if (!current) return null
      const next = { ...current, ...fields, id: current.id }
      putStmt.run(String(id), JSON.stringify(next))
      return next
    },

    // Trả về true nếu có bản ghi bị xóa.
    remove: (id) => deleteStmt.run(String(id)).changes > 0,

    scan: () => scanStmt.all().map(parse),

    // Tìm theo một trường trong JSON (thay cho QueryCommand theo partition key).
    findBy: (field, value) => {
      if (!/^[A-Za-z0-9_]+$/.test(field)) throw new Error(`Tên trường không hợp lệ: ${field}`)
      return db
        .prepare(`SELECT data FROM ${name} WHERE json_extract(data, '$.${field}') = ? ORDER BY rowid`)
        .all(value)
        .map(parse)
    }
  }
}

export { db }
export default db
