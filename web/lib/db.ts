import Database from 'better-sqlite3';
import path from 'path';

// Database file stored in project root
const DB_PATH = path.join(process.cwd(), 'data', 'prices.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read/write performance
db.pragma('journal_mode = WAL');

// Create prices table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pair TEXT NOT NULL,
        price REAL NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_pair_timestamp ON price_history(pair, timestamp);
`);

export interface PriceRecord {
    id: number;
    pair: string;
    price: number;
    timestamp: number;
}

// Insert a price record
export function insertPrice(pair: string, price: number, timestamp: number): void {
    const stmt = db.prepare('INSERT INTO price_history (pair, price, timestamp) VALUES (?, ?, ?)');
    stmt.run(pair, price, timestamp);
}

// Insert multiple prices at once (for batch inserts)
export function insertPrices(records: { pair: string; price: number; timestamp: number }[]): void {
    const stmt = db.prepare('INSERT INTO price_history (pair, price, timestamp) VALUES (?, ?, ?)');
    const insertMany = db.transaction((items: typeof records) => {
        for (const item of items) {
            stmt.run(item.pair, item.price, item.timestamp);
        }
    });
    insertMany(records);
}

// Get historical prices for a pair within a time range
export function getPriceHistory(
    pair: string,
    fromTimestamp: number,
    toTimestamp: number,
    limit: number = 1000
): PriceRecord[] {
    const stmt = db.prepare(`
        SELECT id, pair, price, timestamp 
        FROM price_history 
        WHERE pair = ? AND timestamp >= ? AND timestamp <= ?
        ORDER BY timestamp ASC
        LIMIT ?
    `);
    return stmt.all(pair, fromTimestamp, toTimestamp, limit) as PriceRecord[];
}

// Get the latest price for a pair
export function getLatestPrice(pair: string): PriceRecord | undefined {
    const stmt = db.prepare(`
        SELECT id, pair, price, timestamp 
        FROM price_history 
        WHERE pair = ?
        ORDER BY timestamp DESC
        LIMIT 1
    `);
    return stmt.get(pair) as PriceRecord | undefined;
}

// Get the oldest price for a pair (for checking data availability)
export function getOldestPrice(pair: string): PriceRecord | undefined {
    const stmt = db.prepare(`
        SELECT id, pair, price, timestamp 
        FROM price_history 
        WHERE pair = ?
        ORDER BY timestamp ASC
        LIMIT 1
    `);
    return stmt.get(pair) as PriceRecord | undefined;
}

// Get price count for a pair (for stats)
export function getPriceCount(pair: string): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM price_history WHERE pair = ?');
    const result = stmt.get(pair) as { count: number };
    return result.count;
}

// Clean up old prices (keep last N days)
export function cleanupOldPrices(daysToKeep: number = 7): number {
    const cutoffTimestamp = Math.floor(Date.now() / 1000) - (daysToKeep * 24 * 60 * 60);
    const stmt = db.prepare('DELETE FROM price_history WHERE timestamp < ?');
    const result = stmt.run(cutoffTimestamp);
    return result.changes;
}

// Close database connection (for graceful shutdown)
export function closeDb(): void {
    db.close();
}

export default db;
