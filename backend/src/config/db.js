const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');

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

/*(async () => {
  try {
    const nombre = 'Erik';
    const email = 'admin@gmail.com';
    const telefono = '3001234567';
    const password = '1234'; // en texto plano solo aquí
    const rol = 'admin';

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en la base
    const res = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, email, rol`,
      [nombre, email, telefono, hashedPassword, rol]
    );

    console.log('Usuario creado:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
})();*/

module.exports = pool;

