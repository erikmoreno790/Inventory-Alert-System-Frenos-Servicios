const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,     // tu correo Gmail
        pass: process.env.EMAIL_PASS      // clave de aplicación
    }
});

const sendLowStockAlert = async (product, emails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails.join(','),
        subject: `🚨 Alerta de Inventario: ${product.name}`,
        text: `El producto "${product.name}" tiene stock actual (${product.stock_actual}) menor que el mínimo (${product.stock_minimo}).`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendLowStockAlert };
