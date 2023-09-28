import { env } from "bun";
import { Database } from 'bun:sqlite'

const DETA = env.DETA == null ? null : (await import('deta')).Deta(env.DETA).Drive(env.DETA_DRIVE ?? 'dfonline');
async function load() {
    if(DETA) {
        const res = await DETA.get(env.DETA_PATH ?? 'database.db');
        return res == null ? new Database(env.DB_PATH, { create: true }) : Database.deserialize(new Uint8Array(await res.arrayBuffer()));
        // oh and btw, if the deserialize call is returning a number, I fixed it by deleting node_modules, bun.lockb, and running bun i.
    }
    else {
        return new Database(env.DB_PATH, { create: true });
    }
}
async function save() {
    if(DETA) {
        const res = await DETA.put(env.DETA_PATH ?? 'database.db', { data: db.serialize() });
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
    uuid UUID PRIMARY KEY,
    username VARCHAR(16),
    token TEXT
);`)

function hash(key: string) {
    const hasher = new Bun.CryptoHasher("sha256");
    hasher.update(key);
    return hasher.digest('hex').toUpperCase();
}

export interface User {
    uuid: string,
    username: string,
    key: string,
}

/**
 * Securely saves a user. Will hash the key, so don't hash it before this.
 * This will overwrite any user with the same uuid.
 * @param uuid Minecraft UUID
 * @param username Minecraft Name
 * @param key Non-Hashed pure access key.
 */
export function setUser(uuid: string, username: string, key: string) {
    if(!uuid.match(/^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/)) throw new TypeError("Couldn't validate UUID");
    if(!username.match(/^\w{3,16}$/)) throw new TypeError("Couldn't validate username");
    db.query(`DELETE FROM users WHERE uuid = ?1`).run(uuid);
    db.query(`INSERT INTO users (uuid, username, token) VALUES (?1, ?2, ?3);`).run(uuid,username,hash(key));
    save();
}
/**
 * Delete a user.
 * @param user Any user value, such as uuid, name, hashed token.
 */
export function deleteUser(user : string) {
    db.query(`DELETE FROM users WHERE uuid = ?1 OR username = ?1 OR token = ?1`).run(user);
    save();
}
/**
 * Gets user data.
 * @param user Any user value, such as uuid, name, token hashed or not.
 */
export function getUser(user : string) : User | null {
    return db.query(`SELECT * FROM users WHERE uuid = ?1 OR username = ?1 OR token = ?1`).get(user) ?? authUser(user) as any;
}
/**
 * Safely get a user which needs authorization.
 * @param key Non-Hashed token
 * @returns The user authorized by token.
 */
export function authUser(key: string) : User | null {
    return db.query(`SELECT * FROM users WHERE token = ?`).get(hash(key)) as any;
}