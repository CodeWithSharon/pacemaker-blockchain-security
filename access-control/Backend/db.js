// Backend/db.js
// MySQL connection pool — mirrors blockchain writes for fast querying.
// The blockchain remains the source of truth; MySQL is a parallel cache.

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'pacemaker_security',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected:', process.env.DB_NAME || 'pacemaker_security');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Backend will continue running, but MySQL mirror writes will fail silently.');
    return false;
  }
}

async function insertIdsAlert(data) {
  const {
    patientId, patientDetails, attackType, alteredFrequency,
    previousFrequency, source, ipfsHash, severity, deviceModel,
    riskCategory, txHash, blockNumber,
  } = data;

  try {
    await pool.execute(
      `INSERT INTO ids_alerts
        (patient_id, patient_details, attack_type, altered_frequency, previous_frequency,
         source, ipfs_hash, severity, device_model, risk_category, tx_hash, block_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patientId, patientDetails, attackType, alteredFrequency, previousFrequency,
       source, ipfsHash, severity, deviceModel, riskCategory, txHash, blockNumber]
    );
  } catch (err) {
    console.error('⚠️  MySQL mirror write failed (ids_alerts):', err.message);
  }
}

async function insertAccessLog(data) {
  const { userAddress, purpose, roles, success, reason, txHash, blockNumber } = data;
  try {
    await pool.execute(
      `INSERT INTO access_logs
        (user_address, purpose, roles, success, reason, tx_hash, block_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userAddress, purpose, (roles || []).join(','), success ? 1 : 0, reason, txHash, blockNumber]
    );
  } catch (err) {
    console.error('⚠️  MySQL mirror write failed (access_logs):', err.message);
  }
}

async function getIdsAlertsFromDB(limit = 50) {
  const safeLimit = Number.isInteger(limit) ? limit : 50;
  const [rows] = await pool.query(
    `SELECT * FROM ids_alerts ORDER BY id DESC LIMIT ${safeLimit}`
  );
  return rows;
}

async function getAccessLogsFromDB(limit = 50) {
  const safeLimit = Number.isInteger(limit) ? limit : 50;
  const [rows] = await pool.query(
    `SELECT * FROM access_logs ORDER BY id DESC LIMIT ${safeLimit}`
  );
  return rows;
}

module.exports = {
  pool,
  testConnection,
  insertIdsAlert,
  insertAccessLog,
  getIdsAlertsFromDB,
  getAccessLogsFromDB,
};