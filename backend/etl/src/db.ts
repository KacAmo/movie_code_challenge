import pgPromise, { IMain, IDatabase } from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp: IMain = pgPromise();

const dbConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB,
};

export const db: IDatabase<any> = pgp(dbConfig);

export { pgp };