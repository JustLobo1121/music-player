// @ts-ignore: react-native-sqlite-storage does not provide TypeScript declarations.
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export async function initDB() {
    const db = await SQLite.openDatabase({ name: 'vimusic.db', location: 'default' });

    await db.executeSql(`
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            title TEXT,
            artist TEXT,
            thumbnailUrl TEXT,
            playedAt INTEGER
        );
    `);

    return db;
}
