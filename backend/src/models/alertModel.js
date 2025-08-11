const pool = require('../config/db');

// const findAlertByEmail = async (email) => {
//     const res = await pool.query('SELECT * FROM alertas WHERE email = $1', [
//         email
//     ]);
//     return res.rows[0];
// };

const createAlert = async ({
    id_product, fecha_alerta, canal, enviado_a, estado, mensaje
}) => {
    const res = await pool.query(
        `INSERT INTO alertas (id_product, fecha_alerta, canal, enviado_a, estado, mensaje) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_alerta;`,
        [id_product, fecha_alerta, canal, enviado_a, estado, mensaje]
    );
    return { id_alerta: res.rows[0].id_alerta, ...res.rows[0] };
};

const getAllAlerts = async () => {
    const res = await pool.query('SELECT id_alerta, id_product, fecha_alerta, canal, enviado_a, estado, mensaje FROM alertas');
    return res.rows;
};
const getAlertById = async (id_alerta) => {
    const res = await pool.query('SELECT id_alerta, id_product, fecha_alerta, canal, enviado_a, estado, mensaje FROM alertas WHERE id = $1', [id_alerta]);
    return res.rows[0];
};

const updateAlert = async (id_alerta, { name, role }) => {
    const res = await pool.query(
        'UPDATE alertas SET name = $1, role = $2 WHERE id_alerta = $3 RETURNING *',
        [name, role, id_alerta]
    );
    return res.rows[0];
};

const deleteAlert = async (id_alerta) => {
    await pool.query('DELETE FROM alertas WHERE id_alerta = $1', [id_alerta]);
};

const getAlertsByProductId = async (id_product) => {
    const res = await pool.query('SELECT * FROM alertas WHERE id_product = $1', [id_product]);
    return res.rows;
};

module.exports = {
    createAlert,
    getAllAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
    getAlertsByProductId
};

