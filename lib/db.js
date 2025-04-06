import "dotenv/config";
import pkg from 'pg';


const { Pool }= pkg;
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
export const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: true,
  },
});
