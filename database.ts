import Database from "better-sqlite3"
import path from "path"
const DB_PATH = process.env.NODE_ENV === "production" ? "/data/xkc_os.db" : "./xkc_os.db"
const db = new Database(DB_PATH)
db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP); CREATE TABLE IF NOT EXISTS terminal_history (id INTEGER PRIMARY KEY AUTOINCREMENT, command TEXT NOT NULL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`)
export function getSetting(key: string): string | null { const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as any; return row ? row.value : null }
export function setSetting(key: string, value: string): void { db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)").run(key, value) }
export function addHistory(command: string): void { db.prepare("INSERT INTO terminal_history (command) VALUES (?)").run(command); db.prepare("DELETE FROM terminal_history WHERE id NOT IN (SELECT id FROM terminal_history ORDER BY id DESC LIMIT 50)").run() }
export function getHistory(): Array<{command: string, timestamp: string}> { return db.prepare("SELECT command, timestamp FROM terminal_history ORDER BY id DESC LIMIT 50").all() as any }
export default db
