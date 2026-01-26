import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

const client = new Client({
    connectionString: connectionString.replace(':6543', ':5432'),
    ssl: {
        rejectUnauthorized: false
    }
});

async function test() {
    console.log('Testing connection to Supabase...');
    try {
        await client.connect();
        console.log('SUCCESS: Connected to Supabase!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('CONNECTION FAILED:');
        console.error(err);
        process.exit(1);
    }
}

test();
