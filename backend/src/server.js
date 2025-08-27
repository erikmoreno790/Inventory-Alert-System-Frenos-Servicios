const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const alertRoutes = require('./routes/alertRoutes');
const serviceOrderRoutes = require('./routes/serviceOrderRoutes');
const quotationRoutes = require('./routes/quotationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/service-orders', serviceOrderRoutes);
app.use('/api/quotations', quotationRoutes);


app.listen(PORT, HOST, () => {
    console.log(`✅ Servidor corriendo en http://${HOST}:${PORT}`);
    console.log(`🔗 URL de la API: http://${HOST}:${PORT}/api`);
    console.log(`🔐 Entorno: ${process.env.NODE_ENV || 'desarrollo'}`);
    console.log(`📦 Base de datos: ${process.env.DB_NAME || 'no definida'}`);
});
