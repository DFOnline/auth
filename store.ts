import { env, sha } from "bun";
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


/**
 * Securely saves a user. Will hash the key, so don't hash it before this.
 * @param uuid Minecraft UUID
 * @param username Minecraft Name
 * @param key Non-Hashed pure access key.
 */
export function setUser(uuid: string, username: string, key: string) {
    const hasher = new Bun.CryptoHasher("sha256");
    hasher.update(key);
    db.query(`INSERT INTO users (id, username, token) VALUES (?, ?, ?);`).run(uuid,username,hasher.digest('base64'));
}
/**
 * Gets user data.
 * @param user UUID, username or (hashed) key.
 */
export function getUser(user : string) : {uuid: string, username: string, key: string} {
    throw new Error("Unimpleneted")
    // TODO: this
}