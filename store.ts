import { env } from "bun";
import { Database } from 'bun:sqlite'


const IS_DETA = env.DETA == 'true';
async function load() {
    if(IS_DETA) {
        const res = await (await import('deta')).Drive('dfonline-oauth').get(env.DETA_PATH ?? 'database.db');
        return Database.deserialize( await res?.arrayBuffer() ?? new ArrayBuffer(0))
    }
    else {
        return new Database(env.DB_PATH, { create: true });
    }
}
async function save() {
    if(IS_DETA) {
        const res = await (await import('deta')).Drive('dfonline-oauth').put(env.DETA_PATH ?? 'database.db', { data: db.serialize() })
    }
    else {
        // tmk it saves anyway
        // :memory: enjoyers
        // time to for universe to collapse when someone uses my code in production in a critical scenario and have important data lost to this
        // "sir, what happened to the database" "well, have a look at this"
        // "what the f--"
    }
}

const db = await load();
db.run(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(16),
    token TEXT
);`)

function hash(key: string) {
    const hasher = new Bun.CryptoHasher("sha256");
    hasher.update(key);
    return hasher.digest('hex');
}

export interface User {
    uuid: string,
    username: string,
    key: string,
}

/**
 * Securely saves a user. Will hash the key, so don't hash it before this.
 * @param uuid Minecraft UUID
 * @param username Minecraft Name
 * @param key Non-Hashed pure access key.
 */
export function setUser(uuid: string, username: string, key: string) {
    db.query(`INSERT INTO users (id, username, token) VALUES (?, ?, ?);`).run(uuid,username,hash(key));
}
/**
 * Delete a user.
 * @param user Any user value, such as id, name, hashed token.
 */
export function deleteUser(user : string) {
    db.query(`DELETE FROM users WHERE id = ?1 OR username = ?1 OR token = ?1`).run(user);
}
/**
 * Gets user data.
 * @param user Any user value, such as id, name, token hashed or not.
 */
export function getUser(user : string) : User | null {
    return db.query(`SELECT * FROM users WHERE id = ?1 OR username = ?1 OR token = ?1`).get(user) ?? authUser(user) as any;
}
/**
 * Safely get a user which needs authorization.
 * @param key Non-Hashed token
 * @returns The user authorized by token.
 */
export function authUser(key: string) : User | null {
    return db.query(`SELECT * FROM users WHERE token = ?`).get(hash(key)) as any;
}