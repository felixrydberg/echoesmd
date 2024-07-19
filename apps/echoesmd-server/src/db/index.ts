import { Database } from 'bun:sqlite'
import type { EchoesServerOptions } from '../types';
import { encryptPassword } from '../utils';

const createDb = async (options: EchoesServerOptions) => {
  
  const db = new Database(options.database.database)
  db.exec("PRAGMA journal_mode = WAL;");
  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    admin BOOLEAN NOT NULL
  )`).run()
  db.query(`CREATE TABLE IF NOT EXISTS "documents" (
    "name" varchar(255) NOT NULL,
    "data" blob NOT NULL,
    UNIQUE(name)
  )`).run()
  db.query(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    uid INTEGER NOT NULL,
    token TEXT NOT NULL
  )`).run()
  db.query(`INSERT INTO users (username, password, admin) VALUES ('admin', '${await encryptPassword("admin")}', true)`).run()

  return {
    db,
  }
}

export {
  createDb
}
