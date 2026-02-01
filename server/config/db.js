import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

let finalUrl = process.env.DATABASE_URL;
let connectionMethod = "Primary (Pooler)";
let sequelizeInstance = null;

// Automatic Failover Logic for Render
const initDatabase = async () => {
  const isRender = process.env.RENDER || process.env.RENDER_SERVICE_ID;

  // Default configuration for local/development
  let dbConfig = {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      keepAlive: true,
      connectTimeout: 60000,
      family: 4 // Hint for IPv4
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 1000
    },
    retry: {
      match: [/Deadlock/i, /SequelizeConnectionError/i, /SequelizeConnectionRefusedError/i, /SequelizeHostNotFoundError/i, /SequelizeHostNotReachableError/i, /SequelizeInvalidConnectionError/i, /SequelizeConnectionTimedOutError/i, /TimeoutError/i],
      max: 3
    }
  };

  if (isRender && finalUrl && finalUrl.includes('pooler.supabase.com')) {
    console.log('[DB] Render detected with Pooler URL. Attempting to force IPv4...');

    try {
      // Parse the pooler URL
      const poolerUrlParts = new URL(finalUrl);
      const hostname = poolerUrlParts.hostname;

      console.log(`[DB] Resolving Pooler DNS for ${hostname} to force IPv4...`);
      const addresses = await dns.promises.resolve4(hostname);
      const ipAddress = addresses[0];
      console.log(`[DB] Resolved ${hostname} to ${ipAddress}`);

      // Construct configuration with explicit IP and SNI
      const poolerConfig = {
        ...dbConfig,
        host: ipAddress,
        port: 6543, // Pooler port
        dialectOptions: {
          ...dbConfig.dialectOptions,
          ssl: {
            require: true,
            rejectUnauthorized: false,
            servername: hostname // CRITICAL for SNI
          }
        }
      };

      // Probe with the forced IPv4 connection
      const probeSequelize = new Sequelize(
        poolerUrlParts.pathname.substring(1), // db name (usually postgres)
        poolerUrlParts.username,
        poolerUrlParts.password,
        poolerConfig
      );

      // Give it 10 seconds to authenticate (bumped from 5)
      await Promise.race([
        probeSequelize.authenticate(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Pooler probe timeout')), 10000))
      ]);

      console.log('[DB] Pooler is reachable via IPv4. Using primary connection.');
      sequelizeInstance = probeSequelize; // Reuse the successful instance
      return sequelizeInstance;

    } catch (err) {
      console.warn('[DB] Pooler probe failed (IPv4 forced):', err.message);
      console.log('[DB] Switching to DIRECT CONNECTION fallback...');

      // ... Failover logic (Direct) ...
      // We keep this just in case, even though we know Direct is likely IPv6 only.
      // Maybe we can try to resolve Direct to IPv4 too? (We saw ENODATA, but worth keeping the logic robust)

      // Convert Pooler URL to Direct URL keys
      try {
        const urlMatch = finalUrl.match(/postgresql:\/\/postgres\.([^:]+):([^@]+)@/);
        if (urlMatch) {
          const projectId = urlMatch[1];
          const password = urlMatch[2];
          const hostname = `db.${projectId}.supabase.co`;

          console.log(`[DB] Resolving DNS for ${hostname} to force IPv4 (Fallback)...`);
          try {
            const addresses = await dns.promises.resolve4(hostname);
            const ipAddress = addresses[0];
            console.log(`[DB] Resolved ${hostname} to ${ipAddress}`);

            connectionMethod = "Fallback (Direct - IPv4)";

            sequelizeInstance = new Sequelize(
              'postgres', // db name
              'postgres', // user
              password,   // password
              {
                ...dbConfig,
                host: ipAddress,
                port: 5432,
                dialectOptions: {
                  ...dbConfig.dialectOptions,
                  ssl: {
                    require: true,
                    rejectUnauthorized: false,
                    servername: hostname
                  }
                }
              }
            );
            console.log('[DB] Failover configuration created (Direct IP).');
          } catch (dnsErr) {
            console.error('[DB] DNS resolution failed for Fallback:', dnsErr.message);
            // Fallback to standard URL
            finalUrl = `postgresql://postgres:${password}@${hostname}:5432/postgres`;
            connectionMethod = "Fallback (Direct - Standard)";
            sequelizeInstance = new Sequelize(finalUrl, dbConfig);
          }
        } else {
          console.error('[DB] Could not parse DATABASE_URL for failover. Using original.');
          sequelizeInstance = new Sequelize(finalUrl, dbConfig);
        }
      } catch (parseErr) {
        console.error('[DB] Critical error parsing failover URL:', parseErr.message);
        sequelizeInstance = new Sequelize(finalUrl, dbConfig);
      }
    }
  } else {
    // Non-Render or non-pooler environment
    sequelizeInstance = finalUrl
      ? new Sequelize(finalUrl, dbConfig)
      : new Sequelize(
        process.env.DB_NAME || 'odoo_cafe_pos',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASS || 'postgres',
        {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          dialect: 'postgres',
          logging: false,
        }
      );
  }

  return sequelizeInstance;
};

// We need to export a promise or a way to get the instance, but existing code expects a direct export.
// Refactoring to top-level await would be ideal but might break older node environments or require package.json changes.
// Since we are in a module (server.js uses import), top-level await IS supported in newer Node versions.
// checking package.json: "type": "module", engines: ">=18.0.0". Top level await is safe.

// Await the initialization
try {
  sequelizeInstance = await initDatabase();
} catch (e) {
  console.error('[DB] Critical initialization error:', e);
  // Fallback minimal instance to prevent crash on import, though app will likely fail later
  sequelizeInstance = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/dummy', { dialect: 'postgres' });
}

const sequelize = sequelizeInstance;

// Test the connection with retries
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log(`[DB] PostgreSQL connected via ${connectionMethod}`);
      return;
    } catch (err) {
      console.error(`[DB] Connection attempt ${i + 1} failed (${connectionMethod}):`, err.message);
      if (i < retries - 1) {
        console.log(`[DB] Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('[DB] Max retries reached. Exiting.');
        throw err;
      }
    }
  }
};

export { connectWithRetry, connectionMethod };
export default sequelize;
