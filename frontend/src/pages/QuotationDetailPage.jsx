// QuotationDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [status, setStatus] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar cotización
  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get(`/quotations/${id}`, config);
      setQuotation(data);
      setStatus(data.estatus);
    } catch (err) {
      console.error(err);
      alert("Error cargando cotización");
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  // 🔹 Actualizar estado
  const updateStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.put(`/quotations/${id}`, { estatus: status }, config);
      alert("Estado actualizado");
      fetchQuotation();
    } catch (err) {
      console.error(err);
      alert("Error actualizando estado");
    }
  };

  // 🔹 Navegar a PDF
  const handlePrint = () => {
    localStorage.setItem("currentQuotation", JSON.stringify(quotation));
    navigate("/cotizacion-pdf", { state: quotation });
  };

  if (!quotation) {
    return (
      <div className="p-6 text-center">
        <p>Cargando cotización...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : ""} transition-all`}>
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Detalle de Cotización</h1>

          {/* 🔹 Datos generales */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Cliente:</strong> {quotation.cliente}</p>
              <p><strong>Teléfono:</strong> {quotation.telefono}</p>
              <p><strong>Email:</strong> {quotation.email}</p>
              <p><strong>Placa:</strong> {quotation.placa}</p>
              <p><strong>Vehículo:</strong> {quotation.vehiculo}</p>
              <p><strong>Kilometraje:</strong> {quotation.kilometraje}</p>
              <p><strong>Fecha:</strong> {new Date(quotation.fecha).toLocaleDateString()}</p>
              <p><strong>Observaciones:</strong> {quotation.observaciones || "N/A"}</p>
            </div>
          </div>

          {/* 🔹 Items */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Servicios / Productos</h2>
            <table className="w-full border-collapse border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Cantidad</th>
                  <th className="border p-2">Precio Unitario</th>
                  <th className="border p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items?.length > 0 ? (
                  quotation.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-2">{item.descripcion}</td>
                      <td className="border p-2 text-center">{item.cantidad}</td>
                      <td className="border p-2 text-center">${item.precio.toFixed(2)}</td>
                      <td className="border p-2 text-center">
                        ${(item.cantidad * item.precio).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No hay items registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔹 Totales */}
          <div className="bg-white shadow rounded p-4 mb-6 text-right">
            <p><strong>Subtotal:</strong> ${quotation.subtotal?.toFixed(2)}</p>
            {quotation.descuento > 0 && (
              <p><strong>Descuento:</strong> -${quotation.descuento?.toFixed(2)}</p>
            )}
            <p className="text-lg font-bold"><strong>Total:</strong> ${quotation.total?.toFixed(2)}</p>
          </div>

          {/* 🔹 Acciones */}
          <div className="bg-white shadow rounded p-4 flex justify-between items-center">
            <div>
              <label className="mr-2 font-semibold">Estado:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
              <button
                onClick={updateStatus}
                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Guardar Estado
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Volver
              </button>
              <button
                onClick={handlePrint}
                className="ml-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Imprimir / PDF
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationDetailPage;
