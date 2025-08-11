const pool = require('../config/db');

const createServiceOrder = async ({ placa, vehiculo, modelo, cliente, nit, telefono, email, kilometraje, fecha_servicio, mecanicos, fotos }) => {

    const res = await pool.query(
        `INSERT INTO service_orders (placa, vehiculo, modelo, cliente, nit, telefono, email, 
         kilometraje, fecha_servicio, mecanicos) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id_service_order;`,
        [placa, vehiculo, modelo, cliente, nit, telefono, email, kilometraje, fecha_servicio,
            JSON.stringify(mecanicos)]
    );

    const orderId = res.rows[0].id;
    if (fotos && fotos.length > 0) {
        const photoQueries = fotos.map((foto) => {
            return pool.query(
                `INSERT INTO service_order_photos (order_id, photo_url) 
                 VALUES ($1, $2) RETURNING id;`,
                [orderId, foto]
            );
        });

        await Promise.all(photoQueries);
    }
    return { id: orderId, ...res.rows[0] };
}

const getAllServiceOrders = async () => {
    const res = await pool.query('SELECT * FROM service_orders ORDER BY id_service_order DESC');
    return res.rows;
};

const getServiceOrderById = async (id) => {
    const res = await pool.query('SELECT * FROM service_orders WHERE id_service_order = $1', [id]);
    return res.rows[0];
}

const updateServiceOrder = async (id, { placa, vehiculo, modelo, cliente, nit, telefono, email, kilometraje, fecha_servicio, mecanicos }) => {
    const res = await pool.query(
        `UPDATE service_orders 
         SET placa = $1, vehiculo = $2, modelo = $3, cliente = $4, nit = $5, telefono = $6, email = $7, 
             kilometraje = $8, fecha_servicio = $9, mecanicos = $10
         WHERE id_service_order = $11
         RETURNING *;`,
        [placa, vehiculo, modelo, cliente, nit, telefono, email, kilometraje, fecha_servicio,
            JSON.stringify(mecanicos), id]
    );
    return res.rows[0];
};

//La tabla used_parts tiene relacion con service_orders a traves de id_service_order y con la tabla products a traves de id_product
const addUsedParts = async (idServiceOrder, usedParts) => {
    const queries = usedParts.map(part => {
        return pool.query(
            `INSERT INTO used_parts (id_service_order, id_product, cantidad, observacion) 
             VALUES ($1, $2, $3, $4) RETURNING *;`,
            [idServiceOrder, part.id_product, part.cantidad, part.observacion]
        );
    });

    const results = await Promise.all(queries);
    return results.map(res => res.rows[0]);
};

module.exports = {
    createServiceOrder,
    getAllServiceOrders,
    getServiceOrderById,
    updateServiceOrder,
    addUsedParts
};