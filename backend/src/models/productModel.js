const pool = require('../config/db');

const RepuestoModel = {
    // Crear un nuevo repuesto
    async createRepuesto(nombre, id_categoria, stock_actual, stock_minimo) {
        const query = `
      INSERT INTO repuestos (nombre, id_categoria, stock_actual, stock_minimo)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const values = [nombre, id_categoria, stock_actual, stock_minimo];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Obtener todos los repuestos
    async getAllRepuestos() {
        const query = `
      SELECT r.id_product, r.nombre, r.stock_actual, r.stock_minimo, c.nombre AS categoria
      FROM repuestos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      ORDER BY r.id_product ASC;
    `;
        const { rows } = await pool.query(query);
        return rows;
    },

    //Obtener todas las categorías
    async getAllCategorias() {
        const query = `SELECT * FROM categorias ORDER BY nombre ASC;`;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener todos los proveedores
    async getProviders() {
        const query = `SELECT * FROM proveedores ORDER BY nombre ASC;`;
        const { rows } = await pool.query(query);
        return rows;
    },

    // Obtener un repuesto por ID
    async getRepuestoById(id_product) {
        const query = `SELECT * FROM repuestos WHERE id_product = $1;`;
        const values = [id_product];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Eliminar un repuesto
    async deleteRepuesto(id_product) {
        const query = `DELETE FROM repuestos WHERE id_product = $1 RETURNING *;`;
        const values = [id_product];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 🔍 Buscar repuestos por nombre (útil para buscador)
    async searchRepuestosByName(searchTerm) {
        const query = `
      SELECT r.*, c.nombre AS categoria
      FROM repuestos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      WHERE LOWER(r.nombre) LIKE LOWER($1)
      ORDER BY r.nombre ASC;
    `;
        const values = [`%${searchTerm}%`];
        const { rows } = await pool.query(query, values);
        return rows;
    },

    // Buscar repuestos por categoría (útil para filtros)
    async searchRepuestosByCategory(category) {
        const query = `
      SELECT r.*, c.nombre AS categoria
        FROM repuestos r
        JOIN categorias c ON r.id_categoria = c.id_categoria
        WHERE LOWER(c.nombre) = LOWER($1)
        ORDER BY r.nombre ASC;
    `;
        const values = [category];
        const { rows } = await pool.query(query, values);
        return rows;
    },

    // 📦 Obtener repuestos con stock por debajo del mínimo
    async getLowStockRepuestos() {
        const query = `
      SELECT r.*, c.nombre AS categoria
      FROM repuestos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      WHERE r.stock_actual < r.stock_minimo
      ORDER BY r.stock_actual ASC;
    `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // 📊 Contar el total de repuestos registrados
    async countRepuestos() {
        const query = `SELECT COUNT(*) FROM repuestos;`;
        const { rows } = await pool.query(query);
        return parseInt(rows[0].count, 10);
    },

    // 🔗 Obtener todos los repuestos de una categoría específica
    async getRepuestosByCategoria(id_categoria) {
        const query = `
      SELECT r.*, c.nombre AS categoria
      FROM repuestos r
      JOIN categorias c ON r.id_categoria = c.id_categoria
      WHERE r.id_categoria = $1
      ORDER BY r.nombre ASC;
    `;
        const values = [id_categoria];
        const { rows } = await pool.query(query, values);
        return rows;
    },

    // 🔢 Actualizar stock de un repuesto sumando o restando cantidad
    async updateStock(id_product, cantidad) {
        const query = `
      UPDATE repuestos
      SET stock_actual = stock_actual + $1
      WHERE id_product = $2
      RETURNING *;
    `;
        const values = [cantidad, id_product];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // Actualizar un repuesto
    async updateRepuesto(id_product, nombre, id_categoria, stock_actual, stock_minimo) {
        const query = `
      UPDATE repuestos
      SET nombre = $1, id_categoria = $2, stock_actual = $3, stock_minimo = $4
      WHERE id_product = $5
      RETURNING *;
    `;
        const values = [nombre, id_categoria, stock_actual, stock_minimo, id_product];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

}

module.exports = RepuestoModel;
