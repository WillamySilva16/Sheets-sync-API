const sql = require('mssql');
const logger = require('./logger');

const isDemoMode = () => process.env.DEMO_MODE === 'true';

/** @type {sql.ConnectionPool | null} */
let pool = null;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

/**
 * Obtem (ou cria) o pool de conexao com o SQL Server.
 * Em DEMO_MODE=true nao tenta conectar de verdade - fica so a API funcional
 * pra quem for testar o projeto sem ter um banco na mao.
 */
async function getPool() {
  if (isDemoMode()) return null;

  if (pool) return pool;

  try {
    pool = await sql.connect(dbConfig);
    logger.info('Conectado ao SQL Server', { server: dbConfig.server, database: dbConfig.database });
    return pool;
  } catch (err) {
    logger.error('Falha ao conectar no SQL Server', { error: err.message });
    throw err;
  }
}

module.exports = { getPool, isDemoMode, sql };
