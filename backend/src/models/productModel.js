const pool = require('../config/db');

const createProduct = async ({ nombre, descripcion, stock_actual, stock_minimo, categoria }) => {
    const res = await pool.query(
        `INSERT INTO products (nombre, descripcion, stock_actual, stock_minimo, categoria) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [nombre, descripcion, stock_actual, stock_minimo, categoria]
    );
    return res.rows[0];
};

// Crea un producto nuevo con solo el nombre
const createProductWithName = async (nombre) => {
    const res = await pool.query(
        `INSERT INTO products (nombre) 
     VALUES ($1) RETURNING *`,
        [nombre]
    );
    return res.rows[0];
};

const getAllProducts = async () => {
    const res = await pool.query('SELECT * FROM products ORDER BY id_product');
    return res.rows;
};

const getProductById = async (id) => {
    const res = await pool.query('SELECT * FROM products WHERE id_product = $1', [id]);
    return res.rows[0];
};

// Busca un producto por nombre
const getProductByName = async (nombre) => {
    const res = await pool.query('SELECT * FROM products WHERE nombre ILIKE $1 LIMIT 10', [`%${nombre}%`]);
    return res.rows;
};

const updateProduct = async (id, data) => {
    const { nombre, descripcion, stock_actual, stock_minimo, categoria } = data;
    const res = await pool.query(
        `UPDATE products SET nombre = $1, description = $2, stock_actual = $3, 
     stock_minimo = $4, categoria = $5 WHERE id_product = $6 RETURNING *`,
        [nombre, descripcion, stock_actual, stoid_productck_minimo, categoria, id]
    );
    return res.rows[0];
};

const deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id_product = $1', [id]);
};

const getLowStockProducts = async () => {
    const res = await pool.query(
        `SELECT * FROM products WHERE stock_actual < stock_minimo ORDER BY stock_actual`
    );
    return res.rows;
};

// Funcion para actualizar el stock de un producto cuando se registra un movimiento (entrada o salida)
const updateStock = async (id, cantidad, tipo, fecha, id_usuario, observaciones) => {
    // Verificar si el producto existe
    const product = await getProductById(id);
    if (!product) {
        throw new Error(`Producto con ID ${id} no encontrado`);
    }
    // Verificar si la cantidad no agota el stock
    if (product.stock_actual + cantidad < 0) {
        throw new Error(`No hay suficiente stock para realizar esta operación`);
    }

    // Si tipo es 'entrada', la cantidad se debe sumar al stock actual y si es 'salida', se debe restar
    if (tipo === 'entrada') {
        cantidad = Math.abs(cantidad); // Asegurarse de que la cantidad sea positiva
    }
    if (tipo === 'salida') {
        cantidad = -Math.abs(cantidad); // Asegurarse de que la cantidad sea negativa
    }

    // Registrar el movimiento en la tabla movimientos_stock
    await pool.query(
        `INSERT INTO movimientos_stock (id_product, cantidad, tipo, fecha, id_usuario, observaciones) VALUES ($1, $2, $3, $)`,
        [id, cantidad, tipo, fecha, id_usuario, observaciones]
    );
    // Actualizar el stock del producto segundo el tipo de movimiento
    const newStock = product.stock_actual + cantidad;
    const res = await pool.query(
        `UPDATE products SET stock_actual = $1 WHERE id_product = $2 RETURNING *`,
        [newStock, id]
    );

    checkStockAlert(id); // Llamar a la función para verificar si se debe enviar una alerta

    // Funcion que ejecuta una alerta si el stock del producto es menor al stock minimo
    const checkStockAlert = async (id) => {
        const product = await getProductById(id);
        if (product.stock_actual < product.stock_minimo) {
            console.log(`Alerta: El stock del producto ${product.nombre} es menor al mínimo permitido.`);
            // Aquí podrías enviar una notificación o realizar alguna acción adicional
        }
    };

    return res.rows[0];
}


const getMovementsByProductId = async (id) => {
    const res = await pool.query(
        `SELECT * FROM movimientos_stock WHERE id_product = $1 ORDER BY created_at DESC`,
        [id]
    );
    return res.rows;
};

const getAllCategories = async () => {
  const res = await pool.query(`
    SELECT id_categoria, nombre
    FROM categorias
    ORDER BY nombre
  `);
  return res.rows; // [{id_categoria: 1, nombre: 'Frenos'}, ...]
};

const getAllProviders= async () => {
  const res = await pool.query(`
    SELECT id_categoria, nombre
    FROM categorias
    ORDER BY nombre
  `);
  return res.rows; // [{id_categoria: 1, nombre: 'Frenos'}, ...]
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    updateStock,
    getMovementsByProductId,
    getAllCategories,
    getAllProviders,
    getProductByName,
    createProductWithName
};
