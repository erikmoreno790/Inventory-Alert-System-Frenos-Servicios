const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.connect()
    .then(() => {
        console.log('✅ Conexión a PostgreSQL exitosa');
    })
    .catch((err) => {
        console.error('❌ Error al conectar a PostgreSQL:', err.message);
    });

module.exports = pool;

module.exports = pool;
