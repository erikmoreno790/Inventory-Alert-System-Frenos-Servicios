import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.png";

const QuotationPDFView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef();

  // Intentar tomar datos de location.state, si no, del localStorage
  const quotation =
    location.state || JSON.parse(localStorage.getItem("currentQuotation"));

  if (!quotation) {
    return (
      <div className="p-6 text-center">
        <p>No hay datos de cotización para mostrar.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        >
          Volver
        </button>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `Cotizacion-${quotation.cliente || "cliente"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 print:bg-white">
      {/* 🔹 PLANTILLA PDF */}
      <div
        ref={pdfRef}
        className="bg-white p-8 rounded shadow max-w-3xl mx-auto"
        style={{ fontFamily: "Arial, sans-serif", color: "#333" }}
      >
        {/* 🔹 ENCABEZADO */}
        <header
          style={{
            backgroundColor: "#1E3A8A",
            color: "white",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: "70px", marginRight: "15px" }}
            />
            <h1 style={{ margin: 0, fontSize: "22px" }}>COTIZACIÓN</h1>
          </div>

          {/* Empresa y Redes */}
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <p style={{ margin: 0 }}>{quotation.empresa?.nombre}</p>
            <p style={{ margin: 0 }}>{quotation.empresa?.direccion}</p>
            <p style={{ margin: 0 }}>
              {quotation.empresa?.telefono} | {quotation.empresa?.email}
            </p>
            <p style={{ margin: 0 }}>{quotation.empresa?.redes}</p>
          </div>
        </header>

        {/* 🔹 DATOS DEL CLIENTE */}
        <section style={{ fontSize: "13px", marginBottom: "20px" }}>
          <p>
            <strong>Cliente:</strong> {quotation.cliente}
          </p>
          <p>
            <strong>NIT/CC:</strong> {quotation.nit}
          </p>
          <p>
            <strong>Teléfono:</strong> {quotation.telefono}
          </p>
          <p>
            <strong>Email:</strong> {quotation.email}
          </p>
          <p>
            <strong>Placa:</strong> {quotation.placa}
          </p>
          <p>
            <strong>Vehículo:</strong> {quotation.vehiculo}
          </p>
          <p>
            <strong>Modelo:</strong> {quotation.modelo}
          </p>
          <p>
            <strong>Kilometraje:</strong> {quotation.kilometraje}
          </p>
          <p>
            <strong>Fecha Vencimiento:</strong> {quotation.fechaVencimiento}
          </p>
        </section>

        {/* 🔹 TABLA DE PRODUCTOS/SERVICIOS */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#1E3A8A", color: "white" }}>
              <th style={thStyle}>Producto/Servicio</th>
              <th style={thStyle}>Cantidad</th>
              <th style={thStyle}>Precio Unitario</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.length > 0 ? (
              quotation.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{item.descripcion}</td>
                  <td style={tdStyle}>{item.cantidad}</td>
                  <td style={tdStyle}>${item.precio?.toFixed(2)}</td>
                  <td style={tdStyle}>
                    ${(item.cantidad * item.precio).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={tdStyle} colSpan="4">
                  No hay productos ni servicios
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 🔹 TOTALES */}
        <div
          style={{ textAlign: "right", marginTop: "20px", fontSize: "14px" }}
        >
          <p>
            <strong>Subtotal:</strong> ${quotation.subtotal?.toFixed(2)}
          </p>
          {quotation.discount > 0 && (
            <p>
              <strong>Descuento:</strong> -${quotation.discount?.toFixed(2)}
            </p>
          )}
          <p style={{ fontSize: "16px", fontWeight: "bold" }}>
            <strong>Total:</strong> ${quotation.total?.toFixed(2)}
          </p>
        </div>

        {/* 🔹 FIRMA */}
        <div style={{ marginTop: "40px", fontSize: "13px" }}>
          <p>
            <strong>Firma Cliente:</strong>
          </p>
          <div
            style={{
              borderTop: "1px solid #000",
              width: "200px",
              marginTop: "40px",
            }}
          ></div>
        </div>

        {/* 🔹 FOOTER */}
        <footer
          style={{
            borderTop: "1px solid #ddd",
            marginTop: "40px",
            paddingTop: "10px",
            textAlign: "center",
            fontSize: "11px",
            color: "#666",
          }}
        >
          <p>
            © {new Date().getFullYear()} {quotation.empresa?.nombre}. Todos los
            derechos reservados.
          </p>
          <p>
            Desarrollado por <strong>Erik Moreno</strong> | Contacto:{" "}
            <a href="mailto:tuemail@test.com">tuemail@test.com</a>
          </p>
        </footer>
      </div>

      {/* 🔹 BOTONES */}
      <div className="text-center mt-6 no-print">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Regresar
        </button>
        <button
          onClick={handleDownloadPDF}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Descargar PDF
        </button>
        <button
          onClick={() => window.print()}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Imprimir
        </button>
      </div>

      {/* 🔹 ESTILOS PRINT */}
      <style>
        {`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  textAlign: "center",
};

export default QuotationPDFView;
